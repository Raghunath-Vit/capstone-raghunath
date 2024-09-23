const { body, validationResult } = require('express-validator');
const express = require('express');
const passport = require('passport');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();
const dotenv = require('dotenv');
const https = require('https');
const auth=require('../middlewares/auth');

dotenv.config()

const agent = new https.Agent({
  rejectUnauthorized: false, 
});

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN, {
  httpAgent: agent
});



// Send OTP Route
router.post(
  '/otp/send',
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number').trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); 

    try {
      const message = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      console.log('Twilio message sent:', message);

      
      req.session.otp = otp;
      req.session.phoneNumber = phoneNumber;

      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error); 
      res.status(500).json({ error: 'Error sending OTP', details: error.message });
    }
  }
);

router.post(
  '/otp/verify',
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP').trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { otp } = req.body;

    if (otp == req.session.otp) {
      let user = await User.findOne({ phoneNumber: req.session.phoneNumber });
      if (!user) {
        user = new User({ phoneNumber: req.session.phoneNumber, name: 'New User' });
        await user.save();
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('jwt', token, { httpOnly: true });
      res.json({ message: 'OTP verified', token });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  }
);

router.post(
  '/register',
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('phoneNumber').isMobilePhone().withMessage('Invalid phone number').trim().escape(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phoneNumber, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const user = new User({ name, email, phoneNumber, password });
      await user.save();

      res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  '/register-worker',
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('phoneNumber').isMobilePhone().withMessage('Invalid phone number').trim().escape(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phoneNumber, password } = req.body;
    try {
      const existingWorker = await User.findOne({ email });
      if (existingWorker) return res.status(400).json({ message: 'Worker already exists' });

      const worker = new User({ name, email, phoneNumber, password, role: 'worker' });
      await worker.save();

      res.status(201).json({ message: 'Worker registered successfully', worker });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);



router.post(
  '/register-admin',
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('phoneNumber').isMobilePhone().withMessage('Invalid phone number').trim().escape(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phoneNumber, password } = req.body;
    try {
      const existingWorker = await User.findOne({ email });
      if (existingWorker) return res.status(400).json({ message: 'Admin already exists' });

      const admin = new User({ name, email, phoneNumber, password, role: 'admin' });
      await admin.save();

      res.status(201).json({ message: 'Admin registered successfully', admin });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);



router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array()); 
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email : { $regex: new RegExp(`^${email}$`, 'i') } });
      console.log(req.body.email);
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });






      const payload = { id: user._id, role: user.role };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);


router.get('/alluser',async(req,res)=>{
  try{
    const user = await User.find();
    res.json({user});
  }
  catch(error)
  {
    console.log(error);
    res.status(500).send(`error`);
  }
})

router.delete('/deleteuser/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only admins can delete users.' });
  }

  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user', details: error.message });
  }
});



module.exports = router;
