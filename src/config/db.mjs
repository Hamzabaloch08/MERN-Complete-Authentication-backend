import { MongoClient, Db } from "mongodb";

const DB_NAME = "TodoApp";
/** @type {Db} */
let db;

export const COLLECTIONS = {
  USERS: "users",
  TODOS: "todos",
};

export const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
};
