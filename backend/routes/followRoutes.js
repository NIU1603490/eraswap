const express = require('express');
const router = express.Router();
const followController = require('../controller/followController');
//const { authenticate } = require('../middleware/authMiddleware');


router.post('/:id/follow', followController.followUser);
router.post('/:id/unfollow', followController.unfollowUser);
router.get('/:id/followers', followController.getFollowers);
router.get('/:id/followings', followController.getFollowings);

module.exports = router;