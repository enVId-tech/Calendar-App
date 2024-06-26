/* eslint-disable no-unused-vars */
import { Collection, Db, DeleteResult, Filter, InsertOneResult, MongoClient, OptionalId, UpdateResult, WithId } from "mongodb";
import { CLIENT_DB } from "./env.ts";

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

const client: MongoClient = new MongoClient(process.env.MONGODB_URI, {});
/**
 * Connects to the MongoDB database
 * 
 * @param {boolean} log (optional) Whether to log the database connection status
 * @returns void
 * @throws Error if an error occurs
 */
async function connectToDatabase(log?: boolean): Promise<boolean> {
  try {
    await client.connect();

    if (log) {
      console.log("Connected to MongoDB");
    }

    return true;
  } catch (error: unknown) {
    console.error(`Error connecting to MongoDB: ${error}`);
    throw new Error(error as string);
  }
}

/**
 * Disconnects from the MongoDB database
 * 
 * @param {boolean} log (optional) Whether to log the database connection status
 * @returns void
 * @throws Error if an error occurs
 */
async function disconnectFromDatabase(log?: boolean): Promise<boolean> {
  try {
    await client.close();

    if (log) {
      console.log("Disconnected from MongoDB");
    }

    return true;
  } catch (error: unknown) {
    console.error(`Error disconnecting from MongoDB: ${error}`);
    throw new Error(error as string);
  }
}

/**
 * Write data to the database collection.
 *
 * @param {string} collectionName Name of the collection to write to
 * @param {object} data Data to be written to the database
 * @param {boolean} log (optional) Whether to log the database connection status
 * @returns The ID of the inserted document
 * @returns Inserted boolean (T/F)
 * @throws CustomError if an error occurs
 */
async function writeToDatabase(
  collectionName: string,
  data: unknown,
  log?: boolean
): Promise<[object, boolean]> {
  try {
    if (!await connectToDatabase(log)) {
      throw new Error("Error connecting to database");
    }

    const database: Db = client.db(CLIENT_DB);
    const collection: Collection<Db> = database.collection(collectionName);

    const result: InsertOneResult<Db> = await collection.insertOne(data as OptionalId<Db>);

    let boolInsert: boolean;

    if (result.insertedId) {
      console.log("Inserted document with _id:", result.insertedId);
      boolInsert = true;
    } else {
      console.log("No document was inserted");
      boolInsert = false;
    }

    if (!await disconnectFromDatabase(log)) {
      throw new Error("Error disconnecting from database");
    }

    return [result.insertedId, boolInsert];
  } catch (error: unknown) {
    console.error(`Error writing to database: ${error}`);
    throw new Error(error as string);
  }
}
/**
 * @param filter The filter to use when modifying
 * @param {any} update The update object containing the fields to modify
 * @param {string} collectionName The name of the collection to modify
 * @param {boolean} log (optional) Set to true to log modification messages
 * @returns The number of documents modified
 * @throws Error if an error occurs
 */
async function modifyInDatabase(
  filter: string | object,
  update: unknown, // Change to a more specific type if possible
  collectionName: string,
  log?: boolean
): Promise<number> {
  try {
    if (!await connectToDatabase(log)) {
      throw new Error("Error connecting to database");
    }

    const database: Db = client.db(CLIENT_DB);
    const collection: Collection<Db> = database.collection(collectionName);

    const updateData: object = { $set: update };

    if (typeof filter === "string") {
      filter = { _id: filter };
    }

    const result: UpdateResult = await collection.updateOne(filter, updateData);

    if (log && result.modifiedCount > 0) {
      console.log("\x1b[32m", "Modified", result.modifiedCount, "document(s)");
    } else if (log && result.modifiedCount === 0) {
      console.log("\x1b[32m", "No documents modified");
    } else {
      console.error("\x1b[31m", "Error modifying document");
    }

    if (!await disconnectFromDatabase(log)) {
      throw new Error("Error disconnecting from database");
    }

    return result.modifiedCount;
  } catch (error: unknown) {
    console.error("\x1b[31m", `Error modifying document:, ${error}`);
    throw new Error(error as string);
  }
}

/**
 * @param filter The filter to use when deleting
 * @param {string} collectionName The name of the collection to delete from
 * @param {number} type The type of delete to perform (1 = one, 2 = many)
 * @param {boolean} log (optional) Set to true to log deletion messages
 * @returns The number of documents deleted, or undefined if no documents were deleted
 * @throws Error if an error occurs
 */
async function deleteFromDatabase(
  filter: Filter<Document> | undefined,
  collectionName: string,
  type: 1 | 2 | "one" | "many",
  log?: boolean
): Promise<number> {
  try {
    if (!await connectToDatabase(log)) {
      throw new Error("Error connecting to database");
    }

    const database: Db = client.db(CLIENT_DB);
    const collection: Collection<Document> = database.collection(collectionName);

    if (type === 1 || type === "one") {
      const result: DeleteResult = await collection.deleteOne(filter);

      if (log && result.deletedCount === 0) {
        console.log("\x1b[32m", "No documents deleted");
      } else if (log && result.deletedCount > 0) {
        console.log("\x1b[32m", "Deleted", result.deletedCount, "document(s)");
      }

      if (!await disconnectFromDatabase(log)) {
        throw new Error("Error disconnecting from database");
      }

      return result.deletedCount;
    } else if (type === 2 || type === "many") {
      const result: DeleteResult = await collection.deleteMany(filter);

      if (log && result.deletedCount === 0) {
        console.log("\x1b[32m", "No documents deleted");
      } else if (log && result.deletedCount > 0) {
        console.log("\x1b[32m", "Deleted", result.deletedCount, "document(s)");
      }

      await disconnectFromDatabase(log);

      return result.deletedCount;
    } else {
      console.error("\x1b[31m", "Invalid delete type");
    }

    if (!await disconnectFromDatabase(log)) {
      throw new Error("Error disconnecting from database");
    }

    // Add a default return value for any other cases
    return 0;
  } catch (error: unknown) {
    console.error("\x1b[31m", `Error deleting document(s):, ${error}`);
    throw new Error(error as string);
  }
}

/**
 * 
 * @param {string} collectionName The name of the collection to get items from
 * @param {boolean} log (optional) Set to true to log deletion messages
 * @param {string} dataId (optional) The ID of the data to get from the database
 * @returns Returns the items from the database as a JSON string
 * @throws Error if an error occurs
 */
async function getItemsFromDatabase(
  collectionName: string,
  log?: boolean,
  dataId?: string
): Promise<string> {
  try {
    if (!await connectToDatabase(log)) {
      throw new Error("Error connecting to database");
    }

    const database: Db = client.db(CLIENT_DB);
    const collection: Collection<Db> = database.collection(collectionName);
    const projection: object = { _id: 0 };

    let items: WithId<Db> | WithId<Db>[] | null | undefined = undefined;

    if (dataId) {
      items = await collection.findOne({ dataId }, { projection: projection });
    } else {
      items = await collection.find({}).toArray();
    }

    if (!await disconnectFromDatabase(log)) {
      throw new Error("Error disconnecting from database");
    }
    
    return JSON.stringify(items);
  } catch (error: unknown) {
    console.error("\x1b[31m", `Error getting items from database:, ${error}`);
    throw new Error(error as string);
  }
}

const mongoDBFuncs = {
  writeToDatabase,
  modifyInDatabase,
  getItemsFromDatabase,
  deleteFromDatabase,
};

export default mongoDBFuncs;
export { writeToDatabase, modifyInDatabase, getItemsFromDatabase, deleteFromDatabase }