"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/user-store"
import { motion } from "framer-motion"
import { Shield, Loader2 } from "lucide-react"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading, checkAuth } = useUserStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth()
      setIsChecking(false)
    }

    initializeAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isChecking && !isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, isChecking, router])

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center"
          >
            <Shield className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Authenticating</h3>
            <p className="text-sm text-muted-foreground">Please wait while we verify your credentials</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
