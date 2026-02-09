import { storage, BUCKETS } from "@/lib/appwrite";

const isExternalUrl = (value: string) => value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:");

export const getAvatarUrl = (avatarUrl?: string | null) => {
  if (!avatarUrl) return null;
  if (isExternalUrl(avatarUrl)) return avatarUrl;
  return storage.getFileView(BUCKETS.RESUMES, avatarUrl);
};