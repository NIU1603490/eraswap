const express = require('express');
const router = express.Router();
const userController = require('../controller/userController.js');
const { requireAuth } = require('@clerk/express');

router.post('/create', userController.createUser); // save a new user
router.get('/user/:clerkUserId', requireAuth(), userController.getUserByClerkId); // get a user by clerkUserId
router.get('/userObject/:userId', requireAuth(),  userController.getUser); // get a user by objectId
router.get('/favorites/:clerkUserId', requireAuth(), userController.getFavorites); //
router.post('/favorites/add', requireAuth(), userController.addFavorite);
router.delete('/favorites/remove/', requireAuth(), userController.removeFavorite);
router.patch('/:clerkUserId', requireAuth(), userController.updateUser);

module.exports = router; // Export the router for use in app.js
