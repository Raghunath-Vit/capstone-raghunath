const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  serviceProviderId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  serviceProviderEmail: {
    type: String,  // You must ensure this field exists to search by email
    // required: true
  },
  serviceName: { type: String, required: true },
  // priceRange: { type: String, required: true },
  price:{type:String},
  description: { type: String },
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

// serviceSchema.methods.updateAverageRating = async function (newRating) {
//   this.totalRatingScore += newRating;
//   this.numberOfRatings += 1;
//   this.rating = this.totalRatingScore / this.numberOfRatings;
//   await this.save();
// };

// In your Service model
serviceSchema.methods.updateAverageRating = async function (newRating) {
  const allRatings = await Booking.find({ serviceId: this._id, rating: { $exists: true } });
  const totalRatings = allRatings.reduce((sum, booking) => sum + booking.rating, 0);
  const averageRating = totalRatings / allRatings.length;
  
  this.averageRating = averageRating;
  await this.save();
};



module.exports = mongoose.model('Service', serviceSchema);
