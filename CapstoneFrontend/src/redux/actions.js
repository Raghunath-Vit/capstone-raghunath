import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const CLEAR_ERROR = 'CLEAR_ERROR'; 


export const clearError = () => ({ 
  type: CLEAR_ERROR,
});


export const loginUser = (email, password) => async (dispatch) => {
  try {
    const res = await axios.post('http://localhost:5000/auth/login', { email, password });
    const { token } = res.data;
    const decodedToken = jwtDecode(token);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token,
        user: decodedToken,
        serviceProviderId: decodedToken.serviceProviderId || null,
      },
    });

    localStorage.setItem('jwtToken', token);
  } catch (error) {
    const errorMessage = Array.isArray(error.response.data.errors)
    ? error.response.data.errors.map(err => err.msg).join(', ')
    : error.response.data.message;
    dispatch({
      type: LOGIN_FAILURE,
      payload: errorMessage,
    });
  }
};

export const logoutUser = () => {
  localStorage.removeItem('jwtToken');
  return {
    type: LOGOUT,
  };
};
