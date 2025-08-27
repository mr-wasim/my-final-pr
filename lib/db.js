
import { MongoClient } from "mongodb";

let client;
let clientPromise;

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Please set MONGO_URI in your environment");
}

const options = {};

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
