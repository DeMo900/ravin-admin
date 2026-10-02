export interface User {
  id: number;
  username: string;
  created_at?: string;
}

export interface Genre {
  id: number;
  name: string;
  created_at: string;
  folders?: Folder[];
}

export interface Folder {
  id: number;
  name: string;
  genre_id: number;
  created_at: string;
}

export interface ImageItem {
  id: number;
  url: string;
  folder_id: number;
  created_at: string;
}

export interface CountResponse {
  count: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
