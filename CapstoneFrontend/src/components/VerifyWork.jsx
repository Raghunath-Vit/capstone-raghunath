import { useState } from 'react'; 
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, TextField, CircularProgress, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Close } from '@mui/icons-material';

const VerifyWork = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [beforeWorking, setBeforeWorking] = useState(null);
  const [afterWorking, setAfterWorking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'beforeWorking') setBeforeWorking(files[0]);
    if (name === 'afterWorking') setAfterWorking(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!beforeWorking || !afterWorking) {
      setError('Both "Before Working" and "After Working" images are required.');
      return;
    }

    const formData = new FormData();
    formData.append('beforeWorking', beforeWorking);
    formData.append('afterWorking', afterWorking);

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(`http://localhost:5000/api/bookings/${id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(response.data.message);
      setLoading(false);
      navigate(`/otpverify/${id}`);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  const renderPreview = (file, setFile) => {
    if (!file) return null;

    const previewUrl = URL.createObjectURL(file);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        style={{ position: 'relative', marginBottom: '16px',marginTop:'10px' }}
      >
        <img src={previewUrl} alt="Preview" style={{ width: '90%',height:'300px',objectFit:'cover' ,borderRadius: '8px' }} />
        <IconButton
          onClick={() => setFile(null)}
          style={{ position: 'absolute', top: 5, right: 60, color: 'purple' }}
        >
          <Close />
        </IconButton>
      </motion.div>
    );
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Upload Proof of Work
      </Typography>
      
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="primary">{success}</Typography>}
      
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <Typography variant="subtitle1">Before Working Image</Typography>
          <TextField
            type="file"
            name="beforeWorking"
            onChange={handleFileChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {renderPreview(beforeWorking, setBeforeWorking)}
        </Box>
        <Box mb={2}>
          <Typography variant="subtitle1">After Working Image</Typography>
          <TextField
            type="file"
            name="afterWorking"
            onChange={handleFileChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {renderPreview(afterWorking, setAfterWorking)}
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#8e44ad', 
                '&:hover': {
                  bgcolor: '#6a1b9a', 
                },
              }}
            >
              Submit Proof
            </Button>
          </motion.div>
        )}
      </form>
    </Box>
  );
};

export default VerifyWork;
