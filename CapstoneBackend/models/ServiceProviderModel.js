const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  serviceProviderEmail: {
    type: String, 
  },
  serviceId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Service',
    required: true
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  serviceName: { type: String, required: true },
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

serviceProviderSchema.methods.updateAverageRating = async function (newRating) {
  this.totalRatingScore += newRating;
  this.numberOfRatings += 1;
  this.rating = this.totalRatingScore / this.numberOfRatings;
  await this.save();
};




module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
