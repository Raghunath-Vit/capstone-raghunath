const express = require('express');
const https = require('https');
const twilio = require('twilio');
const Booking = require('../models/Booking');
const auth = require('../middlewares/auth');
const router = express.Router();
const user=require('../models/User');
const multer = require('multer');
const dotenv = require('dotenv');
const { body, param, validationResult } = require('express-validator');
const upload = multer({ dest: 'uploads/' }); 
const { verifyOtp } = require('../controllers/otp');
const Service = require('../models/Service');
const ServiceProvider=require('../models/ServiceProviderModel');


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
dotenv.config();
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create a booking
// router.post(
//   '/',
//   auth,
//   [
//     body('userId').isMongoId().withMessage('Invalid user ID'),
//     body('serviceProviderId').isMongoId().withMessage('Invalid serviceProvider ID'),
//     body('bookingDate').isISO8601().withMessage('Invalid booking date'),
//   ],
//   validate,
//   async (req, res) => {
//     try {
//       const { userId, serviceProviderId, bookingDate } = req.body;

//       // Fetch the service to get the service provider ID
//       const service = await ServiceProvider.findById(serviceProviderId);
//       if (!service) {
//         return res.status(404).json({ error: 'serviceProvider not found' });
//       }

//       // Create the booking with serviceProviderId
//       const booking = new Booking({
//         userId,
//         // serviceId,
//         serviceProviderId: serviceProviderId, // Populate from the service
//         bookingDate,
//       });

//       await booking.save();
//       res.json({ message: 'Booking successful', booking });
//     } catch (error) {
//       res.status(500).json({ error: 'Error creating booking' });
//     }
//   }
// );
// Create a booking
router.post(
  '/',
  auth,
  [
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('serviceProviderId').isMongoId().withMessage('Invalid serviceProvider ID'),
    body('bookingDate').isISO8601().withMessage('Invalid booking date'),
  ],
  validate,
  async (req, res) => {
    try {
      const { userId, serviceProviderId, bookingDate } = req.body;

      // Fetch the service provider to get their userId (worker)
      const serviceProvider = await ServiceProvider.findById(serviceProviderId).populate('userId');
      if (!serviceProvider) {
        return res.status(404).json({ error: 'Service provider not found' });
      }

      // Create the booking
      const booking = new Booking({
        userId,
        serviceProviderId,
        bookingDate,
      });

      await booking.save();

      // Send a notification message to the worker (service provider)
      const workerPhoneNumber = serviceProvider.userId.phoneNumber;
      if (workerPhoneNumber) {
        await client.messages.create({
          body: `A new work has been assigned to you. Booking ID: ${booking._id}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: workerPhoneNumber,
        });
      }

      res.json({ message: 'Booking successful and notification sent to worker', booking });
    } catch (error) {
      res.status(500).json({ error: 'Error creating booking' });
    }
  }
);


// Upload beforeWorking and afterWorking proof images and complete the booking
router.post(
  '/:id/proof',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    upload.fields([
      { name: 'beforeWorking', maxCount: 1 },
      { name: 'afterWorking', maxCount: 1 },
    ]),
  ],
  validate,
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      const beforeWorking = req.files['beforeWorking'] ? req.files['beforeWorking'][0].path : null;
      const afterWorking = req.files['afterWorking'] ? req.files['afterWorking'][0].path : null;

      if (!beforeWorking || !afterWorking) {
        return res.status(400).json({ error: 'Both beforeWorking and afterWorking files are required' });
      }

      booking.beforeWorking = beforeWorking;
      booking.afterWorking = afterWorking;
      booking.status = 'Completed';
      await booking.save();

      const otpResponse = await sendOtp({ bookingId: booking._id }); 

      res.json({ message: 'Booking completed with proof images and OTP sent', booking, otpResponse });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error completing booking with proof images' });
    }
  }
);

const sendOtp = async ({ bookingId }) => {
  const booking = await Booking.findById(bookingId).populate('userId');
  if (!booking) {
    throw new Error('Booking not found');
  }

  const { phoneNumber } = booking.userId;
  if (!phoneNumber) {
    throw new Error('User does not have a phone number');
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  const googleFormLink = `http://localhost:5173/${bookingId}/giverating`;

  await client.messages.create({
    body: `Your OTP is ${otp}. Please provide feedback using this link: ${googleFormLink}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });

  booking.otp = otp;
  await booking.save();

  return { message: 'OTP and Google Form link sent and saved', booking };
};

router.post('/bookings/:id/verify-otp', verifyOtp);

// Rate a booking and service
// router.post(
//   '/:id/rate',
//   [
//     param('id').isMongoId().withMessage('Invalid booking ID'),
//     body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
//   ],
//   validate,
//   async (req, res) => {
//     const { rating } = req.body;
//     const bookingId = req.params.id;

//     try {
//       // Find the booking and update its rating
//       const booking = await Booking.findById(bookingId);
//       if (!booking) return res.status(404).json({ error: 'Booking not found' });

//       if (booking.status === 'Pending') {
//         return res.status(400).json({ error: 'Cannot rate a service that is not completed or closed' });
//       }

//       // Update the booking's rating
//       await booking.updateRating(rating);

//       // Update the service's average rating
//       const service = await Service.findById(booking.serviceId);
//       await service.updateAverageRating(rating);

//       res.json({ message: 'Rating submitted successfully', booking });
//     } catch (error) {
//       res.status(500).json({ error: 'Error submitting rating' });
//     }
//   }
// );

router.post(
  '/:id/rate',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  ],
  validate,
  async (req, res) => {
    const { rating } = req.body;
    const bookingId = req.params.id;

    try {
      const booking = await Booking.findById(bookingId).populate('serviceProviderId');
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      if (booking.status !== 'Completed' && booking.status !== 'Closed' && booking.status !== 'Confirmed' ) {
        return res.status(400).json({ error: 'Cannot rate a service that is not confirmed,completed or closed' });
      }

      booking.rating = rating;
      await booking.save();

      const service = await ServiceProvider.findById(booking.serviceProviderId);
      if (!service) return res.status(404).json({ error: 'Service not found' });

      const bookingsWithRatings = await Booking.find({ serviceId: service._id, rating: { $exists: true } });
      const totalRatings = bookingsWithRatings.reduce((acc, booking) => acc + booking.rating, 0);
      service.averageRating = totalRatings / bookingsWithRatings.length;
      await service.save();

      res.json({ message: 'Rating submitted successfully', booking });
    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/:id/rate', async (req, res) => {
  const bookingId = req.params.id;

  try {
    // Find the booking and populate the service provider if needed
    const booking = await Booking.findById(bookingId).populate('serviceProviderId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Return the rating from the booking
    res.json({ rating: booking.rating });
  } catch (error) {
    console.error('Error retrieving rating:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
 .populate({
   path: 'serviceProviderId',
   populate: { path: 'userId' } 
 });
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

router.get('/mybooking/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id; 
    console.log('Fetching bookings for user ID:', userId); 

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

 const bookings = await Booking.find({ userId })
 .populate({
   path: 'serviceProviderId',
   populate: { path: 'userId' } 
 });
    
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings for user:', error);
    res.status(500).json({ error: 'Error fetching bookings for user' });
  }
});


// notify customer that service been accepted or decline by the worker
// router.post('/notify', async (req, res) => {
//   const { bookingId, message } = req.body; // Assuming you're passing bookingId and message (Accepted/Declined)
  
//   try {
//     // Find the booking by ID
//     const booking = await Booking.findById(bookingId).populate('userId'); // Populate the user to get their phone number
//     if (!booking) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     // Update booking status based on worker's message (Accepted or Declined)
//     if (message === 'Accepted') {
//       booking.status = 'Confirmed';
//     } else if (message === 'Rejected') {
//       booking.status = 'Closed';
//     } else {
//       return res.status(400).json({ error: 'Invalid message. Must be "Accepted" or "Rejected".' });
//     }

//     // Save the updated booking status
//     await booking.save();

//     // Notify the customer about the worker's response via Twilio
//     const { phoneNumber } = booking.userId;
//     console.log(phoneNumber);
//     if (!phoneNumber) {
//       return res.status(400).json({ error: 'User phone number not available' });
//     }

//     // Send notification via Twilio
//     await client.messages.create({
//       body: `Your booking has been ${message} by the worker.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: phoneNumber,
//     });

//     return res.status(200).json({ message: `Booking ${message} and customer notified successfully`, booking });
//   } catch (error) {
//     console.error('Error updating booking status:', error);
//     return res.status(500).json({ error: 'Failed to update booking status and notify customer' });
//   }
// });


// Above one with validator
// Notify customer that service has been accepted or declined by the worker
router.post(
  '/notify', 
  [
    body('bookingId').isMongoId().withMessage('Invalid booking ID'),
    body('message').isIn(['Accepted', 'Rejected']).withMessage('Message must be either "Accepted" or "Rejected"'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, message } = req.body;

    try {
      
      const booking = await Booking.findById(bookingId).populate('userId'); 
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (message === 'Accepted') {
        booking.status = 'Confirmed';
      } else if (message === 'Rejected') {
        booking.status = 'Closed';
      }

      await booking.save();

      const { phoneNumber } = booking.userId;
      if (!phoneNumber) {
        return res.status(400).json({ error: 'User phone number not available' });
      }

      await client.messages.create({
        body: `Your booking has been ${message} by the worker.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      return res.status(200).json({ message: `Booking ${message} and customer notified successfully`, booking });
    } catch (error) {
      console.error('Error updating booking status:', error);
      return res.status(500).json({ error: 'Failed to update booking status and notify customer' });
    }
  }
);


// router.get('/requestedbooking/:id', auth, async (req, res) => {
//   try {
//     const userId = req.params.id; 

//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }

//     const serviceProvider = await ServiceProvider.findOne({ userId });

//     if (!serviceProvider) {
//       return res.status(404).json({ message: 'No service provider found for this user' });
//     }

//     const serviceProviderId = serviceProvider._id;  

//     const bookings = await Booking.find({ serviceProviderId })
//       .populate({
//         path: 'userId',  
//         select: 'name email phoneNumber', 
//       })
//       .populate({
//         path: 'serviceProviderId',  
//         populate: { path: 'userId', select: 'name' }  
//       });

//     if (!bookings || bookings.length === 0) {
//       return res.status(404).json({ message: 'No bookings found for this service provider' });
//     }

//     res.json({ bookings });
//   } catch (error) {
//     console.error('Error fetching bookings for service provider:', error);
//     res.status(500).json({ error: 'Error fetching bookings' });
//   }
// });

router.get('/requestedbooking/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id; 

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const serviceProviders = await ServiceProvider.find({ userId });

    if (!serviceProviders || serviceProviders.length === 0) {
      return res.status(404).json({ message: 'No service providers found for this user' });
    }

    // Extracting service provider IDs from the results
    const serviceProviderIds = serviceProviders.map(provider => provider._id);  

    const bookings = await Booking.find({ serviceProviderId: { $in: serviceProviderIds } })
      .populate({
        path: 'userId',  
        select: 'name email phoneNumber', 
      })
      .populate({
        path: 'serviceProviderId',  
        populate: { path: 'userId', select: 'name' }  
      });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for these service providers' });
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings for service providers:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});






module.exports = router;