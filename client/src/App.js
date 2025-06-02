import React, { useState } from 'react';
import './App.css';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  Container,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function App() {
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address format.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('https://amazon-price-notifier.onrender.com/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url, targetPrice: parseFloat(price) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error === 'Invalid or unreachable email address') {
          setSnackbar({ open: true, message: 'The entered email address is invalid or cannot be reached. Please check and try again.', severity: 'error' });
        } else {
          throw new Error(errorData.error || 'Failed to track item');
        }
        return;
      }

      const data = await res.json();
      setSnackbar({ open: true, message: `Item tracked successfully!`, severity: 'success' });
      setEmail('');
      setUrl('');
      setPrice('');
    } catch (err) {
      setSnackbar({ open: true, message: 'Error tracking item', severity: 'error' });
      console.error("Error during tracking:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box className="title-container">
        <Typography className="title-text">
          <NotificationsActiveIcon fontSize="medium" />
          Amazon Price Drop Notifier
        </Typography>
        <Typography className="subtitle-text">
          Get notified when your favorite Amazon item drops in price!
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          className="custom-textfield"
          type="email"
          label="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          className="custom-textfield"
          type="url"
          label="Amazon Product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <TextField
          className="custom-textfield"
          type="number"
          label="Target Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <Button
          className="custom-button"
          type="submit"
          variant="contained"
          color="primary"
          disabled={!emailRegex.test(email) || loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Track'}
        </Button>

        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mt: 2, fontStyle: 'italic' }}
        >
          Make sure the Amazon product URL you enter is correct.
        </Typography>

      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
