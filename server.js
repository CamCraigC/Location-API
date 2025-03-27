// server.js

const express = require('express');
const fetch = require('node-fetch'); // Using node-fetch v2

const app = express();

// Middleware to parse JSON in incoming requests.
app.use(express.json());

// Endpoint to handle the update request from your front-end
app.post('/update-method', async (req, res) => {
  // Log the incoming request for debugging
  console.log('Received request at /update-method:');
  console.log(JSON.stringify(req.body, null, 2));
  
  // Destructure required parameters from the request body.
  const { recordId, authCode, payload } = req.body;
  
  // Check if required parameters are provided
  if (!recordId || !authCode || !payload) {
    return res.status(400).json({ error: 'Missing required parameters. (recordId, authCode, and payload are needed)' });
  }
  
  try {
    // Construct the Method:CRM API endpoint URL.
    const methodEndpoint = `https://rest.method.me/api/v1/tables/CustomSchedule/${recordId}`;
    console.log('Forwarding request to:', methodEndpoint);
    console.log('Using authCode:', authCode);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Send the PATCH request to the Method:CRM API.
    const response = await fetch(methodEndpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${authCode}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status from Method:CRM:', response.status);
    
    if (response.status === 204) {
      // Success: 204 No Content means the update went through.
      return res.status(200).json({ message: 'Record updated successfully.' });
    } else {
      // Otherwise, capture and log the error data.
      const errorData = await response.json();
      console.error('Error data from Method:CRM:', errorData);
      return res.status(response.status).json(errorData);
    }
    
  } catch (error) {
    console.error('Error communicating with Method:CRM:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Start the server on port 3001 or the port specified by the environment.
const PORT = process.env.PORT; // Remove any hardcoding or fallback to `10000`
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


