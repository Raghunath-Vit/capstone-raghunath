import { useState } from 'react';
import { Container, TextField, Typography, Button, Box, Snackbar, IconButton } from '@mui/material';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Close as CloseIcon } from '@mui/icons-material';

const Booking = () => {
  const { id: serviceProviderId } = useParams(); 
  const { user, token } = useSelector((state) => state.auth); 
  const [bookingDate, setBookingDate] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate(); 

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!bookingDate) {
      setSnackbarMessage('Please select a booking date');
      setSnackbarOpen(true);
      return;
    }

    try {
      
      const response = await axios.post('http://localhost:5000/api/bookings', {
        userId: user.id,
        serviceProviderId: serviceProviderId,
        bookingDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { message } = response.data;
      setSnackbarMessage(message || 'Booking created successfully!');
      setSnackbarOpen(true);

      navigate('/create-service'); 
    } catch (err) {
      console.error(err);
      
      const errorMessage = err.response?.data?.message || 'Error creating booking';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  return (
    <Container sx={{ paddingY: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }} align="center">
        Create a Booking
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400, margin: 'auto' }}>
        <TextField
          label="User ID"
          variant="outlined"
          value={user.id} 
          InputProps={{
            readOnly: true,
          }}
          fullWidth
        />
        <TextField
          label="Service Provider ID"
          variant="outlined"
          value={serviceProviderId} 
          InputProps={{
            readOnly: true,
          }}
          fullWidth
        />
        {/* <TextField
          label="Booking Date"
          variant="outlined"
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        /> */}
         <TextField
          label="Booking Date"
          variant="outlined"
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: today, 
          }}
          fullWidth
        />
        <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: '#6a1b9a' }}>
          Submit Booking
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
};

export default Booking;
