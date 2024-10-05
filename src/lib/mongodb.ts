// src/lib/mongodb.ts

import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

// Declare the global variable using 'let' instead of 'var'
declare global {
  // Use 'let' to allow reassignment if needed
  let _mongoClientPromise: Promise<MongoClient>;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Use a global variable in development to prevent creating multiple connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri as string, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri as string, options);
  clientPromise = client.connect();
}

export default clientPromise;
