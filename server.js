const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Booking = require('./booking');
const cors = require('cors');
const app = express();
import { v2 as cloudinary } from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: 'tvnvrglq', 
        api_key: '676958599174541', 
        api_secret: '<your_api_secret>' // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();
// 1. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 2. Uploads folder setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. Cloudinary Multer Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thumbnails',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage });

// 4. MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redcod';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// ---------------- API ROUTES ----------------

// Admin Get All Bookings API
app.get('/api/admin/bookings', async (req, res) => {
    try {
        console.log("Admin bookings API called!");
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('Admin Fetch Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin Update Status API
app.put('/api/admin/update-status', async (req, res) => {
    try {
        const { bookingId, status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            { status: status }, 
            { new: true }
        );
        res.json({ success: true, updatedBooking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// New Booking API
app.post('/api/booking', upload.array('images', 20), async (req, res) => {
  try {
    console.log("Booking API Hit Successfully!"); // इससे Render के लॉक्स में पता चल जाएगा
    
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    const bookingData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      videoTitle: req.body.videoTitle,
      style: req.body.style,
      requirements: req.body.requirements,
      imagePaths: imagePaths,
      status: 'Pending',
      createdAt: new Date()
    };

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// User History API
app.get('/api/history', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        const bookings = await Booking.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));