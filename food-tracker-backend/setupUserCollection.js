const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://fittrackuser:mammu2SD778844@fittrack-cluster.g6m3hqu.mongodb.net/?retryWrites=true&w=majority&appName=fittrack-cluster"; // 👈 Replace this

async function setupUsersCollection() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("fittrack");

    // Apply schema validation
    await db.command({
      collMod: "users",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "email", "passwordHash"],
          properties: {
            id: {
              bsonType: ["int", "long", "string"],
              description: "Unique user ID"
            },
            email: {
              bsonType: "string",
              pattern: "^.+@.+$",
              description: "Must be a valid email address"
            },
            passwordHash: {
              bsonType: "string",
              description: "Hashed password is required"
            },
            token: {
              bsonType: "string",
              description: "Optional JWT token"
            }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    console.log("✅ Schema validation applied to 'users' collection.");

    // Create unique index on email
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("✅ Unique index created on 'email' field.");

  } catch (error) {
    console.error("❌ Error setting up collection:", error.message);
  } finally {
    await client.close();
  }
}

setupUsersCollection();
