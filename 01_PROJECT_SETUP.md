# Migration Plan - Part 1: Project Setup & Foundation

## **OVERVIEW**
This document covers the initial setup and foundation for migrating the legacy Rails bibliography application to a modern Next.js stack.

---

## **PREREQUISITES & ENVIRONMENT SETUP**

### **System Requirements**
- **Node.js**: Version 18.17 or later
- **MongoDB**: Version 5.0 or later (keep existing)
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - MongoDB for VS Code

### **Development Environment**
```bash
# Check Node.js version
node --version  # Should be >= 18.17

# Check npm version
npm --version   # Should be >= 9.0

# Check MongoDB connection
mongosh --version
```

---

## **PROJECT INITIALIZATION**

### **Step 1: Create Next.js Project**
```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest bibliography-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project directory
cd bibliography-app

# Install additional dependencies
npm install @radix-ui/react-icons lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip
npm install mongodb mongoose next-auth
npm install zod react-hook-form @hookform/resolvers
npm install date-fns clsx tailwind-merge
npm install @tanstack/react-table
npm install recharts # For data visualization

# Install dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier prettier-plugin-tailwindcss
npm install -D eslint-config-prettier
```

### **Step 2: Project Structure Setup**
```bash
# Create directory structure
mkdir -p src/{components,lib,types,hooks,utils}
mkdir -p src/components/{ui,forms,tables,search,layout}
mkdir -p src/app/{api,bibliography,dashboard}
mkdir -p src/app/api/{auth,bibliography,search}
mkdir -p public/{images,icons}
```

### **Step 3: Configuration Files**

#### **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
}

module.exports = nextConfig
```

---

## **ENVIRONMENT VARIABLES SETUP**

### **Step 4: Create .env.local**
```bash
# Create environment file
touch .env.local
```

#### **.env.local Content**
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/test

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Development Settings
NODE_ENV=development
```

### **Step 5: Create .env.example**
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your_database

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Production Settings
NODE_ENV=production
```

---

## **MONGODB CONNECTION SETUP**

### **Step 6: MongoDB Connection Library**

#### **src/lib/mongodb.ts**
```typescript
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri, options)
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
```

### **Step 7: Database Models**

#### **src/lib/models/Bibliography.ts**
```typescript
import { ObjectId } from 'mongodb'

export interface Bibliography {
  _id?: ObjectId
  author: string
  year: string
  title: string
  publication: string
  publisher: string
  biblio_name: string
  language_published: string
  language_researched: string
  country_of_research: string
  keywords: string
  isbn: string
  issn: string
  url: string
  date_of_entry: string
  source: string
  language_family: string
  created_at?: Date
  updated_at?: Date
}

export interface BibliographyCreate extends Omit<Bibliography, '_id' | 'created_at' | 'updated_at'> {
  created_at: Date
  updated_at: Date
}

export interface BibliographyUpdate extends Partial<Omit<Bibliography, '_id' | 'created_at' | 'updated_at'>> {
  updated_at: Date
}
```

---

## **BASIC PROJECT STRUCTURE**

### **Step 8: Root Layout**

#### **src/app/layout.tsx**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bibliography Database',
  description: 'Modern bibliography management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
```

### **Step 9: Global CSS**

#### **src/app/globals.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## **VERIFICATION & TESTING**

### **Step 10: Test Setup**
```bash
# Start development server
npm run dev

# In another terminal, test MongoDB connection
mongosh "mongodb://localhost:27017/test"
```

### **Step 11: Basic Home Page**

#### **src/app/page.tsx**
```typescript
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Bibliography Database
      </h1>
      <p className="text-center text-lg text-muted-foreground">
        Modern bibliography management system
      </p>
    </div>
  )
}
```

---

## **NEXT STEPS**

After completing this setup:

1. **Verify MongoDB connection** works correctly
2. **Test the development server** runs without errors
3. **Check TypeScript compilation** is working
4. **Verify Tailwind CSS** is applying styles correctly

**Ready to proceed to Part 2: Authentication & User Management**

---

## **TROUBLESHOOTING**

### **Common Issues**

#### **MongoDB Connection Failed**
- Check if MongoDB service is running
- Verify connection string in .env.local
- Check firewall settings

#### **TypeScript Errors**
- Ensure all dependencies are installed
- Check tsconfig.json paths configuration
- Restart TypeScript server in VS Code

#### **Tailwind CSS Not Working**
- Verify tailwind.config.js content
- Check globals.css imports
- Restart development server
