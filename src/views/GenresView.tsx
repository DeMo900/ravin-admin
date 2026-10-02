import React, { useEffect, useState } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { api } from '../api/client';
import type { Genre } from '../types';

export const GenresView: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [selectedGenreDetails, setSelectedGenreDetails] = useState<Genre | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchGenres = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getGenres();
      setGenres(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load genres.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newGenreName.trim();
    if (!name) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await api.createGenre(name);
      setSuccessMessage(`Genre "${created.name}" created successfully (ID #${created.id}).`);
      setNewGenreName('');
      await fetchGenres();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create genre.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGenre = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the genre "${name}"? This may cascade to all its folders and images.`)) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.deleteGenre(id);
      setSuccessMessage(`Genre "${name}" deleted successfully.`);
      if (selectedGenreDetails?.id === id) {
        setSelectedGenreDetails(null);
      }
      await fetchGenres();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to delete genre.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewGenre = async (id: number) => {
    try {
      const details = await api.getGenreById(id);
      setSelectedGenreDetails(details);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Creation Form */}
      <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderTree size={20} className="text-primary" />
          <h2 className="font-montserrat font-bold text-lg text-white">
            Create New Genre
          </h2>
        </div>
        <form onSubmit={handleCreateGenre} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="e.g. Architecture, Visual Identity, 3D Visualization"
            required
            className="flex-1 px-4 py-2.5 bg-secondary border border-neutral-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary placeholder:text-neutral/60"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newGenreName.trim()}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-montserrat font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>{isSubmitting ? 'Creating...' : 'Create Genre'}</span>
          </button>
        </form>

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

      {/* Genres List */}
      <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider">
              All Genres ({genres.length})
            </h3>
          </div>
          <button
            onClick={fetchGenres}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-neutral-dark text-neutral-light hover:text-white rounded-md text-xs cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <p className="text-xs text-neutral py-8 text-center">Loading genres...</p>
        ) : genres.length === 0 ? (
          <div className="text-center py-8">
            <FolderTree size={32} className="mx-auto text-neutral/40 mb-2" />
            <p className="text-sm text-neutral">No genres found. Create one above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-dark text-xs uppercase font-montserrat font-semibold text-neutral">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Genre Name</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-dark/50">
                {genres.map((genre) => (
                  <tr key={genre.id} className="hover:bg-surface-hover/50">
                    <td className="py-3.5 px-4 text-xs font-mono text-neutral">
                      #{genre.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {genre.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleViewGenre(genre.id)}
                        className="text-xs text-neutral-light hover:text-white underline cursor-pointer"
                      >
                        Inspect Folders
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteGenre(genre.id, genre.name)}
                        disabled={deletingId === genre.id}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded cursor-pointer disabled:opacity-50"
                        title="Delete genre"
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

      {/* Selected Genre Detail Modal/Card */}
      {selectedGenreDetails && (
        <div className="bg-surface-card border border-primary/40 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen size={18} className="text-primary" />
              <h3 className="font-montserrat font-bold text-white text-sm">
                Folders in &quot;{selectedGenreDetails.name}&quot; (ID #{selectedGenreDetails.id})
              </h3>
            </div>
            <button
              onClick={() => setSelectedGenreDetails(null)}
              className="text-xs text-neutral hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>

          {!selectedGenreDetails.folders || selectedGenreDetails.folders.length === 0 ? (
            <p className="text-xs text-neutral py-2">
              No folders currently mapped to this genre. You can add one in the Folders tab.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedGenreDetails.folders.map((folder) => (
                <div
                  key={folder.id}
                  className="p-3 bg-secondary border border-neutral-dark rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-white font-medium">{folder.name}</p>
                    <p className="text-xs text-neutral">Folder ID #{folder.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
