import { useState, useEffect } from 'react';   
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/actions';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Snackbar, CircularProgress, Link } from '@mui/material';
import { motion } from 'framer-motion';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, user } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(loginUser(email, password));
  };

  useEffect(() => {
    if (user) {
      setLoading(false);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/create-service' : '/create-service');
    } if (error) {
      setLoading(false);  
      setSnackbarOpen(true);  
    }
  }, [user, error, navigate]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    dispatch(clearError()); 
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f3e5f5', 
        minHeight: '600px',
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
        <Typography variant="h4" align="center" sx={{ mb: 2, color: '#2c2c54' }}>
          Welcome Back
        </Typography>
        <form onSubmit={handleSubmit}>
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
                startAdornment: <EmailIcon sx={{ color: '#2c2c54', mr: 1 }} />,  
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#2c2c54', 
                  },
                  '&:hover fieldset': {
                    borderColor: '#f4b400', 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f4b400',  
                  },
                },
              }}
              aria-label="Email"
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
                startAdornment: <LockIcon sx={{ color: '#2c2c54', mr: 1 }} />,  
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#2c2c54', 
                  },
                  '&:hover fieldset': {
                    borderColor: '#f4b400', 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f4b400',  
                  },
                },
              }}
              aria-label="Password"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: '#2c2c54', 
              color: '#ffffff',   
              '&:hover': {
                bgcolor: '#3c3c7b',  
              },
              boxShadow: 2,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
        <Snackbar
          open={snackbarOpen || !!error}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={error}
          onExited={() => setSnackbarOpen(false)}
          onEntered={() => setSnackbarOpen(true)}
          action={
            <Button color="inherit" onClick={handleSnackbarClose}>
              Close
            </Button>
          }
        />
        <Typography align="center" sx={{ mt: 2, color:"3c3c7b" }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" sx={{ color: '#f4b400', fontWeight: 'bold',textDecoration:"none" }}>  
            Register
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;

