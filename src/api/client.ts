import { useAuthStore } from '../store/useAuthStore';
import type {  
  Genre,
  Folder,
  ImageItem,
  CountResponse,
  User,
  ApiResponse,
} from '../types';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'https://backend.dodoadam893.workers.dev';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = false,
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (requiresAuth) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Set JSON content-type only if not FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: `Server returned invalid JSON (${response.status})`,
  }));

  if (!response.ok || !json.success) {
    const errorResponse = !json.success ? json : undefined;
    const message = errorResponse?.message || 'Request failed';
    const errorCode = errorResponse?.error;

    if (response.status === 401) {
      useAuthStore.getState().logout();
    }

    throw new ApiError(message, response.status, errorCode);
  }

  return json.data;
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Genres
  getGenres: async (): Promise<Genre[]> => {
    return request<Genre[]>('/genres');
  },

  getGenreById: async (id: number): Promise<Genre> => {
    return request<Genre>(`/genre/${id}`);
  },

  getGenresCount: async (): Promise<CountResponse> => {
    return request<CountResponse>('/genres/count');
  },

  createGenre: async (name: string): Promise<{ id: number; name: string }> => {
    return request<{ id: number; name: string }>(
      '/cms/genre',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
      true,
    );
  },

  deleteGenre: async (id: number): Promise<{ id: number; deleted: boolean }> => {
    return request<{ id: number; deleted: boolean }>(
      `/cms/genre/${id}`,
      {
        method: 'DELETE',
      },
      true,
    );
  },

  // Folders
  getFolders: async (): Promise<Folder[]> => {
    return request<Folder[]>('/folders');
  },

  getFolderById: async (id: number): Promise<Folder> => {
    return request<Folder>(`/folder/${id}`);
  },

  getFoldersCount: async (): Promise<CountResponse> => {
    return request<CountResponse>('/folders/count');
  },

  createFolder: async (name: string, genreId: number): Promise<Folder> => {
    return request<Folder>(
      '/cms/folder',
      {
        method: 'POST',
        body: JSON.stringify({ name, genre_id: genreId }),
      },
      true,
    );
  },

  deleteFolder: async (
    id: number,
  ): Promise<{ id: number; deleted: boolean }> => {
    return request<{ id: number; deleted: boolean }>(
      `/cms/folder/${id}`,
      {
        method: 'DELETE',
      },
      true,
    );
  },

  // Images
  getImageById: async (id: number): Promise<ImageItem> => {
    return request<ImageItem>(`/image/${id}`);
  },

  getImagesByFolderId: async (folderId: number): Promise<ImageItem[]> => {
    return request<ImageItem[]>(`/images/${folderId}`);
  },

  getImagesByGenreId: async (genreId: number): Promise<ImageItem[]> => {
    return request<ImageItem[]>(`/images/genre/${genreId}`);
  },

  getImagesCount: async (): Promise<CountResponse> => {
    return request<CountResponse>('/images/count/all');
  },

  getImagesCountByGenre: async (genreId: number): Promise<CountResponse> => {
    return request<CountResponse>(`/images/count/genre/${genreId}`);
  },

  getImagesCountByFolder: async (folderId: number): Promise<CountResponse> => {
    return request<CountResponse>(`/images/count/folder/${folderId}`);
  },

  uploadImage: async (file: File, folderId: number): Promise<ImageItem> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder_id', folderId.toString());

    return request<ImageItem>(
      '/cms/image',
      {
        method: 'POST',
        body: formData,
      },
      true,
    );
  },

  uploadBatchImages: async (
    files: File[],
    folderId: number,
  ): Promise<ImageItem[]> => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    return request<ImageItem[]>(
      `/cms/images/${folderId}`,
      {
        method: 'POST',
        body: formData,
      },
      true,
    );
  },

  updateImageFolder: async (
    id: number,
    folderId: number,
  ): Promise<{ id: number; folder_id: number; updated: boolean }> => {
    return request<{ id: number; folder_id: number; updated: boolean }>(
      '/cms/image/folder',
      {
        method: 'POST',
        body: JSON.stringify({ id, folder_id: folderId }),
      },
      true,
    );
  },

  deleteImage: async (id: number): Promise<{ id: number; deleted: boolean }> => {
    return request<{ id: number; deleted: boolean }>(
      `/cms/image/${id}`,
      {
        method: 'DELETE',
      },
      true,
    );
  },
};
