export type Theme = 'light' | 'dark' | 'system';

export interface ImageState {
  file: File;
  preview: string;
  width: number;
  height: number;
}
