const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadTestImage() {
  const imagePath = path.join(__dirname, '..', '..', 'frontend', 'assets', 'images', 'favicon.png');
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));

  try {
    const response = await axios.post('http://localhost:5000/api/images/upload', form, {
      headers: form.getHeaders(),
    });
    console.log('Image uploaded successfully:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Upload failed:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

uploadTestImage();