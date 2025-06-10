const axios = require('axios');

async function runPostTests() {
  const userId = 'CLERK_USER_ID'; // Clerk user ID
  try {
    const createResponse = await axios.post('http://localhost:5000/api/posts/create', {
      content: 'Doing a test!',
      userId,
    });
    console.log('Create post:', createResponse.data);

    const postId = createResponse.data.post._id;
    await axios.post(`http://localhost:5000/api/posts/like/${postId}`);
    console.log('Post liked');
    await axios.post(`http://localhost:5000/api/posts/unlike/${postId}`);
    console.log('Post unliked');

    const allPosts = await axios.get('http://localhost:5000/api/posts/');
    console.log('All posts:', allPosts.data);

    const userPosts = await axios.get(`http://localhost:5000/api/posts/user/${userId}`);
    console.log('Posts for user:', userPosts.data);

    const deleteRes = await axios.delete(`http://localhost:5000/api/posts/delete/${postId}`);
    console.log('Delete post:', deleteRes.data);
  } catch (error) {
    console.error('Post test error:', error.response ? error.response.data : error.message);
  }
}

runPostTests()