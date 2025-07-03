const { connectToMongo, getUsersCollection, getUserFoodLog } = require('./mongoClient.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const { error } = require('console');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET = 'mysecretkey';

const app = express();
const PORT = process.env.PORT || 3000;
const appID='b08494a7';   
const appKey='529d67ea57ab70b06156cae6a637e856';

app.use(cors());
app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'foodLog.json');
const userFilePath = path.join(__dirname, 'users.json');
const apiKey='ERzh7My4V8wvIKqSP7x8KDOd144hYVZL9hZeb64y';


const fetchFoodDetailsUSDA=async (searchTerm)=>{
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchTerm)}&api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const simplifiedResults=data.foods.map(food=>{
      const nutrients={}
      for(const n of food.foodNutrients){
        const name=n.nutrientName;
        if(name==='Protein')nutrients.protein=n.value
        if(name==='Total lipid (fat)')nutrients.fat=n.value;
        if(name==='Carbohydrate, by difference')nutrients.carbs=n.value;
        if(name==='Energy')nutrients.energy=n.value;
      }
      return {
        fdcId:food.fdcId, 
        description:food.description,
        brandName: food.brandName ?? null,
        servingSize: food.servingSize ?? null,
        servingSizeUnit: food.servingSizeUnit ?? '',
        nutrients: {
          energy: nutrients.energy ?? null,
          protein: nutrients.protein ?? null,
          fat: nutrients.fat ?? null,
          carbs: nutrients.carbs ?? null
        }
      }
    })  
    return simplifiedResults;
} 
const fetchFoodDetailsNutrix=async (searchTerm)=>{
const url='https://trackapi.nutritionix.com/v2/search/instant';

 const headers = {
    
    'x-app-id': appID,     // replace with your actual app ID
    'x-app-key': appKey    // replace with your actual app key
  };
  const params = {
    query: searchTerm
  };

  try {
    const response = await axios.get(url, { headers,params });
    const brandedLimit=20;
    const commonLimit=20;
    const listToDisplay=[
  ...response.data.branded.slice(0, brandedLimit),
  ...response.data.common.slice(0, commonLimit)
];
const simplifiedResults= await Promise.all(listToDisplay.map(async(item)=>{
  let calories=0;
  const brandedItem=!!item.brand_name;

  try {
    if (brandedItem){
    const foodDetails= await axios.get(`https://trackapi.nutritionix.com/v2/search/item?nix_item_id=${item.nix_item_id}`, {
    headers: { 'x-app-id': appID, 'x-app-key': appKey }
  } 
); 
calories = foodDetails.data.foods?.[0]?.nf_calories || 0;
}
  else {
    const naturalInput = `${item.serving_qty || 1} ${item.serving_unit || ''} ${item.food_name}`;
    const foodDetails=await axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    query: naturalInput
  }, {
    headers: { 'x-app-id': appID, 'x-app-key': appKey, 'Content-Type': 'application/json' }
  });
  calories = foodDetails.data.foods?.[0]?.nf_calories || 0;
  }
  calories=Number.isInteger(calories)?calories:Number(calories.toFixed(1));
}
catch(err){console.error(`Error fetching details for ${item.food_name}:`, err.message);}
  
// let servingQty=
  return {
      servingQty:Number.isInteger(item.serving_qty)?item.serving_qty:Number(item.serving_qty.toFixed(1)),
      servingUnit:item.serving_unit,
      foodName:item.food_name,
      brandName:item.brand_name??null,
      brandedItemId:item.nix_item_id??null,
      tagId:item.tag_id??null,
      calories,
  }
}));
    return simplifiedResults;
  } catch (err) {
    console.error('Error from Nutritionix:', err.response?.data || err.message);
    throw err;
  }
}
// Read food log
app.get('/api/food-log', async (req, res) => {
// try {
//     const rawData = fs.readFileSync(dataFilePath,'utf-8');
//    const data=rawData.trim() === '' ? [] : JSON.parse(rawData);
//    res.status(200).json(data)
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to read log file', details: err.message });
//   }
const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
   try {
    const decoded = jwt.verify(token, SECRET); // Make sure SECRET matches your jwt.sign
    let foodLogCollection=getUserFoodLog();
    const logs = await foodLogCollection.find({ id: decoded.userId }).toArray();
    res.status(200).json({foodList:logs});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food logs', details: err.message });
  }
});

//fetch food details from usda API - no auth 
app.get('/api/usda/search',async (req,res)=>{
  const query=req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }
  try {
    const foodDetails=await fetchFoodDetailsUSDA(query);
    res.json({results:foodDetails});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food data' });
  }
});

//fetch food details from Nutritionix API -  using AXIOS 
app.get('/api/ntrx/search',async(req,res)=>{
  const searchTerm=req.query.food;
  try {
      const data=await fetchFoodDetailsNutrix(searchTerm);
      res.json({results:data});
  }
  catch(err){
    res.status(500).json({error:'Failed to fetch food Data'});
  }
})

// Add new log
app.post('/api/food-log', async (req, res) => {
  const { date, entry } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(400).json({message:'Missing token'});
  if (!date || !entry) {
    return res.status(400).json({ message: 'Missing date or food log entry' });
  }
  try{
    const decoded=jwt.verify(token,SECRET);
    const userId=decoded.userId;
    const userLog=getUserFoodLog();
    const result=await userLog.updateOne({id:userId,Date:date},{$push:{foodLog:entry}});
    if (result.modifiedCount === 0) {
      const newDoc = {
        id: userId,
        Date: date,
        foodLog: [{id:'LogId_'+Date.now(),...entry}],
      }
    await userLog.insertOne(newDoc);
  };
    res.status(201).json({message:'Food log inserted successfully',foodLog:await userLog.findOne({id:userId,Date:date})});
  }catch(err){
    res.status(500).json({message:'Internal Server error', error:err.message});
  }

  // try {
  //   const rawData = fs.readFileSync(dataFilePath);
  //   const data = JSON.parse(rawData);
  //   const existingDataEntry=data.foodList.find(entry=>entry.Date === date);
  //   const newID='LogId_'+Date.now();
  //   if(existingDataEntry){
  //      existingDataEntry.foodLog.push({id:newID,...entry})
  //   }
  //   else {
  //     data.foodList.push({
  //       Date:date,
  //       foodLog:[{id:newID,...entry}]
  //     })
  //   }

  //   fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  //   res.status(201).json({ message: 'Entry added', id: newID });
  // } catch (err) {
  //   res.status(500).json({ error: 'Failed to write to log file' });
  // }
});

app.delete('/api/food-log', async (req,res)=>{

  const {date,id}=req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  if (!id || !date) return res.status(400).json({ error: 'Missing foodId or date' });
  
   try{ const decoded=jwt.verify(token,SECRET);
    const userId=decoded.userId;
    let userLog=getUserFoodLog();
    const result=await userLog.updateOne({id:userId,Date:date},{$pull:{foodLog:{foodId:id}}});
  if(result.modifiedCount===0){
    return res.status(404).json({error:'Log already deleted'});
  }
 res.status(200).json({message:'Food lod deleted successfully'});
}catch(err){
  console.error('Error deleting food log:',err);
  res.status(500).json({error:'Internal Server error',details:err.message});
}
  // try {
  //   const rawData = fs.readFileSync(dataFilePath,'utf-8');
  //  const data=rawData.trim() === '' ? [] : JSON.parse(rawData);
   
  //   const dateEntry = data.foodList.find(entry => entry.Date === date);
   
  // if (!dateEntry) {
  //   return res.status(404).json({ error: 'no data for the entered Date' });
  // }
   
  // const logIndex = dateEntry.foodLog.findIndex(log => log.id === id);
  // console.log("dateFromQuery:",logIndex);
  // if (logIndex === -1) {
  //   return res.status(404).json({ error: 'Log ID not found' });
  // }
  // dateEntry.foodLog.splice(logIndex, 1);
  // if (dateEntry.foodLog.length === 0) {
  //     data.foodList = data.foodList.filter(entry => entry.Date !== date);
  //   }
  //   fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  // res.status(200).json({ message: 'Log deleted successfully' });
  // } catch (err) {
  //   res.status(500).json({ error: 'No Data to Delete', details: err.message });
  // }
  
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = getUsersCollection();
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, { expiresIn: '1h' });

    // Optionally store token if you're tracking sessions
    await users.updateOne({ email }, { $set: { token } });
    const userName=user.userName;
    res.json({ token, userName});
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }

//   --------------------------------------
//   --------------------------------------
//   const plainPassword = "123";
// bcrypt.hash(plainPassword, 10).then(hash => {
//   console.log("Generated hash:", hash);
  // Compare the same password with generated hash
//   bcrypt.compare(plainPassword, hash).then(result => {
//     console.log("Match?", result); // This should print: Match? true
//   });
// });

//   ------------------------------------------
//   ------------------------------------------
// try {
//     const rawData = fs.readFileSync(userFilePath, 'utf-8');
// let data = { users: [] };
// try {
//   data = JSON.parse(rawData);
// } catch (err) {
//   console.error("Invalid JSON:", rawData);
//   throw err;
// }
//    const user = data.users.find(u => u.email === email);
//   if (!user) return res.status(401).json({ error: 'User not found' });
//   const isMatch = await bcrypt.compare(password, user.passwordHash);
//   if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
//  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
//  user.token=token;
//  fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2), 'utf-8');
//  res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to read user data', details: err.message });
//   }
});
app.post('/api/verifyToken', (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password,userName } = req.body;
  const users = getUsersCollection();

  // Basic validation
  if (!email || !password || !userName ) {
    return res.status(400).json({ error: 'Email , password and name are required' });
  }
  const existingEmail = await users.findOne({ email });
  if (existingEmail) return res.status(409).json({ error: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: String(Date.now()),
    userName,
    email,
    passwordHash,
  };

  await users.insertOne(newUser);
  res.status(201).json({ message: 'User created' });

  // try {
  //   // Load existing users
  //   const rawData = fs.readFileSync(userFilePath, 'utf-8');
  //   const data = rawData.trim() === '' ? { users: [] } : JSON.parse(rawData);

  //   // Check if user already exists
  //   const existingUser = data.users.find(u => u.email === email);
  //   if (existingUser) {
  //     return res.status(409).json({ error: 'User already exists' });
  //   }

  //   // Hash password
  //   const passwordHash = await bcrypt.hash(password, 10);

  //   // Create new user
  //   const newUser = {
  //     id: Date.now(),
  //     email,
  //     passwordHash
  //   };

  //   data.users.push(newUser);

  //   // Save to file
  //   fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2), 'utf-8');

  //   res.status(201).json({ message: 'User registered successfully' });
  // } catch (err) {
  //   console.error('Error during signup:', err);
  //   res.status(500).json({ error: 'Internal server error', details: err.message });
  // }

});


// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}).catch(console.error);