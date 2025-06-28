const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Replace with your actual client ID and secret from FatSecret
const fatsecretClientId = 'ae1278050dd24e2da6d9cc0070d8475a';
const fatsecretClientSecret = 'c1a194b14b6d4570bb91fad5daab3d76';

const dataFilePath = path.join(__dirname, 'foodLog.json');

// OAuth setup
const oauth = OAuth({
  consumer: { key: fatsecretClientId, secret: fatsecretClientSecret },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// USDA fallback API key (no auth)
const usdaApiKey = 'ERzh7My4V8wvIKqSP7x8KDOd144hYVZL9hZeb64y';

// ------------------ USDA SEARCH -----------------------
const fetchFoodDetailsUSDA = async (searchTerm) => {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchTerm)}&api_key=${usdaApiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  const simplifiedResults = data.foods.map((food) => {
    const nutrients = {};
    for (const n of food.foodNutrients) {
      const name = n.nutrientName;
      if (name === 'Protein') nutrients.protein = n.value;
      if (name === 'Total lipid (fat)') nutrients.fat = n.value;
      if (name === 'Carbohydrate, by difference') nutrients.carbs = n.value;
      if (name === 'Energy') nutrients.energy = n.value;
    }

    return {
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName ?? null,
      servingSize: food.servingSize ?? null,
      servingSizeUnit: food.servingSizeUnit ?? '',
      nutrients: {
        energy: nutrients.energy ?? null,
        protein: nutrients.protein ?? null,
        fat: nutrients.fat ?? null,
        carbs: nutrients.carbs ?? null,
      },
    };
  });

  return simplifiedResults;
};

// ------------------ FATSECRET SEARCH -----------------------
// const fetchFoodDetailsFs = async (searchTerm) => {
//   const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

//   const queryParams = {
//     method: 'foods.search',
//     format: 'json',
//     search_expression: searchTerm,
//   };

//   const requestData = {
//     url: baseUrl,
//     method: 'GET',
//     data: queryParams,
//   };

//   try {
//     const authHeader = oauth.toHeader(oauth.authorize(requestData));

//     const response = await axios.get(baseUrl, {
//       params: queryParams,
//       headers: {
//         ...authHeader,
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Error fetching from FatSecret:', error.message);
//     return { error: 'Failed to fetch from FatSecret' };
//   }
// };

const fetchFoodDetailsFs = async (searchTerm) => {
  const baseUrl = 'https://platform.fatsecret.com/rest/server.api';
  const queryParams = {
    method: 'foods.search',
    format: 'json',
    search_expression: searchTerm,
  };

  // Build query string from queryParams
  const urlSearchParams = new URLSearchParams(queryParams).toString();

  // Complete URL with query params appended (for OAuth signature)
  const fullUrl = `${baseUrl}?${urlSearchParams}`;

  const requestData = {
    url: fullUrl,
    method: 'GET',
  };

  try {
    // Generate OAuth header based on full URL including query params
    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    // Make GET request with full URL (no separate params)
    const response = await axios.get(fullUrl, {
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching from FatSecret:', error.message);
    return { error: 'Failed to fetch from FatSecret' };
  }
};


// ------------------ ROUTES -----------------------

// Read food log
app.get('/api/food-log', (req, res) => {
  try {
    const data = fs.readFileSync(dataFilePath);
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read log file' });
  }
});

// Search USDA
app.get('/api/usda/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query parameter' });

  try {
    const foodDetails = await fetchFoodDetailsUSDA(query);
    res.json({ results: foodDetails });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch USDA data' });
  }
});

// Search FatSecret
app.get('/api/fat-secret/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query parameter is required' });

  try {
    const foodDetails = await fetchFoodDetailsFs(query);
    res.json(foodDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch FatSecret data' });
  }
});

// Add new food log entry
app.post('/api/food-log', (req, res) => {
  const { date, entry } = req.body;

  try {
    const rawData = fs.readFileSync(dataFilePath);
    const data = JSON.parse(rawData);

    if (!data[date]) data[date] = {};
    const logId = 'log_' + Date.now();
    data[date][logId] = entry;

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.status(201).json({ message: 'Entry added', id: logId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write to log file' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
