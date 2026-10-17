const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    videoTitle: String,
    style: String,
    requirements: String,
    images: [String],
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'],
        default: 'Pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);