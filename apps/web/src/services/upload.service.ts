import { http } from '@/lib/http';
import { ENDPOINTS } from '@repo/shared/constants/endpoints';

export const uploadService = {
  image: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const data = await http.upload<{ url: string }>(ENDPOINTS.storage.uploadImage, fd);
    return data.url;
  },
};
