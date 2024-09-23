import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, IconButton, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/alluser');
        setUsers(response.data.user);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
    
      await axios.delete(`http://localhost:5000/auth/deleteuser/${userToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(users.filter(user => user._id !== userToDelete._id));
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      handleCloseDialog();
    }
  };

  return (
    <Container sx={{ paddingY: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        View Users
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search by name or email"
          value={search}
          onChange={handleSearch}
          sx={{ flex: 1 }}
        />
        <IconButton>
          <SearchIcon />
        </IconButton>
      </Box>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="h6" fontWeight="bold">Name</Typography></TableCell>
                <TableCell><Typography variant="h6" fontWeight="bold">Email</Typography></TableCell>
                <TableCell><Typography variant="h6" fontWeight="bold">Role</Typography></TableCell>
                <TableCell><Typography variant="h6" fontWeight="bold">Details</Typography></TableCell>
                <TableCell><Typography variant="h6" fontWeight="bold">Remove</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <React.Fragment key={user._id}>
                  <TableRow>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRowClick(user._id)}
                        sx={{ textTransform: 'none', transition: '0.3s', '&:hover': { backgroundColor: 'primary.dark' } }}
                      >
                        Details
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteClick(user)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                      <Collapse in={expandedRow === user._id}>
                        <Box sx={{ padding: 2 }}>
                          <Typography variant="h6">Details:</Typography>
                          <Typography>Email: {user.email}</Typography>
                          <Typography>Phone Number: {user.phoneNumber}</Typography>
                          
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" startIcon={<CheckIcon />}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewUsers;
