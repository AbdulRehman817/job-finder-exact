import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error('Missing Appwrite environment variables. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID.');
}

client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { Query };

// Database and Collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'jobfinder-db';

// Collection IDs
export const COLLECTIONS = {
  PROFILES: 'profiles',
  COMPANIES: 'companies',
  JOBS: 'jobs',
  JOB_APPLICATIONS: 'job_applications',
  SAVED_JOBS: 'saved_jobs',
  NOTIFICATIONS: 'notifications'
};

// Storage Bucket IDs
export const BUCKETS = {
  RESUMES: 'resumes'
};

export { ID };
export default client;