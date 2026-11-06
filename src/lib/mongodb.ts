import { MongoClient } from "mongodb";

// Connect on first use, not at import: `next build` imports every route to
// collect page data, and builds without database credentials (Vercel
// preview deployments) must still succeed.
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  // Kept on `global` so dev hot reloads and warm function instances reuse
  // one connection pool.
  if (!globalWithMongo._mongoClientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return Promise.reject(
        new Error('Invalid/Missing environment variable: "MONGODB_URI"')
      );
    }
    const promise = new MongoClient(uri).connect();
    // Don't cache a failed connect, or the instance stays broken until it
    // is recycled; the next request retries instead.
    promise.catch(() => {
      if (globalWithMongo._mongoClientPromise === promise) {
        globalWithMongo._mongoClientPromise = undefined;
      }
    });
    globalWithMongo._mongoClientPromise = promise;
  }
  return globalWithMongo._mongoClientPromise;
}

// Callers `await clientPromise`; a thenable defers the connect to that await.
const clientPromise = {
  then(onFulfilled, onRejected) {
    return getClient().then(onFulfilled, onRejected);
  },
} as Promise<MongoClient>;

export default clientPromise;
