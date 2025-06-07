const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');

router.get('/', postController.getAllPosts);
router.post('/create', postController.createPost);
router.put('/update/:postId', postController.updatePost);
router.delete('/delete/:postId', postController.deletePost);
router.get('/user/:clerkUserId', postController.getPostByUserId);
router.post('/like/:postId', postController.likePost);
router.post('/unlike/:postId', postController.unlikePost);

module.exports = router;