import { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Divider, TextField, MenuItem, Grid, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SearchIcon from '@mui/icons-material/Search';
import ReactStars from 'react-rating-stars-component'; 

const MyBooking = () => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({}); 
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/mybooking/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(response.data.bookings);
        setFilteredBookings(response.data.bookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Error fetching bookings');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchBookings();
    }
  }, [id, token]);

  useEffect(() => {
    const fetchRatings = async () => {
      const newRatings = {};
      for (const booking of bookings) {
        try {
          const response = await axios.get(`http://localhost:5000/api/bookings/${booking._id}/rate`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          newRatings[booking._id] = response.data.rating; 
        } catch (error) {
          console.error('Error fetching rating:', error.response?.data?.error || error.message);
        }
      }
      setRatings(newRatings); 
    };
  
    if (bookings.length > 0) {
      fetchRatings();
    }
  }, [bookings, token]);

  useEffect(() => {
    let updatedBookings = bookings;

    if (searchQuery) {
      updatedBookings = updatedBookings.filter((booking) =>
        booking.serviceProviderId.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.serviceProviderId.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterOption === 'lastBooking') {
      updatedBookings = updatedBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    } else if (filterOption === 'oldBooking') {
      updatedBookings = updatedBookings.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
    } else if (filterOption === 'highestRating') {
      updatedBookings = updatedBookings.sort((a, b) => b.serviceProviderId.rating - a.serviceProviderId.rating);
    } else if (['Pending', 'Confirmed', 'Completed', 'Closed'].includes(filterOption)) {
      updatedBookings = updatedBookings.filter((booking) => booking.status === filterOption);
    }

    setFilteredBookings(updatedBookings);
  }, [searchQuery, filterOption, bookings]);

  const handleCardClick = (booking) => {
    if (booking.status === 'Pending' || booking.status === 'Confirmed') {
      setAlertMessage('Service has not started yet. You cannot rate this booking.');
    } else {
      navigate(`/${booking._id}/giverating`);
    }
  };

  if (loading) {
    return (
      <Container sx={{ paddingY: 5 }}>
        <Typography variant="h4" align="center">Loading your bookings...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ paddingY: 5 }}>
        <Typography variant="h4" align="center" color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ paddingY: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3, color: '#6a1b9a' }} align="center">
        My Bookings
      </Typography>

      {alertMessage && (
        <Alert severity="info" onClose={() => setAlertMessage('')}>
          {alertMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search by Service Provider or Service Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '100%', maxWidth: 400 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ marginRight: 1 }} />,
          }}
        />

        <TextField
          select
          label="Filter By"
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          sx={{ width: '100%', maxWidth: 200 }}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem disabled>Sorting Options</MenuItem>
          <MenuItem value="lastBooking">Last Booking</MenuItem>
          <MenuItem value="oldBooking">Old Booking</MenuItem>
          <MenuItem value="highestRating">Highest Rating</MenuItem>
          <MenuItem disabled>Status Options</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Confirmed">Confirmed</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Closed">Closed</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
      
        {filteredBookings.length > 0 ? (
  filteredBookings.map((booking, index) => {
    const serviceProvider = booking.serviceProviderId;
    const user = serviceProvider ? serviceProvider.userId : null;
    
    return (
      <Grid item xs={12} md={6} lg={4} key={booking._id}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card
            sx={{
              maxWidth: 400,
              margin: 'auto',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' },
              background: '#fff',
              borderRadius: '12px',
            }}
            onClick={() => handleCardClick(booking)}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#37474f' }}>
                {user ? `Service Provider: ${user.name}` : 'Service Provider Info Unavailable'}
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {serviceProvider ? serviceProvider.serviceName : 'Service Name Unavailable'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#1976d2' }} /> {user ? user.email : 'Email Unavailable'}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ color: '#388e3c' }} /> {user ? user.phoneNumber : 'Phone Unavailable'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventAvailableIcon sx={{ color: '#f57c00' }} /> Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}
              </Typography>

              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Rating: {ratings[booking._id] !== undefined ? (
                  <ReactStars
                    count={5}
                    value={ratings[booking._id]}
                    size={24}
                    edit={false}
                    activeColor="#ffd700"
                  />
                ) : 'Not rated yet'}
              </Typography>

              <Typography variant="body1" sx={{ color: 'gray' }}>
                Status: <span style={{ color: booking.status === 'Confirmed' ? 'green' : booking.status === 'Pending' ? 'orange' : booking.status === 'Completed' ? 'green' :'red' }}>{booking.status}</span>
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    );
  })
) : (
  <Typography variant="h6" align="center">No bookings found.</Typography>
)}

      </Grid>
    </Container>
  );
};

export default MyBooking;
