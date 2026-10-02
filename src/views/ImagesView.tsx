import React, { useEffect, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  MoveRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import type { Folder, Genre, ImageItem } from '../types';

export const ImagesView: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | ''>('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('batch');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [targetFolderForMove, setTargetFolderForMove] = useState<number | ''>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch folders and genres on mount
  const fetchMetadata = async () => {
    try {
      const [foldersData, genresData] = await Promise.all([
        api.getFolders(),
        api.getGenres(),
      ]);
      setFolders(foldersData);
      setGenres(genresData);
      if (foldersData.length > 0 && selectedFolderId === '') {
        setSelectedFolderId(foldersData[0].id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch images whenever the active folder changes
  const fetchFolderImages = async (folderId: number) => {
    setIsLoadingImages(true);
    setErrorMessage(null);
    try {
      const data = await api.getImagesByFolderId(folderId);
      setImages(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load images for this folder.');
      }
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    if (selectedFolderId !== '') {
      fetchFolderImages(Number(selectedFolderId));
    }
  }, [selectedFolderId]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    // Validate size and mime type
    const validFiles: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setErrorMessage(`"${f.name}" is not an image file.`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrorMessage(`"${f.name}" exceeds the 5MB file limit.`);
        return;
      }
      validFiles.push(f);
    }

    setErrorMessage(null);
    setSelectedFiles(validFiles);

    // Create object URLs for local preview
    const urls = validFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
  };

  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFolderId === '' || selectedFiles.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const folderId = Number(selectedFolderId);

    try {
      if (uploadMode === 'single' || selectedFiles.length === 1) {
        const uploaded = await api.uploadImage(selectedFiles[0], folderId);
        setSuccessMessage(`Successfully uploaded image (ID #${uploaded.id}).`);
      } else {
        const uploaded = await api.uploadBatchImages(selectedFiles, folderId);
        setSuccessMessage(`Successfully batch uploaded ${uploaded.length} image(s).`);
      }

      clearSelection();
      await fetchFolderImages(folderId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Upload failed.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Delete image
  const handleDeleteImage = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this image from R2 and the database?')) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.deleteImage(id);
      setSuccessMessage(`Image #${id} deleted successfully.`);
      if (selectedFolderId !== '') {
        await fetchFolderImages(Number(selectedFolderId));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to delete image.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Move image to different folder
  const handleMoveImage = async (imageId: number) => {
    if (targetFolderForMove === '' || targetFolderForMove === selectedFolderId) {
      setMovingId(null);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.updateImageFolder(imageId, Number(targetFolderForMove));
      setSuccessMessage(`Image #${imageId} moved to folder #${targetFolderForMove}.`);
      setMovingId(null);
      setTargetFolderForMove('');
      if (selectedFolderId !== '') {
        await fetchFolderImages(Number(selectedFolderId));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to move image folder.');
      }
    }
  };

  const currentFolder = folders.find((f) => f.id === Number(selectedFolderId));

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-primary" />
            <h2 className="font-montserrat font-bold text-lg text-white">
              Upload Images to R2 Storage
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setUploadMode('single')}
              className={`px-3 py-1 rounded cursor-pointer ${
                uploadMode === 'single'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-secondary text-neutral hover:text-white'
              }`}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('batch')}
              className={`px-3 py-1 rounded cursor-pointer ${
                uploadMode === 'batch'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-secondary text-neutral hover:text-white'
              }`}
            >
              Batch
            </button>
          </div>
        </div>
        {folders.length === 0 ? (
          <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300 text-xs">
            No folders available. Please create a folder first before uploading images.
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-montserrat uppercase font-semibold text-neutral-light mb-1.5">
                  Select Destination Folder
                </label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-secondary border border-neutral-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      Folder: {f.name} (ID #{f.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-montserrat uppercase font-semibold text-neutral-light mb-1.5">
                  {uploadMode === 'single' ? 'Select File (max 5MB)' : 'Select File(s) (max 5MB each)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple={uploadMode === 'batch'}
                  onChange={handleFileChange}
                  className="w-full text-xs text-neutral file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-white hover:file:bg-surface-hover file:cursor-pointer"
                />
              </div>
            </div>

            {/* Selected Previews */}
            {previewUrls.length > 0 && (
              <div className="p-3 bg-secondary rounded-lg border border-neutral-dark">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral font-medium">
                    {previewUrls.length} file(s) ready to upload:
                  </span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Clear files
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="preview"
                      className="w-14 h-14 object-cover rounded border border-neutral-dark"
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0 || selectedFolderId === ''}
              className="py-2.5 px-5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-montserrat font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload size={16} />
              <span>
                {isUploading
                  ? 'Uploading to Cloudflare R2...'
                  : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Image(s)`}
              </span>
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

      {/* Images in Current Folder */}
      <div className="bg-surface-card border border-neutral-dark rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-primary" />
            <h3 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider">
              Images in &quot;{currentFolder?.name || 'Selected Folder'}&quot; ({images.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-secondary border border-neutral-dark text-white rounded text-xs focus:outline-none focus:border-primary"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (#{f.id})
                </option>
              ))}
            </select>

            <button
              onClick={() => selectedFolderId !== '' && fetchFolderImages(Number(selectedFolderId))}
              disabled={isLoadingImages || selectedFolderId === ''}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-neutral-dark text-neutral-light hover:text-white rounded text-xs cursor-pointer ml-1"
            >
              <RefreshCw size={13} className={isLoadingImages ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {isLoadingImages ? (
          <p className="text-xs text-neutral py-12 text-center">Loading images...</p>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={32} className="mx-auto text-neutral/40 mb-2" />
            <p className="text-sm text-neutral">No images in this folder yet.</p>
            <p className="text-xs text-neutral/60 mt-1">Use the upload box above to add images.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-secondary border border-neutral-dark rounded-lg overflow-hidden flex flex-col justify-between"
              >
                {/* Image Thumbnail */}
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <img
                    src={img.url}
                    alt={`Image #${img.id}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-1 rounded bg-black/70 text-white hover:text-primary cursor-pointer"
                    title="Open full size image"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Info & Actions */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-neutral">ID #{img.id}</span>
                    <span className="text-xs text-neutral">
                      {img.created_at ? new Date(img.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  {/* Move Folder Controls */}
                  {movingId === img.id ? (
                    <div className="space-y-2 mt-2 pt-2 border-t border-neutral-dark">
                      <select
                        value={targetFolderForMove}
                        onChange={(e) => setTargetFolderForMove(Number(e.target.value))}
                        className="w-full text-xs bg-surface border border-neutral-dark text-white rounded p-1.5"
                      >
                        <option value="">Select new folder...</option>
                        {folders
                          .filter((f) => f.id !== img.folder_id)
                          .map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                      </select>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleMoveImage(img.id)}
                          className="flex-1 py-1 bg-primary text-white text-xs rounded hover:bg-primary-hover cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setMovingId(null);
                            setTargetFolderForMove('');
                          }}
                          className="px-2 py-1 bg-surface-hover text-neutral text-xs rounded hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-dark/60 mt-2">
                      <button
                        onClick={() => setMovingId(img.id)}
                        className="text-xs text-neutral-light hover:text-white flex items-center gap-1 cursor-pointer"
                        title="Move to another folder"
                      >
                        <MoveRight size={12} />
                        <span>Move</span>
                      </button>

                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={deletingId === img.id}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded cursor-pointer disabled:opacity-50"
                        title="Delete image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
