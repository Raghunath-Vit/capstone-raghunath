import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Box,
  Modal,
  TextField,
  Snackbar,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import ReactStars from "react-rating-stars-component";

const AddService = () => {
  const { id: serviceId } = useParams();
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [ratings, setRatings] = useState({});

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/providers/${serviceId}/service-providers`
      );
      setWorkers(response.data);

      // Fetch ratings for each worker
      const ratingsPromises = response.data.map((worker) =>
        axios.get(`http://localhost:5000/providers/${worker._id}/rate`)
      );

      const ratingsResponses = await Promise.all(ratingsPromises);
      const ratingsData = ratingsResponses.reduce((acc, curr, index) => {
        acc[response.data[index]._id] = curr.data.rating;
        return acc;
      }, {});

      setRatings(ratingsData);
    } catch (err) {
      console.log(err);
      setError("Error fetching workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [serviceId]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleDeleteClick = (workerId) => {
    setSelectedWorkerId(workerId);
    setConfirmDeleteModal(true);
  };

  const handleGiveRating = (workerId) => {
    navigate(`/${workerId}/giverating`, {
      state: { isServiceProvider: true },
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/providers/${serviceId}/deleteprovider/${selectedWorkerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbarMessage("Company removed successfully!");
      setSnackbarOpen(true);
      fetchWorkers();
    } catch (err) {
      const errorMessage =
        err.response && err.response.data
          ? err.response.data.error
          : "Error removing company";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setConfirmDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteModal(false);
    setSelectedWorkerId(null);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:5000/providers/${serviceId}/service-providers`,
        {
          serviceId,
          userId: user._id,
          serviceName,
          price,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbarMessage("Service added successfully!");
      setSnackbarOpen(true);
      handleCloseModal();
      fetchWorkers();
    } catch (err) {
      const errorMessage =
        err.response && err.response.data
          ? err.response.data.error
          : "Error adding service";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Container sx={{ paddingY: 5, bgcolor: "#fafafa" }}>
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ paddingY: 5, bgcolor: "#fafafa" }}>
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  const handleBookNow = (workerId) => {
    navigate(`/booknow/${workerId}`);
  };

  return (
    <Container sx={{ paddingY: 5, bgcolor: "#fafafa" }}>
      <Typography
        variant="h3"
        align="center"
        sx={{ fontWeight: "bold", marginBottom: 3, color: "#6a1b9a" }}
      >
          Service for the {user.role}
      </Typography>
      {user?.role === "worker" && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          sx={{ bgcolor: "#6a1b9a", color: "#fff" }}
        >
          Add Your Company
        </Button>
      )}
      {workers.length === 0 ? (
        <Typography
          variant="h6"
          align="center"
          sx={{ marginTop: 3, color: "#6a1b9a" }}
        >
          No Providers Found
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ marginTop: 3 }}>
          {workers.map((worker) => (
            <Grid item xs={12} sm={6} md={4} key={worker._id}>
              {/* <Card sx={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fafafa' }} onDoubleClick={() => handleGiveRating(worker._id)}> */}
              <Card
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  bgcolor: "#fafafa",
                }}
                onDoubleClick={() => {
                  if (user?.role === "user") {
                    handleGiveRating(worker._id);
                  }
                }}
              >
                {user?.role === "worker" && (
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "#f44336",
                    }}
                    onClick={() => handleDeleteClick(worker._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#6a1b9a" }}
                  >
                    {worker.serviceName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ marginY: 0.5 }}
                  >
                    Provider: {worker.userId.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ marginY: 0.5 }}
                  >
                    {worker.description}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ marginY: 0.5 }}
                  >
                    Contact: {worker.userId.phoneNumber}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      marginY: 0.5,
                    }}
                  >
                    Rating:{" "}
                    {ratings[worker._id] !== undefined ? (
                      <ReactStars
                        count={5}
                        value={ratings[worker._id]}
                        size={24}
                        edit={false}
                        activeColor="#ffd700"
                      />
                    ) : (
                      "Not rated yet"
                    )}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{ marginY: 1, fontSize: "1.2rem", color: "#333" }}
                  >
                    Price: ${worker.price}
                  </Typography>
                  {user?.role === "user" && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        marginTop: 2,
                        bgcolor: "#6a1b9a",
                        color: "#fff",
                        "&:hover": { bgcolor: "#5a138d" },
                      }}
                      onClick={() => handleBookNow(worker._id)}
                    >
                      Book Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Modal open={confirmDeleteModal} onClose={handleDeleteCancel}>
        <Box
          sx={{
            width: 400,
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            marginTop: "10%",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ marginBottom: 2, color: "#6a1b9a" }}
          >
            Are you sure you want to remove your company?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: 2,
            }}
          >
            <IconButton color="primary" onClick={handleDeleteConfirm}>
              <CheckIcon fontSize="large" />
            </IconButton>
            <IconButton color="error" onClick={handleDeleteCancel}>
              <ClearIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </Modal>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            width: 400,
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            marginTop: "10%",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{ marginBottom: 2, color: "#6a1b9a" }}
            >
              Add Your Company
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                display: "flex",
                position: "relative",
                left: "47%",
                marginBottom: 2,
                justifyContent: "flex-end",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            label="Service Name"
            variant="outlined"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            variant="outlined"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ bgcolor: "#6a1b9a", color: "#fff" }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </Container>
  );
};

export default AddService;
