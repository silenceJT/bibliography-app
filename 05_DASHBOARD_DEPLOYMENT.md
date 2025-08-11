# Migration Plan - Part 5: Dashboard, Data Visualization & Deployment

## **OVERVIEW**
This document covers implementing the dashboard, data visualization components, and final deployment steps for the bibliography application.

---

## **DASHBOARD IMPLEMENTATION**

### **Step 1: Dashboard Layout Component**

#### **src/components/layout/dashboard-layout.tsx**
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { 
  BookOpen, 
  Search, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  User
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Bibliography', href: '/bibliography', icon: BookOpen },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Bibliography DB</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Bibliography DB</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User menu */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### **Step 2: Dashboard Home Page**

#### **src/app/dashboard/page.tsx**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { PublicationTrends } from '@/components/dashboard/publication-trends'
import { LanguageDistribution } from '@/components/dashboard/language-distribution'
import { RecentBibliographies } from '@/components/dashboard/recent-bibliographies'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    thisYear: 0,
    languages: 0,
    countries: 0
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your bibliography database
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={stats} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PublicationTrends />
          <LanguageDistribution />
        </div>

        {/* Recent Bibliographies */}
        <RecentBibliographies />
      </div>
    </DashboardLayout>
  )
}
```

---

## **DATA VISUALIZATION COMPONENTS**

### **Step 3: Dashboard Statistics Component**

#### **src/components/dashboard/dashboard-stats.tsx**
```typescript
import { BookOpen, Calendar, Globe, MapPin } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalRecords: number
    thisYear: number
    languages: number
    countries: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      name: 'Total Records',
      value: stats.totalRecords.toLocaleString(),
      icon: BookOpen,
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      name: 'This Year',
      value: stats.thisYear.toLocaleString(),
      icon: Calendar,
      change: '+5%',
      changeType: 'increase' as const,
    },
    {
      name: 'Languages',
      value: stats.languages.toString(),
      icon: Globe,
      change: '+2',
      changeType: 'increase' as const,
    },
    {
      name: 'Countries',
      value: stats.countries.toString(),
      icon: MapPin,
      change: '+3',
      changeType: 'increase' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        )
      })}
    </div>
  )
}
```

### **Step 4: Publication Trends Chart**

#### **src/components/dashboard/publication-trends.tsx**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function PublicationTrends() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPublicationTrends()
  }, [])

  const fetchPublicationTrends = async () => {
    try {
      const response = await fetch('/api/dashboard/publication-trends')
      if (response.ok) {
        const trends = await response.json()
        setData(trends)
      }
    } catch (error) {
      console.error('Error fetching publication trends:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Publication Trends</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Publication Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### **Step 5: Language Distribution Chart**

#### **src/components/dashboard/language-distribution.tsx**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function LanguageDistribution() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLanguageDistribution()
  }, [])

  const fetchLanguageDistribution = async () => {
    try {
      const response = await fetch('/api/dashboard/language-distribution')
      if (response.ok) {
        const distribution = await response.json()
        setData(distribution)
      }
    } catch (error) {
      console.error('Error fetching language distribution:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Language Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Language Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

---

## **DASHBOARD API ENDPOINTS**

### **Step 6: Dashboard Stats API**

#### **src/app/api/dashboard/stats/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('test')
    const collection = db.collection('biblio_200419')

    // Get total records
    const totalRecords = await collection.countDocuments({})

    // Get records from this year
    const currentYear = new Date().getFullYear().toString()
    const thisYear = await collection.countDocuments({
      year: { $regex: currentYear }
    })

    // Get unique languages
    const languages = await collection.distinct('language_published')

    // Get unique countries
    const countries = await collection.distinct('country_of_research')

    return NextResponse.json({
      totalRecords,
      thisYear,
      languages: languages.length,
      countries: countries.length
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Step 7: Publication Trends API**

#### **src/app/api/dashboard/publication-trends/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('test')
    const collection = db.collection('biblio_200419')

    // Aggregate publications by year
    const trends = await collection.aggregate([
      {
        $match: {
          year: { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 20
      }
    ]).toArray()

    const formattedTrends = trends.map(trend => ({
      year: trend._id,
      count: trend.count
    }))

    return NextResponse.json(formattedTrends)
  } catch (error) {
    console.error('Error fetching publication trends:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## **DEPLOYMENT PREPARATION**

### **Step 8: Production Environment Setup**

#### **Update .env.production**
```env
# MongoDB Connection (Production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# NextAuth Configuration
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Production Settings
NODE_ENV=production
```

### **Step 9: Next.js Production Configuration**

#### **Update next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-domain.com'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### **Step 10: Build and Deploy Scripts**

#### **package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "build:production": "NODE_ENV=production next build",
    "deploy:vercel": "vercel --prod",
    "deploy:build": "npm run build:production && npm run start"
  }
}
```

---

## **VERCEL DEPLOYMENT**

### **Step 11: Vercel Configuration**

#### **vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### **Step 12: Deployment Commands**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL
```

---

## **PERFORMANCE OPTIMIZATION**

### **Step 13: Database Indexing**

#### **MongoDB Indexes**
```javascript
// Connect to MongoDB and create indexes
mongosh "your-connection-string"

use test

// Create indexes for better performance
db.biblio_200419.createIndex({ "title": "text", "author": "text", "keywords": "text" })
db.biblio_200419.createIndex({ "year": 1 })
db.biblio_200419.createIndex({ "language_published": 1 })
db.biblio_200419.createIndex({ "country_of_research": 1 })
db.biblio_200419.createIndex({ "created_at": -1 })
db.biblio_200419.createIndex({ "publication": 1 })
db.biblio_200419.createIndex({ "publisher": 1 })

// Compound indexes for common queries
db.biblio_200419.createIndex({ "year": 1, "language_published": 1 })
db.biblio_200419.createIndex({ "author": 1, "year": 1 })
db.biblio_200419.createIndex({ "publication": 1, "publisher": 1 })
```

### **Step 14: Performance Monitoring**

#### **Add Performance Monitoring**
```bash
# Install performance monitoring packages
npm install @vercel/analytics
npm install @vercel/speed-insights
```

#### **Update app/layout.tsx**
```typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## **FINAL TESTING & VERIFICATION**

### **Step 15: Pre-Deployment Checklist**
- [ ] All API endpoints working correctly
- [ ] Authentication system functional
- [ ] Search and filtering working
- [ ] CRUD operations tested
- [ ] Responsive design verified
- [ ] Performance optimized
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] Error handling implemented
- [ ] Loading states added

### **Step 16: Post-Deployment Verification**
- [ ] Application accessible at production URL
- [ ] MongoDB connection working
- [ ] Authentication working in production
- [ ] All features functional
- [ ] Performance acceptable
- [ ] Error monitoring working
- [ ] Analytics tracking

---

## **MAINTENANCE & UPDATES**

### **Step 17: Regular Maintenance Tasks**
```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit

# Monitor MongoDB performance
# Check application logs
# Review error rates
# Monitor user feedback
```

---

## **NEXT STEPS**

After completing deployment:

1. **Monitor application performance** in production
2. **Gather user feedback** and iterate
3. **Plan future enhancements** based on usage data
4. **Consider additional features** like bulk import/export

**Migration Complete! 🎉**

---

## **TROUBLESHOOTING**

### **Common Deployment Issues**

#### **Environment Variables Not Set**
- Verify all environment variables are configured in Vercel
- Check variable names match exactly
- Ensure no typos in values

#### **MongoDB Connection Issues**
- Verify MongoDB Atlas network access settings
- Check connection string format
- Ensure database user has proper permissions

#### **Build Failures**
- Check TypeScript compilation errors
- Verify all dependencies are installed
- Check for syntax errors in components

#### **Performance Issues**
- Implement proper database indexing
- Add loading states and skeleton screens
- Consider implementing caching strategies
