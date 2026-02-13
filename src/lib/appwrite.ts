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



const originalPrepareRequest = (client as any).prepareRequest.bind(client);
(client as any).prepareRequest = function patchedPrepareRequest(
  method: string,
  url: URL,
  headers: Record<string, string> = {},
  params: Record<string, unknown> = {}
) {
  try {
    return originalPrepareRequest(method, url, headers, params);
  } catch (error) {
    const isJsonRequest = method.toUpperCase() !== 'GET' && headers['content-type'] === 'application/json';
    const hasBigNumberSerializerError =
      error instanceof TypeError && String(error.message).includes('isBigNumber is not a function');

    if (!isJsonRequest || !hasBigNumberSerializerError) {
      throw error;
    }

    const prepared = originalPrepareRequest(method, url, { ...headers, 'content-type': 'multipart/form-data' }, params);
    prepared.options.body = JSON.stringify(params, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
    (prepared.options.headers as Record<string, string>)['content-type'] = 'application/json';

    return prepared;
  }
};

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { Query };

let anonymousSessionPromise: Promise<void> | null = null;

export const ensureAnonymousSession = async () => {
  if (anonymousSessionPromise) {
    return anonymousSessionPromise;
  }

  anonymousSessionPromise = (async () => {
    try {
      await account.get();
      return;
    } catch {
      // No active session, continue with anonymous session creation.
    }

    try {
      await account.createAnonymousSession();
    } catch (error: any) {
      const message = String(error?.message || "").toLowerCase();
      const type = String(error?.type || "").toLowerCase();
      const alreadyHasSession =
        message.includes("session is active") ||
        message.includes("session already") ||
        type.includes("session_already_exists");

      if (alreadyHasSession) {
        return;
      }

      throw error;
    }
  })();

  try {
    await anonymousSessionPromise;
  } finally {
    anonymousSessionPromise = null;
  }
};

// Database and Collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'jobfinder-db';

// Collection IDs
export const COLLECTIONS = {
  PROFILES: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || 'profiles',
  COMPANIES: import.meta.env.VITE_APPWRITE_COMPANIES_COLLECTION_ID || 'companies',
  JOBS: import.meta.env.VITE_APPWRITE_JOBS_COLLECTION_ID || 'jobs',
  JOB_APPLICATIONS: import.meta.env.VITE_APPWRITE_JOB_APPLICATIONS_COLLECTION_ID || 'job_applications',
  SAVED_JOBS: import.meta.env.VITE_APPWRITE_SAVED_JOBS_COLLECTION_ID || 'saved_jobs',
  NOTIFICATIONS: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications'
};

// Storage Bucket IDs
// Storage Bucket IDs
export const BUCKETS = {
  RESUMES: import.meta.env.VITE_APPWRITE_RESUMES_BUCKET_ID as string,
};

if (!BUCKETS.RESUMES) {
  throw new Error("Missing VITE_APPWRITE_RESUMES_BUCKET_ID");
}


export { ID };


export const createEmailPasswordSessionViaRest = async (email: string, password: string) => {
  const response = await fetch(`${endpoint}/account/sessions/email`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": projectId,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "Failed to create email/password session") as Error & {
      code?: number;
      type?: string;
    };
    error.code = data?.code || response.status;
    error.type = data?.type;
    throw error;
  }

  return data;
};



export default client;
