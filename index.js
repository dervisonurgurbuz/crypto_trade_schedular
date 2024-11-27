// # All Coins' Information (USER_DATA)
// Get information of coins (available for deposit and withdraw) for user.
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

// Base URL and endpoint for Binance API
const BASE_URL = 'https://api.binance.com';
const endpoint = '/sapi/v1/capital/config/getall';

// Function to get Binance server time
async function getServerTime() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/time`);
    return response.data.serverTime;
  } catch (error) {
    throw new Error(`Failed to fetch Binance server time: ${error.message}`);
  }
}

// Function to generate a signed query string
function generateSignedQuery(params, secretKey) {
  const queryString = new URLSearchParams(params).toString();
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
  return `${queryString}&signature=${signature}`;
}

// Function to fetch all coins' information
async function getAllCoinsInfo() {
  try {
    // Fetch Binance server time
    const serverTime = await getServerTime();

    // Parameters for the API request
    const params = {
      timestamp: serverTime, // Use Binance server time
      recvWindow: 60000, // Set recvWindow to 60 seconds
    };

    // Generate signed query
    const signedQuery = generateSignedQuery(params, process.env.SECRET_KEY);

    // Make the GET request
    const response = await axios.get(`${BASE_URL}${endpoint}?${signedQuery}`, {
      headers: {
        'X-MBX-APIKEY': process.env.API_KEY, // Include the API key in headers
      },
    });
     // Write filtered coins to a file
     const outputPath = './coins_information.json';
     fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
    // Log the response
    console.log('All Coins Information:', response.data);
  } catch (error) {
    console.error('Error fetching coin information:', error.response?.data || error.message);
  }
}

// Call the function
getAllCoinsInfo();
