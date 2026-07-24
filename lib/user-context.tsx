'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/api'
import { useRouter } from 'next/navigation'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  loginUser: (token: string, userData: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const userData = await getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error: any) {
      console.error('Failed to fetch user:', error)
      setUser(null)
      // Only remove token if it's an auth error, not a network error
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('accessToken')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const loginUser = (token: string, userData: User) => {
    localStorage.setItem('accessToken', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
    router.push('/connexion')
  }

  return (
    <UserContext.Provider value={{ user, loading, loginUser, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
