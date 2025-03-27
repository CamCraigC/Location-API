const express = require('express');
const cors = require('cors'); // Import the cors package
const fetch = require('node-fetch'); // Using node-fetch v2

const app = express();

// Enable CORS for your GitHub Pages domain
app.use(cors({
  origin: 'https://CamCraigC.github.io', // Replace with your actual GitHub Pages URL
  methods: ['GET', 'POST', 'PATCH'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers
}));

// Middleware to parse JSON in incoming requests
app.use(express.json());

// Endpoint to handle the update request from your front-end
app.post('/update-method', async (req, res) => {
  const { recordId, authCode, payload } = req.body;

  if (!recordId || !authCode || !payload) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const methodEndpoint = `https://rest.method.me/api/v1/tables/CustomSchedule/${recordId}`;
    const response = await fetch(methodEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `APIKey ${authCode}`
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 204) {
      return res.status(200).json({ message: 'Record updated successfully.' });
    } else {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Bind the server to the PORT environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




