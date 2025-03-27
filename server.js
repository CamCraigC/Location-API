const express = require('express');
const cors = require('cors'); // Import the cors package
const fetch = require('node-fetch'); // Using node-fetch v2

const app = express();

// Enable CORS for specific origins (your GitHub Pages domain)
const allowedOrigins = ['https://CamCraigC.github.io/Update-Location/'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  }
}));

// Middleware to parse JSON in incoming requests
app.use(express.json());

// Endpoint to handle the update request from your front-end
app.post('/update-method', async (req, res) => {
  console.log('Received request at /update-method:', JSON.stringify(req.body, null, 2));

  const { recordId, authCode, payload } = req.body;

  if (!recordId || !authCode || !payload) {
    return res.status(400).json({ error: 'Missing required parameters: recordId, authCode, and payload are needed.' });
  }

  try {
    const methodEndpoint = `https://rest.method.me/api/v1/tables/CustomSchedule/${recordId}`;
    console.log(`Forwarding request to ${methodEndpoint} using authCode ${authCode}. Payload:`, payload);

    const response = await fetch(methodEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `APIKey ${authCode}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status from Method:CRM:', response.status);

    if (response.status === 204) {
      return res.status(200).json({ message: 'Record updated successfully.' });
    } else {
      const errorData = await response.json();
      console.error('Error response from Method:CRM:', errorData);
      return res.status(response.status).json(errorData);
    }
  } catch (error) {
    console.error('Error communicating with Method:CRM:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Bind the server to the PORT environment variable
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

});


