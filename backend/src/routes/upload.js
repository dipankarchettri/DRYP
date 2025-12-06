const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DRYP_PROD', // Optional: files will be uploaded to this folder in Cloudinary
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    // Optional: transform images on upload
    // transformation: [{ width: 500, height: 500, crop: 'limit' }], 
  },
});

// Initialize multer with the Cloudinary storage engine
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
}).single('image'); // 'image' is the name of the form field

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private (Vendor only)
router.post('/', protect, (req, res) => {
  // Check user role
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Forbidden: Only vendors can upload images.' });
  }

  // Use the upload middleware
  upload(req, res, (err) => {
    if (err) {
      // Handle multer or Cloudinary errors
      return res.status(500).json({ message: 'Image upload failed.', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Error: No file selected!' });
    }

    // On successful upload, Cloudinary provides the URL in req.file.path and publicId in req.file.filename
    res.status(200).json({
      message: 'Image uploaded successfully!',
      url: req.file.path, // This is the secure URL from Cloudinary
      publicId: req.file.filename // This is the public_id from Cloudinary
    });
  });
});

module.exports = router;
