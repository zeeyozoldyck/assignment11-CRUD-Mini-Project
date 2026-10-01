import { apiClient } from '../main.jsx';

// Book collection API services
export const fetchAllBooks = async () => {
  const { data } = await apiClient.get('/books');
  return data;
};

export const createNewBook = async (bookData) => {
  const { data } = await apiClient.post('/books', bookData);
  return data;
};

export const updateBookInfo = async (id, updatedData) => {
  const { data } = await apiClient.put(`/books/${id}`, updatedData);
  return data;
};

export const removeBookById = async (id) => {
  const { data } = await apiClient.delete(`/books/${id}`);
  return data;
};