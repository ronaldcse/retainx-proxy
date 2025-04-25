const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace this with your actual deployed Google Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-NiCxB6a3CIlDzZxc5JWvUjH_cjEYdP0xd02YbommprqCe3HXLX_weRu9uLmWZp0N/exec';

app.use(cors());
app.use(express.json());

app.post('/sync', async (req, res) => {
  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Sync error:', error.message);
    res.status(500).send('❌ Proxy error: ' + error.message);
  }
});

app.get('/', (req, res) => {
  res.send('✅ RetainX Proxy is running');
});

app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});
