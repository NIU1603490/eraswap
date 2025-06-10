const express = require('express');
const router = express.Router();
const userController = require('../controller/userController.js');

// router.post('/login', userController.login); // Get a user
// router.post('/register', userController.register); // create a new user
router.post('/', userController.createUser); // save a new user
router.get('/user/:clerkUserId', userController.getUserByClerkId); // get a user by clerkUserId
router.get('/userObject/:userId', userController.getUser); // get a user by objectId
router.get('/favorites/:clerkUserId', userController.getFavorites); //
router.post('/favorites/add', userController.addFavorite);
router.delete('/favorites/remove/:productId', userController.removeFavorite);
router.patch('/:clerkUserId', userController.updateUser);

module.exports = router; // Export the router for use in app.js
