/**
 * Database Schema Interfaces
 * Centralized TypeScript types for all database entities
 */

// User & Auth
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string; // FK → auth.users.id
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AdminRecord {
  id: string;
  user_id: string; // FK → auth.users.id
  created_at: string;
}

// Folders & Files
export interface Folder {
  id: string;
  name: string;
  parent_id: string | null; // FK → folders.id (null = root)
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  folder_id: string; // FK → folders.id
  name: string;
  storage_path: string;
  url: string;
  created_at: string;
  updated_at: string;
}

// Practice System
export interface PracticeTopic {
  id: string;
  subject: string; // e.g., "java", "dbms", "os", "python"
  name: string; // e.g., "Variables"
  slug: string; // auto-generated, e.g., "variables"
  created_at: string;
  updated_at: string;
}

export interface PracticeQuestion {
  id: string;
  topic_id: string; // FK → practice_topics.id
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation?: string;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateTopicRequest {
  subject: string;
  name: string;
}

export interface UpdateTopicRequest {
  id: string;
  name: string;
}

export interface DeleteTopicRequest {
  id: string;
}

export interface CreateQuestionRequest {
  topic_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation?: string;
}

export interface UpdateQuestionRequest {
  id: string;
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: "A" | "B" | "C" | "D";
  explanation?: string;
}

export interface DeleteQuestionRequest {
  id: string;
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total: number;
  per_page: number;
}
