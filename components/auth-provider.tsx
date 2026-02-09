"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { getAuthInstance, getGoogleProvider } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<User>
  signInWithEmail: (email: string, password: string) => Promise<User>
  signUpWithEmail: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(getAuthInstance(), getGoogleProvider())
    return result.user
  }

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(getAuthInstance(), email, password)
    return result.user
  }

  const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(getAuthInstance(), email, password)
    return result.user
  }

  const signOutUser = async () => {
    await firebaseSignOut(getAuthInstance())
  }

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null
    return user.getIdToken()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut: signOutUser,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
