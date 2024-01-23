import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFBC0A',
      light: '#F4F4F4', 
      dark: '#192A51',  
      medium: '#7699D4',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ffa726', 
    },
    success: {
      main: '#4caf50', 
    },
    background: {
      default: '#192A51', 
    },
    text: {
      primary: '#FFBC0A',  
      secondary: '#192A51',
    },
  },
});

export default theme;