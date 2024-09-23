
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/actions';
import { useNavigate } from 'react-router-dom';

const Worker = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div>
      <h1>Worker Dashboard</h1>
     
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Worker;
