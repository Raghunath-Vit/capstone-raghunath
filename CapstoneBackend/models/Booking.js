const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true }, 
  bookingDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Closed'], default: 'Pending' },
  beforeWorking: { type: String },  
  afterWorking: { type: String },
  otp: String,
  rating:{
    type:Number,
    min:0,
    max:5,
    default:0
  },
  totalRatingScore: { type: Number, default: 0 }, // Sum of all ratings
  numberOfRatings: { type: Number, default: 0 }, // Count of ratings
}, {
  timestamps: true // Enable timestamps to automatically add `createdAt` and `updatedAt`
});


bookingSchema.methods.updateRating = async function (rating) {
  this.rating = rating;
  await this.save();
};


module.exports = mongoose.model('Booking', bookingSchema);

