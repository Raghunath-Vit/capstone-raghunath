import  { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { decodeToken } from './utils/jwtDecode';
import {  Routes, Route} from 'react-router-dom';
import { LOGIN_SUCCESS } from './redux/actions';
import Admin from './components/Admin';
import Worker from './components/Worker';
import User from './components/User';
import Login from './components/Login';
import Navbar from './components/Navbar';
import CreateCategory from './components/CreateCategory';
import CreateService from './components/CreateService';
import ViewUsers from './components/ViewUsers';
import Works from './components/Works';
import AddService from './components/AddService';
import Booking from './components/booking';
import MyBooking from './components/MyBooking';
import VerifyWork from './components/VerifyWork';
import OtpEnter from './components/OtpEnter';
import GiveRating from './components/GiveRating';
import Register from './components/Register';
import Footer from './components/Footer';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decoded = decodeToken(token);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token,
          user: decoded,
        },
      });
    }
  }, [dispatch]);

  return (
    <>
    <Navbar/>
   
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/worker" element={<Worker />} />
        <Route path="/user" element={<User />} />
        <Route path="/create-category" element={<CreateCategory />} />
        <Route path="/create-service" element={<CreateService />} />
        <Route path="/add-service/:id" element={<AddService/>} />
        <Route path="/view-users" element={<ViewUsers />} />
        <Route path="/works" element={<Works />} />
        <Route path="/booknow/:id" element={<Booking/>} />
        <Route path="/mybooking/:id" element={<MyBooking/>} />
        <Route path="/verifywork/:id" element={<VerifyWork/>} />
        <Route path='/otpverify/:id' element={<OtpEnter/>} />
        <Route path='/:id/giverating' element={<GiveRating/>} /> 
        <Route path='/register' element={<Register/>} />
      </Routes>
      <Footer/>
    </>
  );
};

export default App;
