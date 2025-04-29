import { api } from './api';

export const createPost = async (content) => {
  try {
    console.log('Creating post with content:', content);
    const response = await api.post('/posts/create-post', { content });
    console.log('Create post response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getUserPosts = async (userId) => {
  try {
    console.log('Fetching posts for user:', userId);
    const response = await api.get(`/posts/get-posts/${userId}`);
    console.log('Get user posts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const updatePost = async (postId, content) => {
  try {
    console.log('Updating post:', postId, 'with content:', content);
    const response = await api.patch(`/posts/update-post/${postId}`, { content });
    console.log('Update post response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const getAllPosts = async () => {
  try {
    console.log('Fetching all posts');
    const response = await api.get('/posts/get-all-posts');
    console.log('Get all posts response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching all posts:', error);
    throw error;
  }
}; 