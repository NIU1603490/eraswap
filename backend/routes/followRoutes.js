const express = require('express');
const router = express.Router();
const followController = require('../controller/followController');
//const { authenticate } = require('../middleware/authMiddleware');


router.post('/follow/:id', followController.followUser);
router.post('/unfollow/:id', followController.unfollowUser);
router.get('/followers/:id', followController.getFollowers);
router.get('/followings/:id', followController.getFollowing);

module.exports = router;