
const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');


router.post('/', aiController.sendChat);

module.exports = router;