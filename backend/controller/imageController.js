const cloudinary = require('../config/cloudinaryConfig');
const Image = require('../models/image');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'eraswap',
    });

    console.log(result);
    const image = new Image({
      imageUrl: result.secure_url,
    });
    await image.save();

    res.status(201).json({ success: true, imageUrl: result.secure_url, image });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
  }
};

module.exports = { uploadImage };