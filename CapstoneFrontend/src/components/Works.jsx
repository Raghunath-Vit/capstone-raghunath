import { useEffect, useState, useCallback } from 'react'; 
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, ListItem, ListItemText, Paper, Tab, Tabs, Modal, IconButton, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Works = () => {
  const [requestedBookings, setRequestedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/requestedbooking/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.bookings) {
        setRequestedBookings(response.data.bookings);
      } else {
        setRequestedBookings([]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching bookings' );
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchBookings();
  }, [user, token, fetchBookings]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getBookingsByStatus = (status) => {
    return requestedBookings.filter(booking => booking.status.toLowerCase() === status.toLowerCase());
  };

  const handleDoubleClick = (booking) => {
    setSelectedBooking(booking);
    setOpenModal(true);
  };

  const handleDoubleClickConfirmed = (bookingId) => {
    navigate(`/verifywork/${bookingId}`);
  };

  const handleResponse = async (responseMessage) => {
    if (!selectedBooking) return;

    try {
      await axios.post('http://localhost:5000/api/bookings/notify', {
        message: responseMessage,
        bookingId: selectedBooking._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOpenModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.log('Error sending response:', err);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBooking(null);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Requested Bookings
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ padding: 2, maxWidth: 1200, margin: 'auto' }}>
        <Tab label="Pending" />
        <Tab label="Confirmed" />
        <Tab label="Completed" />
        <Tab label="Closed" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">No Bookings Found</Typography>
      ) : (
        <>
          {requestedBookings.length === 0 ? (
            <Typography color="text.secondary" align="center">No Work Requests by customers.</Typography>
          ) : (
            <Grid container spacing={3}>
              {tabValue === 0 && getBookingsByStatus('Pending').map((booking) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={booking._id}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.3 }}
                    onDoubleClick={() => handleDoubleClick(booking)}
                  >
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, height: 150 }}>
                      <ListItem>
                        <ListItemText 
                          primary={<Typography variant="h6">{booking.userId.name}</Typography>}
                          secondary={
                            <>
                              <Typography variant="body2">Service: {booking.serviceProviderId.serviceName}</Typography>
                              <Typography variant="body2">Date: {new Date(booking.bookingDate).toLocaleDateString()}</Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
              {tabValue === 1 && getBookingsByStatus('Confirmed').map((booking) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={booking._id}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.3 }}
                    onDoubleClick={() => handleDoubleClickConfirmed(booking._id)}
                  >
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, height: 150 }}>
                      <ListItem>
                        <ListItemText 
                          primary={<Typography variant="h6">{booking.userId.name}</Typography>}
                          secondary={
                            <>
                              <Typography variant="body2">Service: {booking.serviceProviderId.serviceName}</Typography>
                              <Typography variant="body2">Date: {new Date(booking.bookingDate).toLocaleDateString()}</Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
              {tabValue === 2 && getBookingsByStatus('Completed').map((booking) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={booking._id}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.3 }}
                    onDoubleClick={() => handleDoubleClickConfirmed(booking._id)} 
                  >
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, height: 150 }}>
                      <ListItem>
                        <ListItemText 
                          primary={<Typography variant="h6">{booking.userId.name}</Typography>}
                          secondary={
                            <>
                              <Typography variant="body2">Service: {booking.serviceProviderId.serviceName}</Typography>
                              <Typography variant="body2">Date: {new Date(booking.bookingDate).toLocaleDateString()}</Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
              {tabValue === 3 && getBookingsByStatus('Closed').map((booking) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={booking._id}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.3 }}
                  >
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, height: 150 }}>
                      <ListItem>
                        <ListItemText 
                          primary={<Typography variant="h6">{booking.userId.name}</Typography>}
                          secondary={
                            <>
                              <Typography variant="body2">Service: {booking.serviceProviderId.serviceName}</Typography>
                              <Typography variant="body2">Date: {new Date(booking.bookingDate).toLocaleDateString()}</Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {selectedBooking && (
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            bgcolor: 'background.paper', 
            boxShadow: 24, 
            p: 4, 
            borderRadius: 2 
          }}>
            <Typography variant="h6" gutterBottom>
              Do you want to accept the task?
            </Typography>
            <Box display="flex" justifyContent="space-around" mt={2}>
              <IconButton onClick={() => handleResponse('Accepted')}>
                <CheckIcon color="primary" />
              </IconButton>
              <IconButton
                onClick={() => {
                  handleResponse('Rejected');
                  handleCloseModal();
                }}
              >
                <CloseIcon color="error" />
              </IconButton>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default Works;
