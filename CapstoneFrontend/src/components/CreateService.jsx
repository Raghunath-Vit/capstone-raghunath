import { useEffect, useState, useRef } from 'react';
import { Container, Typography, Grid, Card, CardContent, CircularProgress, Modal, Box, IconButton, Button, TextField, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateService = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [newService, setNewService] = useState({ serviceName: '', description: '' });
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [deleteServiceName, setDeleteServiceName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const servicesEndRef = useRef(null);

  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchServices = async (categoryId) => {
    setLoadingServices(true);
    try {
      const response = await axios.get(`http://localhost:5000/apis/category/${categoryId}`);
      setServices(response.data);
      setLoadingServices(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoadingServices(false);
    }
  };

  const handleCardClick = (categoryId, categoryName) => {
    setModalOpen(true);
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    fetchServices(categoryId);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setServices([]);
    setNewService({ serviceName: '', description: '' });
    setShowServiceForm(false);
    setEditService(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService((prevService) => ({
      ...prevService,
      [name]: value,
    }));
  };

  const handleCreateService = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/apis/services',
        {
          categoryId: selectedCategoryId,
          serviceName: newService.serviceName,
          description: newService.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServices((prevServices) => [...prevServices, response.data]);
      servicesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setNewService({ serviceName: '', description: '' });
      setShowServiceForm(false);
      setSnackbarMessage('Service created successfully!');
      setSnackbarOpen(true);
      await fetchServices(selectedCategoryId);
    } catch (error) {
      console.error('Error creating service:', error);
      setSnackbarMessage('Error creating service.');
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = (service) => {
    setEditService(service);
    setNewService({
      serviceName: service.serviceName,
      description: service.description,
    });
    setShowServiceForm(true);
  };

  const handleUpdateService = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/apis/${editService._id}`,
        newService,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServices((prevServices) =>
        prevServices.map((service) =>
          service._id === response.data._id ? response.data : service
        )
      );
      setEditService(null);
      setNewService({ serviceName: '', description: '' });
      setShowServiceForm(false);
      setSnackbarMessage('Service updated successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating service:', error);
      setSnackbarMessage('Error updating service.');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = (serviceId, serviceName) => {
    setDeleteServiceId(serviceId);
    setDeleteServiceName(serviceName);
    setConfirmDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteModal(false);
    setDeleteServiceId(null);
    setDeleteServiceName('');
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/apis/services/${deleteServiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices((prevServices) => prevServices.filter((service) => service._id !== deleteServiceId));
      setConfirmDeleteModal(false);
      setSnackbarMessage('Service deleted successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting service:', error);
      setSnackbarMessage('Error deleting service.');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container sx={{ paddingY: 5, bgcolor: '#fafafa' }}>
      <Typography variant="h3" align="center" sx={{ fontWeight: 'bold', marginBottom: 3, color: '#6a1b9a' }}>
        Home services at your doorstep
      </Typography>

      {loading ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  bgcolor: '#fafafa',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.9)',
                  },
                }}
                onClick={() => handleCardClick(category._id, category.name)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>{category.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{category.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Modal open={modalOpen} onClose={handleModalClose} sx={{ overflowY: 'auto' }}>
        <Box sx={modalBoxStyles}>
          <IconButton onClick={handleModalClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" gutterBottom color="#6a1b9a">Services under "{selectedCategoryName}"</Typography>

          {loadingServices ? (
            <Grid container justifyContent="center"><CircularProgress /></Grid>
          ) : (
            <Grid container spacing={2}>
              {services.map((service) => (
                <Grid item xs={12} key={service._id}>
                  <Card
                    sx={{ marginBottom: 2, position: 'relative', cursor: 'pointer', bgcolor: '#ffffff', boxShadow: 2 }}
                    onClick={() => {
                      if (user && (user.role === 'worker' || user.role === 'user')) {
                        navigate(`/add-service/${service._id}`);
                      }
                    }}
                  >
                    {user && user.role === 'admin' ? (
                      <>
                        <IconButton
                          sx={{ position: 'absolute', top: 8, right: 32, color: '#6a1b9a' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(service);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          sx={{ position: 'absolute', top: 8, right: 8, color: '#f44336' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(service._id, service.serviceName);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : null}
                    <CardContent>
                      <Typography variant="h6">{service.serviceName}</Typography>
                      <Typography variant="body2" color="textSecondary">{service.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {showServiceForm && (
                <Grid item xs={12}>
                  <TextField
                    name="serviceName"
                    label="Service Name"
                    variant="outlined"
                    fullWidth
                    value={newService.serviceName}
                    onChange={handleInputChange}
                    sx={{ marginBottom: 2 }}
                  />
                  <TextField
                    name="description"
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={newService.description}
                    onChange={handleInputChange}
                    sx={{ marginBottom: 2 }}
                  />
                  <Button
                    variant="contained"
                    
                    onClick={editService ? handleUpdateService : handleCreateService}
                    sx={{ marginBottom: 2,bgcolor: '#6a1b9a', color: '#fff'}}
                  >
                    {editService ? 'Update Service' : 'Create Service'}
                  </Button>
                </Grid>
              )}
            </Grid>
          )}

        {user && user.role === 'admin' && (
          <Grid container justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setShowServiceForm((prev) => !prev)}
              sx={{ borderColor: '#6a1b9a', color: '#6a1b9a', '&:hover': { borderColor: '#6a1b9a', backgroundColor: '#f0e6f7' } }}
            >
              {showServiceForm ? 'Hide Form' : 'Add Service'}
            </Button>
          </Grid>
        )}
        </Box>
      </Modal>

       <Modal open={confirmDeleteModal} onClose={handleDeleteCancel}>
         <Box sx={confirmDeleteModalStyles}>
           <Typography variant="h6" gutterBottom color="#6a1b9a">Are you sure you want to delete the service "{deleteServiceName}"?</Typography>
           <Box sx={{ textAlign: 'right', marginTop: 3 }}>
             <Button variant="contained" color="error" onClick={handleDeleteConfirm} sx={{ marginRight: 2 }}>
               Delete
             </Button>
             <Button variant="outlined" onClick={handleDeleteCancel}>
               Cancel
             </Button>
           </Box>
         </Box>
      </Modal>

     
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      <div ref={servicesEndRef} />
    </Container>
  );
};

const modalBoxStyles = {
  position: 'absolute',
  top: '60%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxHeight: '70vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflowY: 'auto',
};

const confirmDeleteModalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default CreateService;