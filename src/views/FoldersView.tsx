import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client';
import type { Folder, Genre } from '../types';

export const FoldersView: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | ''>('');
  const [filterGenreId, setFilterGenreId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [foldersData, genresData] = await Promise.all([
        api.getFolders(),
        api.getGenres(),
      ]);
      setFolders(foldersData);
      setGenres(genresData);
      if (genresData.length > 0 && selectedGenreId === '') {
        setSelectedGenreId(genresData[0].id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load folders and genres.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name || selectedGenreId === '') return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await api.createFolder(name, Number(selectedGenreId));
      setSuccessMessage(`Folder "${created.name}" created successfully (ID #${created.id}).`);
      setNewFolderName('');
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create folder.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFolder = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the folder "${name}"? All contained images will be deleted.`)) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.deleteFolder(id);
      setSuccessMessage(`Folder "${name}" deleted successfully.`);
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to delete folder.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  const filteredFolders = folders.filter((f) => {
    if (filterGenreId === 'all') return true;
    return f.genre_id === Number(filterGenreId);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Creation Form */}
      <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={20} className="text-primary" />
          <h2 className="font-montserrat font-bold text-lg text-white">
            Create New Project Folder
          </h2>
        </div>
        {genres.length === 0 ? (
          <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300 text-xs">
            No genres available. Please create at least one genre in the Genres tab before adding a folder.
          </div>
        ) : (
          <form onSubmit={handleCreateFolder} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Minimalist Villa, Brand Redesign"
              required
              className="px-4 py-2.5 bg-secondary border border-neutral-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary placeholder:text-neutral/60"
            />

            <select
              value={selectedGenreId}
              onChange={(e) => setSelectedGenreId(Number(e.target.value))}
              required
              className="px-3.5 py-2.5 bg-secondary border border-neutral-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            >
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  Belongs to: {g.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isSubmitting || !newFolderName.trim() || selectedGenreId === ''}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-montserrat font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Creating...' : 'Create Folder'}</span>
            </button>
          </form>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-emerald-300 text-xs">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Folders List */}
      <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider">
            Folders ({filteredFolders.length})
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral">Filter by genre:</span>
            <select
              value={filterGenreId}
              onChange={(e) => setFilterGenreId(e.target.value)}
              className="px-2.5 py-1.5 bg-secondary border border-neutral-dark text-white rounded text-xs focus:outline-none focus:border-primary"
            >
              <option value="all">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-neutral-dark text-neutral-light hover:text-white rounded text-xs cursor-pointer ml-1"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-xs text-neutral py-8 text-center">Loading folders...</p>
        ) : filteredFolders.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen size={32} className="mx-auto text-neutral/40 mb-2" />
            <p className="text-sm text-neutral">No folders found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-dark text-xs uppercase font-montserrat font-semibold text-neutral">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Folder Name</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-dark/50">
                {filteredFolders.map((folder) => (
                  <tr key={folder.id} className="hover:bg-surface-hover/50">
                    <td className="py-3.5 px-4 text-xs font-mono text-neutral">
                      #{folder.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {folder.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary border border-neutral-dark text-xs text-neutral-light">
                        {genreMap.get(folder.genre_id) || `Genre #${folder.genre_id}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteFolder(folder.id, folder.name)}
                        disabled={deletingId === folder.id}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded cursor-pointer disabled:opacity-50"
                        title="Delete folder"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
