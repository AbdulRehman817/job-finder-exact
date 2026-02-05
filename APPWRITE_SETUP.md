# Appwrite Migration Guide

This project has been migrated from Supabase to Appwrite. Follow these steps to set up your Appwrite backend.

## 1. Create Appwrite Project

1. Go to [appwrite.io](https://appwrite.io) and create an account
2. Create a new project (e.g., "JobFinder")
3. Note your Project ID from the dashboard

## 2. Update Environment Variables

Update your `.env` file with your Appwrite credentials:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
VITE_APPWRITE_DATABASE_ID=jobfinder-db
```

## 3. Create Database

1. In your Appwrite dashboard, go to **Database**
2. Create a new database with ID: `jobfinder-db`

## 4. Create Collections

Create the following collections in your database:

### Profiles Collection
- **Collection ID**: `profiles`
- **Permissions**: Users can read/write their own documents
- **Attributes**:
  ```
  user_id (string, required)
  email (string, required)
  role (string, required) - enum: ["candidate", "employer"]
  full_name (string)
  avatar_url (string)
  title (string)
  location (string)
  bio (string)
  skills (string[]) - array
  education (string)
  experience_years (integer)
  phone (string)
  linkedin_url (string)
  github_url (string)
  website (string)
  resume_url (string)
  ```

### Companies Collection
- **Collection ID**: `companies`
- **Permissions**: Public read, authenticated users can create/update their own
- **Attributes**:
  ```
  user_id (string, required)
  name (string, required)
  logo_url (string)
  description (string)
  website (string)
  location (string)
  industry (string)
  size (string)
  founded (string)
  email (string)
  phone (string)
  linkedin_url (string)
  twitter_url (string)
  featured (boolean, default: false)
  ```

### Jobs Collection
- **Collection ID**: `jobs`
- **Permissions**: Public read, authenticated employers can create/update their own
- **Attributes**:
  ```
  company_id (string, required)
  user_id (string, required)
  title (string, required)
  description (string, required)
  location (string, required)
  type (string, required) - enum: ["full-time", "part-time", "internship", "remote", "contract"]
  salary_min (integer)
  salary_max (integer)
  currency (string, default: "USD")
  experience_level (string)
  category (string)
  benefits (string[]) - array
  requirements (string[]) - array
  responsibilities (string[]) - array
  featured (boolean, default: false)
  status (string, required) - enum: ["active", "closed", "draft"]
  posted_date (datetime)
  expiry_date (datetime)
  ```

### Job Applications Collection
- **Collection ID**: `job_applications`
- **Permissions**: Users can read/write their own applications, employers can read applications for their jobs
- **Attributes**:
  ```
  job_id (string, required)
  user_id (string, required)
  cover_letter (string)
  resume_url (string)
  status (string, required) - enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"]
  applied_at (datetime)
  ```

### Saved Jobs Collection
- **Collection ID**: `saved_jobs`
- **Permissions**: Users can read/write their own saved jobs
- **Attributes**:
  ```
  job_id (string, required)
  user_id (string, required)
  saved_at (datetime)
  ```

### Notifications Collection
- **Collection ID**: `notifications`
- **Permissions**: Users can read/write their own notifications
- **Attributes**:
  ```
  user_id (string, required)
  type (string)
  title (string, required)
  message (string, required)
  job_id (string)
  application_id (string)
  is_read (boolean, default: false)
  ```

## 5. Create Storage Bucket

1. Go to **Storage** in your Appwrite dashboard
2. Create a new bucket with ID: `resumes`
3. Set permissions to allow authenticated users to upload/download
4. Configure file size limits and allowed file types (PDF, DOC, DOCX)

## 6. Set Up Authentication

1. Go to **Auth** in your Appwrite dashboard
2. Enable the authentication methods you want (Email/Password is required)
3. Configure any additional settings as needed

## 7. Install Dependencies

```bash
npm install appwrite
```

## 8. Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up a new user
3. Try signing in
4. Test job posting and application features

## Key Differences from Supabase

- **Authentication**: Appwrite uses different API methods for auth
- **Database**: Appwrite uses document-based collections instead of relational tables
- **Storage**: Appwrite storage API is different from Supabase storage
- **Queries**: Appwrite uses different query syntax
- **Real-time**: Appwrite has different real-time subscription methods

## Troubleshooting

- **400 Errors**: Check your environment variables and collection permissions
- **Auth Issues**: Ensure your authentication settings are correct in Appwrite dashboard
- **File Upload Issues**: Check storage bucket permissions and file size limits
- **Query Issues**: Appwrite queries use different syntax than Supabase

The migration maintains all the original functionality while using Appwrite's backend services.