const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controller/imageController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), imageController.uploadImage);

module.exports = router;