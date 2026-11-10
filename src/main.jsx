import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { trTR } from '@mui/material/locale';
import 'leaflet/dist/leaflet.css';
import './index.css';

import App from './App';

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1e3a5f' },
      secondary: { main: '#f28c28' },
      background: { default: '#f4f6f9' },
    },
    shape: { borderRadius: 10 },
  },
  trTR,
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
