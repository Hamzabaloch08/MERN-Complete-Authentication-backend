import { MongoClient, Db } from "mongodb";

const DB_NAME = "TodoApp";
/** @type {MongoClient} */
let cachedClient = null;
/** @type {Db} */
let db = null;

export const COLLECTIONS = {
  USERS: "users",
  TODOS: "todos",
};

export const connectDB = async () => {
  if (db) return db;

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(process.env.MONGO_URI);
      await cachedClient.connect();
    }
    db = cachedClient.db(DB_NAME);
    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export const getDB = () => {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
};
