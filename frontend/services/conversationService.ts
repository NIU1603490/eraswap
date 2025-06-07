import api from './api';

const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export default { getConversations };

