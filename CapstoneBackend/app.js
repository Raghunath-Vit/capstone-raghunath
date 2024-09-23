const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const serviceRoutes = require('./routes/Services');
const bookingRoutes = require('./routes/Bookings');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const serviceProviderRoutes = require('./routes/ServiceProvidersRoutes');
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./config/passport');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });



dotenv.config();
// console.log(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_PHONE_NUMBER);
connectDB();

const app = express();
// Enable CORS for all origins or specify only the frontend origin
app.use(cors({
  origin: 'http://localhost:5173', // Allow only this origin
  credentials: true // Enable sending credentials like cookies (if needed)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.agent = agent;  // Attach the agent globally if needed
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// app.use('/api/services', serviceRoutes);
app.use('/auth', authRoutes);
app.use('/api', categoryRoutes);
app.use('/apis', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/providers',serviceProviderRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

