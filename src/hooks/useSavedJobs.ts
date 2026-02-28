import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { COLLECTIONS, DATABASE_ID, databases, ID, Query } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";
import { Permission, Role } from "appwrite";

type SavedJobDocument = {
  $id: string;
  $createdAt: string;
  job_id?: string;
  jobid?: string;
  jobId?: string;
  user_id?: string;
  userid?: string;
  userId?: string;
  saved_at?: string;
  savedAt?: string;
};

type SavedJobCreatePayload = {
  job_id?: string;
  jobid?: string;
  jobId?: string;
  user_id?: string;
  userid?: string;
  userId?: string;
  saved_at?: string;
  savedAt?: string;
};

type JobDocument = {
  $id: string;
  $createdAt: string;
  title?: string;
  location?: string;
  type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  posted_date?: string;
  company?: string | null;
  company_name?: string | null;
  company_id?: string;
  companyid?: string;
  companyId?: string;
};

type CompanyDocument = {
  $id: string;
  name?: string;
  logo_url?: string | null;
};

type SavedJobConflictResult = {
  message: "Already saved";
};

type SavedJobMutationResult = SavedJobConflictResult | Record<string, unknown>;
type SavedJobsListResult = {
  documents: SavedJobDocument[];
};

const JOB_FIELD_CANDIDATES = ["job_id", "jobid", "jobId"] as const;
const USER_FIELD_CANDIDATES = ["user_id", "userid", "userId"] as const;
const SAVED_AT_FIELD_CANDIDATES = ["saved_at", "savedAt"] as const;
const ORDER_FIELD_CANDIDATES = ["saved_at", "savedAt", "$createdAt"] as const;
const SAVED_JOBS_BATCH_SIZE = 100;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message ?? "");
  }
  return String(error ?? "");
};

const getErrorCode = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "number") return code;
  }
  return undefined;
};

const isUnknownAttributeError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("unknown attribute");
};

const isSchemaMismatchError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("unknown attribute") || message.includes("missing required attribute");
};

const isUnauthorizedError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  const message = getErrorMessage(error).toLowerCase();
  return (
    code === 401 ||
    message.includes("unauthorized") ||
    message.includes("not authorized") ||
    message.includes("missing scope")
  );
};

const isRecoverableQueryError = (error: unknown): boolean => {
  if (isUnauthorizedError(error)) return false;

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("unknown attribute") ||
    message.includes("invalid query") ||
    message.includes("attribute not found") ||
    message.includes("index") ||
    message.includes("cannot query")
  );
};

const resolveSavedJobUserId = (savedJob: SavedJobDocument) =>
  savedJob.user_id || savedJob.userid || savedJob.userId || "";

const resolveSavedJobJobId = (savedJob: SavedJobDocument) =>
  savedJob.job_id || savedJob.jobid || savedJob.jobId || "";

const resolveSavedJobTimestamp = (savedJob: SavedJobDocument) =>
  savedJob.saved_at || savedJob.savedAt || savedJob.$createdAt;

const sortSavedJobDocuments = (documents: SavedJobDocument[]) =>
  [...documents].sort((a, b) => {
    const aTime = new Date(resolveSavedJobTimestamp(a)).getTime();
    const bTime = new Date(resolveSavedJobTimestamp(b)).getTime();
    return bTime - aTime;
  });

const listAllSavedJobDocuments = async (): Promise<SavedJobDocument[]> => {
  const allDocuments: SavedJobDocument[] = [];
  let offset = 0;

  while (true) {
    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SAVED_JOBS,
      [Query.limit(SAVED_JOBS_BATCH_SIZE), Query.offset(offset)]
    );

    const typedDocuments = documents as unknown as SavedJobDocument[];
    allDocuments.push(...typedDocuments);

    if (typedDocuments.length < SAVED_JOBS_BATCH_SIZE) {
      break;
    }

    offset += SAVED_JOBS_BATCH_SIZE;
  }

  return allDocuments;
};

const trySavedJobsListQuery = async (
  userId: string,
  userField: (typeof USER_FIELD_CANDIDATES)[number],
  orderField: (typeof ORDER_FIELD_CANDIDATES)[number]
) => {
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_JOBS, [
    Query.equal(userField, userId),
    Query.orderDesc(orderField),
  ]);

  return { documents: result.documents as unknown as SavedJobDocument[] };
};

const trySavedJobsListQueryWithoutOrder = async (
  userId: string,
  userField: (typeof USER_FIELD_CANDIDATES)[number]
): Promise<SavedJobsListResult> => {
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_JOBS, [
    Query.equal(userField, userId),
  ]);

  return { documents: result.documents as unknown as SavedJobDocument[] };
};

const listSavedJobsForUser = async (userId: string): Promise<SavedJobsListResult> => {
  let lastError: unknown;

  // Try indexed query with ordering first.
  for (const userField of USER_FIELD_CANDIDATES) {
    for (const orderField of ORDER_FIELD_CANDIDATES) {
      try {
        const result = await trySavedJobsListQuery(userId, userField, orderField);
        return { documents: sortSavedJobDocuments(result.documents) };
      } catch (error) {
        lastError = error;
        if (!isRecoverableQueryError(error)) {
          throw error;
        }
      }
    }
  }

  // Fallback without order in case order field/index is missing.
  for (const userField of USER_FIELD_CANDIDATES) {
    try {
      const result = await trySavedJobsListQueryWithoutOrder(userId, userField);
      return { documents: sortSavedJobDocuments(result.documents) };
    } catch (error) {
      lastError = error;
      if (!isRecoverableQueryError(error)) {
        throw error;
      }
    }
  }

  // Final fallback: list and filter client-side.
  const allDocuments = await listAllSavedJobDocuments();
  const filteredDocuments = allDocuments.filter(
    (savedJob) => resolveSavedJobUserId(savedJob) === userId
  );
  return { documents: sortSavedJobDocuments(filteredDocuments) };
};

const listSavedJobsByUserAndJob = async (
  userId: string,
  jobId: string
): Promise<SavedJobsListResult> => {
  let lastError: unknown;
  for (const userField of USER_FIELD_CANDIDATES) {
    for (const jobField of JOB_FIELD_CANDIDATES) {
      try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_JOBS, [
          Query.equal(userField, userId),
          Query.equal(jobField, jobId),
        ]);

        return { documents: result.documents as unknown as SavedJobDocument[] };
      } catch (error) {
        lastError = error;
        if (!isRecoverableQueryError(error)) {
          throw error;
        }
      }
    }
  }

  // Fallback: load user saved jobs and filter by job id.
  const { documents } = await listSavedJobsForUser(userId);
  const filtered = documents.filter((savedJob) => resolveSavedJobJobId(savedJob) === jobId);
  return { documents: filtered };
};

const buildSavedJobPayloads = (
  jobId: string,
  userId: string,
  savedTimestamp: string
): SavedJobCreatePayload[] => {
  const payloads: SavedJobCreatePayload[] = [];

  for (const jobField of JOB_FIELD_CANDIDATES) {
    for (const userField of USER_FIELD_CANDIDATES) {
      for (const savedField of SAVED_AT_FIELD_CANDIDATES) {
        const payload = {
          [jobField]: jobId,
          [userField]: userId,
          [savedField]: savedTimestamp,
        } as SavedJobCreatePayload;
        payloads.push(payload);
      }

      // Some schemas don't include a saved timestamp field.
      const payloadWithoutTimestamp = {
        [jobField]: jobId,
        [userField]: userId,
      } as SavedJobCreatePayload;
      payloads.push(payloadWithoutTimestamp);
    }
  }

  return payloads;
};

const tryCreateSavedJob = async (
  payload: SavedJobCreatePayload,
  userId: string,
  withPermissions: boolean
) => {
  const permissions = withPermissions
    ? [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    : undefined;

  return databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.SAVED_JOBS,
    ID.unique(),
    payload,
    permissions
  );
};

const mapSavedJobDocument = (savedJob: SavedJobDocument, fallbackUserId: string): SavedJob => ({
  id: savedJob.$id,
  job_id: savedJob.job_id || savedJob.jobid || savedJob.jobId || "",
  user_id: savedJob.user_id || savedJob.userid || savedJob.userId || fallbackUserId,
  saved_at: savedJob.saved_at || savedJob.savedAt || savedJob.$createdAt,
});

const getCompanyFallbackName = (job: JobDocument) => {
  const value = job.company || job.company_name;
  return typeof value === "string" && value.trim() ? value.trim() : "Company";
};

const getCompanyIdFromJob = (job: JobDocument) => {
  return job.company_id || job.companyid || job.companyId || "";
};

const tryGetCompanyById = async (companyId: string) => {
  try {
    const company = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.COMPANIES,
      companyId
    );
    return company as unknown as CompanyDocument;
  } catch {
    return null;
  }
};

export interface SavedJob {
  id: string;
  job_id: string;
  user_id: string;
  saved_at: string;
  jobs?: {
    id: string;
    title: string;
    location: string;
    type: string;
    salary_min: number | null;
    salary_max: number | null;
    posted_date: string;
    companies?: {
      id: string;
      name: string;
      logo_url: string | null;
    };
  };
}

export const useSavedJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { documents } = await listSavedJobsForUser(user.id);

        const savedJobsWithData = await Promise.all(
          documents.map(async (doc) => {
            const rawSavedJob = doc as unknown as SavedJobDocument;
            const normalizedSavedJob = mapSavedJobDocument(rawSavedJob, user.id);

            if (!normalizedSavedJob.job_id) {
              return normalizedSavedJob;
            }

            try {
              const rawJob = (await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.JOBS,
                normalizedSavedJob.job_id
              )) as unknown as JobDocument;

              const companyId = getCompanyIdFromJob(rawJob);
              const fallbackCompanyName = getCompanyFallbackName(rawJob);

              let companyName = fallbackCompanyName;
              let companyLogo: string | null = null;
              let resolvedCompanyId = companyId || "company";

              if (companyId) {
                const company = await tryGetCompanyById(companyId);
                if (company) {
                  companyName = company.name?.trim() || fallbackCompanyName;
                  companyLogo = company.logo_url ?? null;
                  resolvedCompanyId = company.$id;
                }
              }

              return {
                ...normalizedSavedJob,
                jobs: {
                  id: rawJob.$id,
                  title: rawJob.title || "Untitled Job",
                  location: rawJob.location || "Location not specified",
                  type: rawJob.type || "Role",
                  salary_min: rawJob.salary_min ?? null,
                  salary_max: rawJob.salary_max ?? null,
                  posted_date: rawJob.posted_date || rawJob.$createdAt,
                  companies: {
                    id: resolvedCompanyId,
                    name: companyName,
                    logo_url: companyLogo,
                  },
                },
              };
            } catch (error) {
              console.error("Error fetching data for saved job:", rawSavedJob.$id, error);
              return normalizedSavedJob;
            }
          })
        );

        return savedJobsWithData;
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        throw error;
      }
    },
    enabled: !!user,
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (job_id: string): Promise<SavedJobMutationResult> => {
      if (!user) throw new Error("You must be signed in to save jobs.");

      // Avoid duplicate writes where possible.
      try {
        const { documents } = await listSavedJobsByUserAndJob(user.id, job_id);
        if (documents.length > 0) {
          return { message: "Already saved" };
        }
      } catch (error) {
        // If schema differs, creation loop below still handles it.
        if (!isUnknownAttributeError(error)) {
          console.warn("Pre-save lookup failed, continuing with create:", error);
        }
      }

      const savedTimestamp = new Date().toISOString();
      const payloads = buildSavedJobPayloads(job_id, user.id, savedTimestamp);
      let lastSchemaError: unknown = null;
      let lastError: unknown = null;

      // Try creating with explicit document permissions first.
      for (const withPermissions of [true, false]) {
        for (const payload of payloads) {
          try {
            return await tryCreateSavedJob(payload, user.id, withPermissions);
          } catch (error) {
            lastError = error;

            if (getErrorCode(error) === 409) {
              return { message: "Already saved" };
            }

            if (isSchemaMismatchError(error)) {
              lastSchemaError = error;
              continue;
            }

            // Continue trying alternate payloads for permission-style mismatches.
            const message = getErrorMessage(error).toLowerCase();
            const permissionLikeError =
              message.includes("permission") ||
              message.includes("not authorized") ||
              message.includes("unauthorized");

            if (permissionLikeError) {
              continue;
            }

            console.error("Error saving job:", error);
            throw error;
          }
        }
      }

      console.error("Error saving job: all payload variants failed", {
        lastSchemaError,
        lastError,
      });

      throw (
        lastSchemaError ??
        lastError ??
        new Error("Unable to save job due to incompatible saved_jobs schema or permissions.")
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["is-job-saved"] });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!user) throw new Error("You must be signed in.");

      try {
        const { documents } = await listSavedJobsByUserAndJob(user.id, jobId);

        if (documents.length > 0) {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SAVED_JOBS, documents[0].$id);
        }
      } catch (error) {
        console.error("Error unsaving job:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["is-job-saved"] });
    },
  });
};

export const useIsJobSaved = (job_id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-job-saved", job_id, user?.id],
    queryFn: async () => {
      if (!job_id || !user) return false;

      try {
        const { documents } = await listSavedJobsByUserAndJob(user.id, job_id);
        return documents.length > 0;
      } catch (error) {
        console.error("Error checking if job is saved:", error);
        return false;
      }
    },
    enabled: !!job_id && !!user,
  });
};
