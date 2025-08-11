export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user" | "editor";
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface UserCreate
  extends Omit<User, "_id" | "created_at" | "updated_at"> {
  created_at: Date;
  updated_at: Date;
}

export interface UserUpdate
  extends Partial<Omit<User, "_id" | "created_at" | "updated_at">> {
  updated_at: Date;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}
