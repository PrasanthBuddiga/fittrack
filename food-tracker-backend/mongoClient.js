const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://fittrackuser:mammu2SD778844@fittrack-cluster.g6m3hqu.mongodb.net/?retryWrites=true&w=majority&appName=fittrack-cluster"; // 👈 Replace this
const mongoClient = new MongoClient(uri);

let usersCollection;
let foodLogCollection;


async function connectToMongo() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db('fittrack');
    usersCollection = db.collection('users');
    foodLogCollection=db.collection('foodLog');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

function getUsersCollection() {
  if (!usersCollection) {
    throw new Error('MongoDB not connected yet. Call connectToMongo first.');
  }
  return usersCollection;
}
function getUserFoodLog(){
  if(!foodLogCollection){
 throw new Error('MongoDB not connected yet. Call connectToMongo first.');
  }
  return foodLogCollection;
}

module.exports = {
  connectToMongo,
  getUsersCollection,
  getUserFoodLog
};
