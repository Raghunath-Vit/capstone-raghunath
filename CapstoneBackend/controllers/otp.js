const https = require('https');
const twilio = require('twilio');
const Booking = require('../models/Booking');
const dotenv=require("dotenv");
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';


dotenv.config();
const agent = new https.Agent({
  rejectUnauthorized: false, 
});

// Configure Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);



const sendOtp = async (req, res) => {
  try {
    const { phoneNumber, bookingId } = req.body; // Add bookingId to the body
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit OTP

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    // Save the OTP in the booking record
    booking.otp = otp;
    await booking.save();

    res.json({ message: 'OTP sent and saved', booking });
  } catch (error) {
    console.error('Error sending OTP:', error); // Log the error details
    res.status(500).json({ error: 'Error sending OTP' });
  }
};


const verifyOtp = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Request Params:', req.params);

        const bookingId = req.params.id;
        const { otp } = req.body;
        // const otp = req.body.otp;
        if (!otp) {
            return res.status(400).json({ error: 'Missing OTP' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        console.log('Fetched Booking:', booking);
        console.log('Received OTP:', otp);
        console.log('Stored OTP:', booking.otp);

        if (String(booking.otp) !== String(otp)) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        booking.status = 'Closed';
        booking.otp = null; // Clear the OTP after verification
        await booking.save();

        res.json({ message: 'Service verified and closed successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Error verifying OTP' });
    }
};


module.exports = { sendOtp, verifyOtp };
