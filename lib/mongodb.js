import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'banodigitalhub';

if (!uri) {
  console.warn('[mongodb] MONGODB_URI is not set — database features are disabled.');
}

const options = { maxPoolSize: 10 };

let clientPromise;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // Reuse the connection across HMR reloads in dev.
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, options).connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    clientPromise = new MongoClient(uri, options).connect();
  }
}

export function isDbConfigured() {
  return Boolean(uri);
}

export async function getDb() {
  if (!clientPromise) throw new Error('MONGODB_URI is not configured');
  const client = await clientPromise;
  return client.db(dbName);
}

let indexesReady = null;

/** Creates the indexes the app relies on. Runs once per process. */
export async function ensureIndexes() {
  if (!clientPromise) return;
  if (!indexesReady) {
    indexesReady = (async () => {
      const db = await getDb();
      await Promise.all([
        db.collection('students').createIndex({ createdAt: -1 }),
        db.collection('students').createIndex({ cnic: 1 }, { unique: true, sparse: true }),
        db.collection('students').createIndex({ email: 1 }),
        db.collection('projects').createIndex({ order: 1, createdAt: -1 }),
      ]);
    })().catch((err) => {
      indexesReady = null;
      throw err;
    });
  }
  return indexesReady;
}

export async function getStudents() {
  const db = await getDb();
  return db.collection('students');
}

export async function getProjects() {
  const db = await getDb();
  return db.collection('projects');
}
