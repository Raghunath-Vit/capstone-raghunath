import { useState, useEffect } from 'react';  
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, MenuItem, Snackbar, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Email as EmailIcon, Lock as LockIcon, Person as PersonIcon, Phone as PhoneIcon } from '@mui/icons-material';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/actions';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = { name, email, phoneNumber, password };

    try {
      const endpoint = role === 'worker' 
        ? 'http://localhost:5000/auth/register-worker' 
        : 'http://localhost:5000/auth/register';
      await axios.post(endpoint, userData);

      dispatch(loginUser(email, password));
    } catch (err) {
      const backendMessage = err.response?.data?.message || 'Registration failed'; 
      setError(backendMessage);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/create-service' : '/create-service');
    }
  }, [user, navigate]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setError(''); 
  };

  return (
    <Box
      sx={{
        height: '135vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f3e5f5',
      }}
    >
      <Container
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        maxWidth="xs"
        sx={{
          bgcolor: '#fafafa',
          borderRadius: 2,
          boxShadow: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '7rem',
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 2, color: '#6a1b9a' }}>
          Create an Account
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              InputProps={{
                startAdornment: <PersonIcon sx={{ color: '#6a1b9a', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6a1b9a' },
                  '&:hover fieldset': { borderColor: '#6a1b9a' },
                  '&.Mui-focused fieldset': { borderColor: '#6a1b9a' },
                },
              }}
              aria-label="Name"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: '#6a1b9a', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6a1b9a' },
                  '&:hover fieldset': { borderColor: '#6a1b9a' },
                  '&.Mui-focused fieldset': { borderColor: '#6a1b9a' },
                },
              }}
              aria-label="Email"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              InputProps={{
                startAdornment: <PhoneIcon sx={{ color: '#6a1b9a', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6a1b9a' },
                  '&:hover fieldset': { borderColor: '#6a1b9a' },
                  '&.Mui-focused fieldset': { borderColor: '#6a1b9a' },
                },
              }}
              aria-label="Phone Number"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: <LockIcon sx={{ color: '#6a1b9a', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6a1b9a' },
                  '&:hover fieldset': { borderColor: '#6a1b9a' },
                  '&.Mui-focused fieldset': { borderColor: '#6a1b9a' },
                },
              }}
              aria-label="Password"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6a1b9a' },
                  '&:hover fieldset': { borderColor: '#6a1b9a' },
                  '&.Mui-focused fieldset': { borderColor: '#6a1b9a' },
                },
              }}
              aria-label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="worker">Worker</MenuItem>
            </TextField>
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: '#6a1b9a',
              '&:hover': { bgcolor: '#4e0e6c' },
              boxShadow: 2,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </form>

       
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6a1b9a', textDecoration: 'none', fontWeight: 'bold' }}>
            Log In
          </Link>
        </Typography>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={error}
          action={
            <Button color="inherit" onClick={handleSnackbarClose}>
              Close
            </Button>
          }
        />
      </Container>
    </Box>
  );
};

export default Register;
