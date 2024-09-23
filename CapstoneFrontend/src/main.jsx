import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import store from './redux/store';
import { Provider } from 'react-redux';
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Paper } from '@mui/material';



const theme = createTheme({
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 1px rgba(0, 0, 0, 0.14)', // shadow[1]
    '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)', // shadow[2]
    '0px 3px 10px rgba(0, 0, 0, 0.20), 0px 3px 10px rgba(0, 0, 0, 0.22)', // shadow[3]
    '0px 5px 15px rgba(0, 0, 0, 0.2)', // shadow[4]
    
  ],
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
});


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
    <Paper elevation={4}>
    <Router>
    <App />
    </Router>
    </Paper>
    </ThemeProvider>
  </Provider>,
)
