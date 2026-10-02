import React, { useEffect, useState } from 'react';
import {
  FolderTree,
  FolderOpen,
  Image as ImageIcon,
  PlusCircle,
  Upload,
  RefreshCw,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import type { NavTab } from '../components/Sidebar';
import type { Genre, Folder } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [genresCount, setGenresCount] = useState<number | null>(null);
  const [foldersCount, setFoldersCount] = useState<number | null>(null);
  const [imagesCount, setImagesCount] = useState<number | null>(null);
  const [recentGenres, setRecentGenres] = useState<Genre[]>([]);
  const [recentFolders, setRecentFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gCount, fCount, iCount, genresList, foldersList] = await Promise.all([
        api.getGenresCount(),
        api.getFoldersCount(),
        api.getImagesCount(),
        api.getGenres(),
        api.getFolders(),
      ]);

      setGenresCount(gCount.count);
      setFoldersCount(fCount.count);
      setImagesCount(iCount.count);
      setRecentGenres(genresList.slice(0, 5));
      setRecentFolders(foldersList.slice(0, 5));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch dashboard metrics.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card border border-neutral-dark p-6 rounded-xl">
        <div>
          <h2 className="font-montserrat font-bold text-xl sm:text-2xl text-white">
            Portfolio CMS Overview
          </h2>
          <p className="text-neutral text-xs sm:text-sm mt-1">
            Monitor and manage your portfolio categories, project folders, and image collections.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-secondary border border-neutral-dark hover:border-neutral text-neutral-light hover:text-white rounded-lg text-xs font-medium cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Genres"
          count={genresCount}
          loading={isLoading}
          icon={FolderTree}
          description="Total genres"
          onClick={() => onNavigate('genres')}
        />
        <StatCard
          title="Total Folders"
          count={foldersCount}
          loading={isLoading}
          icon={FolderOpen}
          description="Total folders "
          onClick={() => onNavigate('folders')}
        />
        <StatCard
          title="Total Images"
          count={imagesCount}
          loading={isLoading}
          icon={ImageIcon}
          description="Total uploaded images"
          onClick={() => onNavigate('images')}
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
        <h3 className="font-montserrat font-bold text-sm uppercase text-neutral-light tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('genres')}
            className="flex items-center gap-3 p-4 bg-secondary border border-neutral-dark hover:border-primary/60 hover:bg-surface-hover rounded-lg text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-md bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
              <PlusCircle size={20} />
            </div>
            <div>
              <p className="font-montserrat font-semibold text-white text-sm group-hover:text-primary">
                Create Genre
              </p>
              <p className="text-xs text-neutral">Add discipline / genre category</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('folders')}
            className="flex items-center gap-3 p-4 bg-secondary border border-neutral-dark hover:border-primary/60 hover:bg-surface-hover rounded-lg text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-md bg-tertiary/30 text-emerald-400 border border-tertiary flex items-center justify-center shrink-0">
              <FolderKanban size={20} />
            </div>
            <div>
              <p className="font-montserrat font-semibold text-white text-sm group-hover:text-primary">
                Create Folder
              </p>
              <p className="text-xs text-neutral">Assign a project folder to genre</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('images')}
            className="flex items-center gap-3 p-4 bg-secondary border border-neutral-dark hover:border-primary/60 hover:bg-surface-hover rounded-lg text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-md bg-secondary text-neutral-light border border-neutral-dark flex items-center justify-center shrink-0">
              <Upload size={20} />
            </div>
            <div>
              <p className="font-montserrat font-semibold text-white text-sm group-hover:text-primary">
                Upload Images
              </p>
              <p className="text-xs text-neutral">Upload single or batch to folder</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Summary Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genres Preview */}
        <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderTree size={18} className="text-primary" />
              <h3 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider">
                Recent Genres
              </h3>
            </div>
            <button
              onClick={() => onNavigate('genres')}
              className="text-xs text-neutral-light hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Manage all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentGenres.length === 0 ? (
            <p className="text-xs text-neutral py-4 text-center">No genres created yet.</p>
          ) : (
            <div className="divide-y divide-neutral-dark/60">
              {recentGenres.map((genre) => (
                <div key={genre.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{genre.name}</p>
                    <p className="text-xs text-neutral">ID #{genre.id}</p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary border border-neutral-dark text-neutral-light">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Folders Preview */}
        <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen size={18} className="text-primary" />
              <h3 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider">
                Recent Project Folders
              </h3>
            </div>
            <button
              onClick={() => onNavigate('folders')}
              className="text-xs text-neutral-light hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Manage all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentFolders.length === 0 ? (
            <p className="text-xs text-neutral py-4 text-center">No folders created yet.</p>
          ) : (
            <div className="divide-y divide-neutral-dark/60">
              {recentFolders.map((folder) => (
                <div key={folder.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{folder.name}</p>
                    <p className="text-xs text-neutral">Genre ID: {folder.genre_id}</p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary border border-neutral-dark text-neutral-light">
                    ID #{folder.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
