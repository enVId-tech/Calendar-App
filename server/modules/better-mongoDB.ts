import { Collection, Db, Filter, MongoClient, WithId, Document, OptionalUnlessRequiredId } from "mongodb";
import { CLIENT_DB } from "./env.ts";

class MongoDBClient {
  private client: MongoClient;
  private db: Db | null = null;

  constructor(uri: string) {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }
    this.client = new MongoClient(uri);
  }

  async connect(retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.client.connect();
        this.db = this.client.db(CLIENT_DB);
        console.log("Connected to MongoDB");
        return;
      } catch (error) {
        console.error(`Error connecting to MongoDB (attempt ${i + 1}/${retries}):`, error);
        if (i === retries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)); // Exponential backoff
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      await this.client.close();
      this.db = null;
      console.log("Disconnected from MongoDB");
    }
  }

  getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Not connected to database');
    }
    return this.db.collection<T>(name);
  }

  async writeToDatabase<T extends Document>(
    collectionName: string,
    data: OptionalUnlessRequiredId<T>
  ): Promise<[string, boolean]> {
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.insertOne(data);
    const inserted = !!result.insertedId;
    console.log(inserted ? `Inserted document with _id: ${result.insertedId}` : "No document was inserted");
    return [result.insertedId.toString(), inserted];
  }

  async modifyInDatabase<T extends Document>(
    filter: Filter<T>,
    update: Partial<T>,
    collectionName: string
  ): Promise<number> {
    const collection = this.getCollection<T>(collectionName);
    const result = await collection.updateOne(filter, { $set: update });
    console.log(`Modified ${result.modifiedCount} document(s)`);
    return result.modifiedCount;
  }

  async deleteFromDatabase<T extends Document>(
    filter: Filter<T>,
    collectionName: string,
    deleteMany: boolean = false
  ): Promise<number> {
    const collection = this.getCollection<T>(collectionName);
    const result = deleteMany
      ? await collection.deleteMany(filter)
      : await collection.deleteOne(filter);
    console.log(`Deleted ${result.deletedCount} document(s)`);
    return result.deletedCount;
  }

  async getItemsFromDatabase<T extends Document>(
    collectionName: string,
    filter: Filter<T> = {}
  ): Promise<WithId<T>[]> {
    const collection = this.getCollection<T>(collectionName);
    return collection.find(filter).toArray();
  }
}

// Create a singleton instance of the MongoDB client
const mongoDBClient = new MongoDBClient(process.env.MONGODB_URI!);

// Wrapper functions to maintain similar interface as before
async function connectToDatabase(log?: boolean): Promise<boolean> {
  try {
    await mongoDBClient.connect();
    if (log) {
      console.log("Connected to MongoDB");
    }
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return false;
  }
}

async function disconnectFromDatabase(log?: boolean): Promise<boolean> {
  try {
    await mongoDBClient.disconnect();
    if (log) {
      console.log("Disconnected from MongoDB");
    }
    return true;
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    return false;
  }
}

async function writeToDatabase<T extends Document>(
  collectionName: string,
  data: OptionalUnlessRequiredId<T>,
  log?: boolean
): Promise<[string, boolean]> {
  try {
    await connectToDatabase(log);
    const result = await mongoDBClient.writeToDatabase(collectionName, data);
    await disconnectFromDatabase(log);
    return result;
  } catch (error) {
    console.error("Error writing to database:", error);
    throw error;
  }
}

async function modifyInDatabase<T extends Document>(
  filter: Filter<T>,
  update: Partial<T>,
  collectionName: string,
  log?: boolean
): Promise<number> {
  try {
    await connectToDatabase(log);
    const result = await mongoDBClient.modifyInDatabase(filter, update, collectionName);
    await disconnectFromDatabase(log);
    return result;
  } catch (error) {
    console.error("Error modifying document:", error);
    throw error;
  }
}

async function deleteFromDatabase<T extends Document>(
  filter: Filter<T>,
  collectionName: string,
  type: 1 | 2 | "one" | "many",
  log?: boolean
): Promise<number> {
  try {
    await connectToDatabase(log);
    const deleteMany = type === 2 || type === "many";
    const result = await mongoDBClient.deleteFromDatabase(filter, collectionName, deleteMany);
    await disconnectFromDatabase(log);
    return result;
  } catch (error) {
    console.error("Error deleting document(s):", error);
    throw error;
  }
}

async function getItemsFromDatabase<T extends Document>(
  collectionName: string,
  log?: boolean,
  filter: Filter<T> = {}
): Promise<string> {
  try {
    await connectToDatabase(log);
    const items = await mongoDBClient.getItemsFromDatabase(collectionName, filter);
    await disconnectFromDatabase(log);
    return JSON.stringify(items);
  } catch (error) {
    console.error("Error getting items from database:", error);
    throw error;
  }
}

const mongoDBFuncs = {
  writeToDatabase,
  modifyInDatabase,
  getItemsFromDatabase,
  deleteFromDatabase,
};

export default mongoDBFuncs;
export { writeToDatabase, modifyInDatabase, getItemsFromDatabase, deleteFromDatabase };