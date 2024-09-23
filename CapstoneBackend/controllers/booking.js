// // const Booking = require('../models/Booking');
// // const Service = require('../models/Service');

// // // Function to calculate and update the average rating of a service
// // const updateServiceAverageRating = async (serviceId) => {
// //   try {
// //     const bookings = await Booking.find({ serviceId, rating: { $ne: null } });
// //     if (bookings.length === 0) return;

// //     const totalRating = bookings.reduce((sum, booking) => sum + booking.rating, 0);
// //     const averageRating = totalRating / bookings.length;

// //     const service = await Service.findById(serviceId);
// //     service.rating = averageRating;
// //     await service.save();

// //     console.log(`Service ${serviceId} average rating updated to: ${averageRating}`);
// //   } catch (error) {
// //     console.error('Error updating service rating:', error.message);
// //   }
// // };

// // // Export the function
// // module.exports = {
// //   updateServiceAverageRating,
// //   createBooking: async (req, res) => {
// //     try {
// //       const booking = new Booking(req.body);
// //       await booking.save();

// //       await updateServiceAverageRating(booking.serviceId);

// //       res.status(201).json(booking);
// //     } catch (error) {
// //       res.status(400).json({ error: error.message });
// //     }
// //   },

// //   updateBooking: async (req, res) => {
// //     try {
// //       const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
// //           .populate('serviceId')
// //           .populate('userId');
// //       if (!booking) {
// //         return res.status(404).json({ error: 'Booking not found' });
// //       }

// //       if (req.body.rating !== undefined) {
// //         await updateServiceAverageRating(booking.serviceId);
// //       }

// //       res.status(200).json(booking);
// //     } catch (error) {
// //       res.status(400).json({ error: error.message });
// //     }
// //   }
// // };

// const Service = require('../models/Service');
// const Booking = require('../models/Booking');

// const updateServiceAverageRating = async (serviceId) => {
//     const service = await Service.findById(serviceId);
//     if (!service) throw new Error('Service not found');

// //     const bookings = await Booking.find({ serviceId });
    
// //     if (bookings.length === 0) {
// //         service.rating = 0;
// //         service.totalRatingScore = 0;
// //         service.numberOfRatings = 0;
// //     } else {
// //         let totalRatingScore = 0;
// //         let numberOfRatings = 0;

// //         bookings.forEach(booking => {
// //             if (booking.rating) {
// //                 totalRatingScore += booking.rating;
// //                 numberOfRatings += 1;
// //             }
// //         });

// //         service.totalRatingScore = totalRatingScore;
// //         service.numberOfRatings = numberOfRatings;
// //         service.rating = numberOfRatings > 0 ? totalRatingScore / numberOfRatings : 0;
// //     }

// //     await service.save();
// // };

// // module.exports = {
// //     updateServiceAverageRating,
// // };
// // Get all bookings for the service
// const bookings = await Booking.find({ serviceId });

// // Calculate total rating and number of ratings
// let totalRatingScore = 0;
// let numberOfRatings = 0;

// bookings.forEach(booking => {
//     if (booking.rating !== undefined) { // Ensure we only include defined ratings
//         totalRatingScore += booking.rating;
//         numberOfRatings += 1;
//     }
// });

// // Update service details based on ratings
// service.totalRatingScore = totalRatingScore;
// service.numberOfRatings = numberOfRatings;
// service.rating = numberOfRatings > 0 ? totalRatingScore / numberOfRatings : 0;

// // Save updated service
// await service.save();

// console.log(`Service ${serviceId} average rating updated to: ${service.rating}`);
// };

// module.exports = {
// updateServiceAverageRating,
// };