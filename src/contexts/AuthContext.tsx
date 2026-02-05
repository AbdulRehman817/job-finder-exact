import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Models, Account as AppwriteAccount, Query } from "appwrite";
import { account, databases, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";

type UserRole = "candidate" | "employer" | null;

export interface Profile {
  id: string;
  email: string;
  role: "candidate" | "employer";
  full_name: string;
  avatar_url: string | null;
  title: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  education: string | null;
  experience_years: number | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website: string | null;
  resume_url: string | null;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  userRole: UserRole;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: "candidate" | "employer") => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const mapProfile = (document: any): Profile => ({
    id: document.$id,
    email: document.email || "",
    role: (document.role || "candidate") as "candidate" | "employer",
    full_name: document.full_name || "",
    avatar_url: document.avatar_url || null,
    title: document.title || null,
    location: document.location || null,
    bio: document.bio || null,
    skills: Array.isArray(document.skills) && document.skills.length > 0 ? document.skills : null,
    education: document.education || null,
    experience_years: document.experience_years ?? null,
    phone: document.phone || null,
    linkedin_url: document.linkedin_url || null,
    github_url: document.github_url || null,
    website: document.website || null,
    resume_url: document.resume_url || null,
  });

  const ensureProfile = async (appwriteUser: Models.User<Models.Preferences>, overrides?: Partial<Profile>) => {
    console.log('🔄 AuthContext: ensureProfile called for user:', appwriteUser.$id, 'with overrides:', overrides);
    const payload = {
      user_id: appwriteUser.$id,
      email: appwriteUser.email,
      role: (overrides?.role || "candidate") as "candidate" | "employer",
      full_name: overrides?.full_name || "",
      avatar_url: overrides?.avatar_url || null,
      title: overrides?.title || null,
      location: overrides?.location || null,
      bio: overrides?.bio || null,
      skills: overrides?.skills || null,
      education: overrides?.education || null,
      experience_years: overrides?.experience_years ?? null,
      phone: overrides?.phone || null,
      linkedin_url: overrides?.linkedin_url || null,
      github_url: overrides?.github_url || null,
      website: overrides?.website || null,
      resume_url: overrides?.resume_url || null,
    };
    console.log('📤 AuthContext: Profile payload to save:', payload);

    try {
      console.log('📡 AuthContext: Checking existing profile in Appwrite');
      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal('user_id', appwriteUser.$id)]
      );
      console.log('📥 AuthContext: Found existing documents:', documents.length);

      if (documents.length > 0) {
        // Update existing profile
        const { $id } = documents[0];
        console.log('🔄 AuthContext: Updating existing profile:', $id);
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, $id, payload);
        const result = { ...documents[0], ...payload };
        console.log('✅ AuthContext: Profile updated successfully');
        return result;
      } else {
        // Create new profile
        console.log('🆕 AuthContext: Creating new profile document');
        const document = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          ID.unique(),
          payload
        );
        console.log('✅ AuthContext: New profile created:', document.$id);
        return document;
      }
    } catch (error) {
      console.error('❌ AuthContext: Error in ensureProfile:', error);
      throw error;
    }
  };

  const loadProfile = async (appwriteUser: Models.User<Models.Preferences>) => {
    console.log('🔄 AuthContext: loadProfile called with user:', { id: appwriteUser.$id, email: appwriteUser.email });
    try {
      console.log('📡 AuthContext: Fetching profile from Appwrite databases.listDocuments');
      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal('user_id', appwriteUser.$id)]
      );
      console.log('📥 AuthContext: Received documents from Appwrite:', documents);

      const profileDoc = documents.length > 0 ? documents[0] : await ensureProfile(appwriteUser);
      console.log('📋 AuthContext: Using profile document:', profileDoc);
      const mapped = mapProfile(profileDoc);
      console.log('🔄 AuthContext: Mapped profile data:', mapped);

      setUser({ id: appwriteUser.$id, email: appwriteUser.email });
      setUserRole(mapped.role);
      setProfile(mapped);
      console.log('✅ AuthContext: Profile loaded successfully');
    } catch (error) {
      console.error('❌ AuthContext: Error loading profile:', error);
      clearState();
    }
  };

  const clearState = () => {
    setUser(null);
    setUserRole(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const currentUser = await account.get();
      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        clearState();
      }
    } catch (error) {
      clearState();
    }
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const currentUser = await account.get();
        if (!active) return;
        if (currentUser) {
          await loadProfile(currentUser);
        } else {
          clearState();
        }
      } catch (error) {
        clearState();
      }
      setLoading(false);
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: "candidate" | "employer") => {
    console.log('🔄 AuthContext: signUp called with:', { email, fullName, role });
    try {
      // Sign out any existing session first
      try {
        await account.deleteSession('current');
        console.log('✅ AuthContext: Cleared existing session');
      } catch (error) {
        console.log('ℹ️ AuthContext: No existing session to clear');
      }

      // Create account (this automatically creates a session)
      console.log('📡 AuthContext: Creating Appwrite account');
      const userAccount = await account.create(ID.unique(), email, password, fullName);
      console.log('✅ AuthContext: Account created:', userAccount.$id);

      // Create profile
      console.log('📡 AuthContext: Creating profile');
      await ensureProfile(userAccount, { full_name: fullName, role });

      // Load profile
      console.log('📡 AuthContext: Loading profile after signup');
      await loadProfile(userAccount);

      console.log('✅ AuthContext: SignUp completed successfully');
      return { error: null };
    } catch (error: any) {
      console.error('❌ AuthContext: SignUp failed:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔄 AuthContext: signIn called with email:', email);
    try {
      // Sign out any existing session first
      try {
        await account.deleteSession('current');
        console.log('✅ AuthContext: Cleared existing session');
      } catch (error) {
        console.log('ℹ️ AuthContext: No existing session to clear');
      }

      console.log('📡 AuthContext: Creating email/password session');
      await account.createEmailPasswordSession(email, password);
      console.log('✅ AuthContext: Session created');

      const currentUser = await account.get();
      console.log('📥 AuthContext: Current user from Appwrite:', currentUser.$id);

      console.log('📡 AuthContext: Loading profile after signin');
      await loadProfile(currentUser);

      console.log('✅ AuthContext: SignIn completed successfully');
      return { error: null };
    } catch (error: any) {
      console.error('❌ AuthContext: SignIn failed:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    clearState();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
