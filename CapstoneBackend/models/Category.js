
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true // Enable timestamps to automatically add `createdAt` and `updatedAt`
  });

module.exports = mongoose.model('Category', CategorySchema);
