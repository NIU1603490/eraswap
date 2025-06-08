import api from './api';

export const uploadImage = async (uri: string): Promise<string> => {
  const fileName = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(fileName);
  const type = match ? `image/${match[1]}` : 'image';

  const formData = new FormData();
  formData.append('image', { uri, name: fileName, type } as any);

  const response = await api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.imageUrl as string;
};