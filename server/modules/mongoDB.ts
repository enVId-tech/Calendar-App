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

  /**
   * Connects to the MongoDB database with retry logic.
   * @param retries The number of connection attempts before giving up.
   * @throws Error if unable to connect after all retries.
   */
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

  /**
   * Disconnects from the MongoDB database.
   */
  async disconnect(): Promise<void> {
    if (this.db) {
      await this.client.close();
      this.db = null;
      console.log("Disconnected from MongoDB");
    }
  }

  /**
   * Writes a document to a specified collection in the database.
   * @param collectionName The name of the collection to write to.
   * @param data The document to be inserted.
   * @returns A tuple containing the inserted document's ID and a boolean indicating success.
   */
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

  /**
   * Modifies a document in a specified collection in the database.
   * @param filter The filter to identify the document to modify.
   * @param update The update to apply to the document.
   * @param collectionName The name of the collection containing the document.
   * @returns The number of documents modified.
   */
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

  /**
   * Deletes one or many documents from a specified collection in the database.
   * @param filter The filter to identify the document(s) to delete.
   * @param collectionName The name of the collection containing the document(s).
   * @param deleteMany If true, deletes all matching documents; if false, deletes only the first matching document.
   * @returns The number of documents deleted.
   */
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

  /**
   * Retrieves documents from a specified collection in the database.
   * @param collectionName The name of the collection to query.
   * @param filter The filter to apply to the query.
   * @returns An array of documents matching the filter.
   */
  async getItemsFromDatabase<T extends Document>(
    collectionName: string,
    filter: Filter<T> = {}
  ): Promise<WithId<T>[]> {
    const collection = this.getCollection<T>(collectionName);
    if (Object.keys(filter).length === 0) {
      return collection.find().toArray();
    }
    return collection.find(filter).toArray();
  }
}

// Create a singleton instance of the MongoDB client
const mongoDBClient = new MongoDBClient(process.env.MONGODB_URI!);

/**
 * Connects to the MongoDB database.
 * @param log If true, logs the connection status.
 * @returns A boolean indicating whether the connection was successful.
 */
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

/**
 * Disconnects from the MongoDB database.
 * @param log If true, logs the disconnection status.
 * @returns A boolean indicating whether the disconnection was successful.
 */
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

/**
 * Writes a document to a specified collection in the database.
 * @param collectionName The name of the collection to write to.
 * @param data The document to be inserted.
 * @param log If true, logs the operation status.
 * @returns A tuple containing the inserted document's ID and a boolean indicating success.
 * @throws Error if the operation fails.
 */
async function writeToDatabase<T extends Document>(
  collectionName: string,
  data: OptionalUnlessRequiredId<T>,
  log?: boolean
): Promise<[string, boolean]> {
  try {
    const connected: boolean = await connectToDatabase(log);
    if (!connected) {
      throw new Error("Failed to connect to database");
    }
    const result = await mongoDBClient.writeToDatabase(collectionName, data);
    const disconnected: boolean = await disconnectFromDatabase(log);
    if (!disconnected) {
      throw new Error("Failed to disconnect from database");
    }
    return result;
  } catch (error) {
    console.error("Error writing to database:", error);
    throw error;
  }
}

/**
 * Modifies a document in a specified collection in the database.
 * @param filter The filter to identify the document to modify.
 * @param update The update to apply to the document.
 * @param collectionName The name of the collection containing the document.
 * @param log If true, logs the operation status.
 * @returns The number of documents modified.
 * @throws Error if the operation fails.
 */
async function modifyInDatabase<T extends Document>(
  filter: Filter<T>,
  update: Partial<T>,
  collectionName: string,
  log?: boolean
): Promise<number> {
  try {
    const connected: boolean = await connectToDatabase(log);
    if (!connected) {
      throw new Error("Failed to connect to database");
    }
    const result = await mongoDBClient.modifyInDatabase(filter, update, collectionName);
    const disconnected: boolean = await disconnectFromDatabase(log);
    if (!disconnected) {
      throw new Error("Failed to disconnect from database");
    }
    return result;
  } catch (error) {
    console.error("Error modifying document:", error);
    throw error;
  }
}

/**
 * Deletes one or many documents from a specified collection in the database.
 * @param filter The filter to identify the document(s) to delete.
 * @param collectionName The name of the collection containing the document(s).
 * @param type Specifies whether to delete one or many documents (1 or "one" for single, 2 or "many" for multiple).
 * @param log If true, logs the operation status.
 * @returns The number of documents deleted.
 * @throws Error if the operation fails.
 */
async function deleteFromDatabase<T extends Document>(
  filter: Filter<T>,
  collectionName: string,
  type: 1 | 2 | "one" | "many",
  log?: boolean
): Promise<number> {
  try {
    const connected: boolean = await connectToDatabase(log);
    if (!connected) {
      throw new Error("Failed to connect to database");
    }
    const deleteMany = type === 2 || type === "many";
    const result = await mongoDBClient.deleteFromDatabase(filter, collectionName, deleteMany);
    const disconnected: boolean = await disconnectFromDatabase(log);
    if (!disconnected) {
      throw new Error("Failed to disconnect from database");
    }
    return result;
  } catch (error) {
    console.error("Error deleting document(s):", error);
    throw error;
  }
}

/**
 * Retrieves documents from a specified collection in the database.
 * @param collectionName The name of the collection to query.
 * @param log If true, logs the operation status.
 * @param filter The filter to apply to the query.
 * @returns A JSON string representation of the matching documents.
 * @throws Error if the operation fails.
 */
async function getItemsFromDatabase<T extends Document>(
  collectionName: string,
  log?: boolean,
  filter: Filter<T> = {}
): Promise<string> {
  try {
    const connected: boolean = await connectToDatabase(log);
    if (!connected) {
      throw new Error("Failed to connect to database");
    }
    const items = await mongoDBClient.getItemsFromDatabase(collectionName, filter);
    const disconnected: boolean = await disconnectFromDatabase(log);
    if (!disconnected) {
      throw new Error("Failed to disconnect from database");
    }
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