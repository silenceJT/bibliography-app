export interface User {
  _id?: string;
  email: string;
  name: string;
  image?: string;
  role: "user" | "admin";
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      browser: boolean;
    };
  };
  statistics: {
    totalBibliographies: number;
    lastLogin: Date;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate
  extends Omit<User, "_id" | "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdate
  extends Partial<Omit<User, "_id" | "createdAt" | "updatedAt">> {
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  preferences: User["preferences"];
  statistics: User["statistics"];
}
