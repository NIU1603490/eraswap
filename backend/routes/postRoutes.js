const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');

router.get('/', postController.getAllPosts);
router.put('/create', postController.createPost);
router.get('/update', postController.updatePost);
router.get('/delete', postController.deletePost);
router.get('/:clerkUserId', postController.getPostByUserId);

module.exports = router;