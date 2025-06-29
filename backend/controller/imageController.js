const {cloudinary} = require('../config/cloudinaryConfig');

const uploadImage = async (req, res) => {
  console.log('UPLOAD IMAGE');
  try {
    console.log('file', req.file)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }
    console.log(req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'eraswap',
      });
    console.log(result);
    res.status(201).json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
  }
};

const pingCloudinary = async (req, res) => {
    try {
      const result = await cloudinary.api.ping();
      res.json({ ok: true, status: result.status });
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Cloudinary ping failed', error: error.message });
    }
  };
  
  module.exports = { uploadImage, pingCloudinary };