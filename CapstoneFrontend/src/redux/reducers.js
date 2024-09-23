import { LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, CLEAR_ERROR  } from './actions';

const initialState = {
  token: null,
  user: null,
  error: null,
  serviceProviderId:null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        serviceProviderId: action.payload.serviceProviderId,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
      case CLEAR_ERROR: // Handle CLEAR_ERROR action
      return {
        ...state,
        error: null,
      };
    case LOGOUT:
      return {
        ...state,
        token: null,
        user: null,
        serviceProviderId: null,
      };
    default:
      return state;
  }
};

export default authReducer;
