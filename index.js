const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Step 1: Redirect to Spotify login
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email';
  const authUrl = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    });

  res.redirect(authUrl);
});

// Step 2: Spotify redirects back with code
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    const { access_token } = response.data;

    // Step 3: Redirect to frontend with access token
    res.redirect(`http://127.0.0.1:3000/?access_token=${access_token}`);

  } catch (error) {
    console.error('Error getting tokens:', error.response?.data || error.message);
    res.status(500).send('Error getting tokens');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Moodify backend running on http://localhost:${PORT}/login`);
});
