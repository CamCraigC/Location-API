const express = require('express');
const cors = require('cors'); // Import the cors package
const fetch = require('node-fetch'); // Using node-fetch v2

const app = express();

// Enable CORS for *.github.io domains
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from *.github.io or same-site requests
      if (!origin || origin.endsWith('github.io')) {
        callback(null, true);
      } else {
        console.error('Blocked by CORS:', origin); // Log blocked origin
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['POST'], // Allow only POST requests
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow required headers
  })
);

// Middleware to parse JSON in incoming requests
app.use(express.json());

// Root route to handle requests
app.post('/', async (req, res) => {
  console.log('Incoming request at root endpoint:', JSON.stringify(req.body, null, 2));

  const { recordId, authCode, ActualStartLatitude, ActualStartLongitude } = req.body;

  // Validate required parameters
  if (!recordId || !authCode || !ActualStartLatitude || !ActualStartLongitude) {
    console.error('Missing parameters in request body.');
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const methodEndpoint = `https://rest.method.me/api/v1/tables/CustomSchedule/${recordId}`;
    console.log(`Forwarding request to Method:CRM endpoint: ${methodEndpoint}`);

    // Convert latitude and longitude to strings before sending to Method:CRM
    const payload = {
      ActualStartLatitude: String(ActualStartLatitude),
      ActualStartLongitude: String(ActualStartLongitude),
    };
    console.log('Payload being sent to Method:CRM (as strings):', JSON.stringify(payload, null, 2));

    // Send the PATCH request to Method:CRM API
    const response = await fetch(methodEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json', // Ensure correct Content-Type header
        Authorization: `APIKey ${authCode}`, // Include the Authorization header
      },
      body: JSON.stringify(payload), // Send formatted payload
    });

    console.log('Response status from Method:CRM:', response.status);

    if (response.status === 204) {
      console.log('Record updated successfully.');
      return res.status(200).json({ message: 'Record updated successfully.' });
    } else {
      const errorData = await response.json();
      console.error('Error from Method:CRM:', JSON.stringify(errorData, null, 2));
      return res.status(response.status).json(errorData);
    }
  } catch (error) {
    console.error('Error communicating with Method:CRM:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Bind the server to Render's PORT environment variable or fallback to port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
