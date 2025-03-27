const express = require('express');
const cors = require('cors'); // Import the cors package
const fetch = require('node-fetch'); // Using node-fetch v2

const app = express();

// Enable CORS for specific origins (GitHub Pages domain and similar)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from *.github.io domains or no-origin (same-site requests)
    if (!origin || origin.endsWith('github.io')) {
      callback(null, true); // Allow the request
    } else {
      console.error('Blocked by CORS:', origin); // Log the blocked origin
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  methods: ['GET', 'POST', 'PATCH'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow required headers
}));

// Middleware to parse JSON in incoming requests
app.use(express.json());

// Endpoint to handle the update request from your front-end
app.post('/Update-Location', async (req, res) => {
  console.log('Received request at /Update-Location:', JSON.stringify(req.body, null, 2));

  const { recordId, authCode, ActualStartLatitude, ActualStartLongitude } = req.body;

  // Validate required parameters
  if (!recordId || !authCode || !ActualStartLatitude || !ActualStartLongitude) {
    return res.status(400).json({ error: 'Missing required parameters: recordId, authCode, ActualStartLatitude, and ActualStartLongitude are needed.' });
  }

  try {
    // Construct the Method:CRM API endpoint URL
    const methodEndpoint = `https://rest.method.me/api/v1/tables/CustomSchedule/${recordId}`;
    console.log(`Forwarding request to ${methodEndpoint} using authCode ${authCode}. Payload:`, {
      ActualStartLatitude,
      ActualStartLongitude
    });

    // Send the PATCH request to the Method:CRM API
    const response = await fetch(methodEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `APIKey ${authCode}`
      },
      body: JSON.stringify({
        ActualStartLatitude,
        ActualStartLongitude
      })
    });

    console.log('Response status from Method:CRM:', response.status);

    if (response.status === 204) {
      // Success: 204 No Content means the update went through
      return res.status(200).json({ message: 'Record updated successfully.' });
    } else {
      // Capture and log the error data
      const errorData = await response.json();
      console.error('Error data from Method:CRM:', errorData);
      return res.status(response.status).json(errorData);
    }
  } catch (error) {
    console.error('Error communicating with Method:CRM:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Bind the server to the PORT environment variable or default to port 3000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




