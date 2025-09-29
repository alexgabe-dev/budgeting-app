"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "./database"

interface User {
  id?: number
  email: string
  password: string
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface UserStore {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const user = await db.users
            .where("email")
            .equals(email)
            .and(user => user.isActive)
            .first()

          if (!user) {
            return { success: false, message: "User not found" }
          }

          if (user.password !== password) {
            return { success: false, message: "Invalid password" }
          }

          set({ 
            currentUser: user, 
            isAuthenticated: true,
            isLoading: false 
          })

          return { success: true, message: "Login successful" }
        } catch (error) {
          console.error("Login error:", error)
          set({ isLoading: false })
          return { 
            success: false, 
            message: error instanceof Error ? error.message : "Login failed" 
          }
        }
      },

      logout: () => {
        set({ 
          currentUser: null, 
          isAuthenticated: false,
          isLoading: false 
        })
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const { currentUser } = get()
          if (currentUser) {
            // Verify user still exists and is active
            const user = await db.users
              .where("email")
              .equals(currentUser.email)
              .and(user => user.isActive)
              .first()

            if (user) {
              set({ 
                currentUser: user, 
                isAuthenticated: true,
                isLoading: false 
              })
            } else {
              set({ 
                currentUser: null, 
                isAuthenticated: false,
                isLoading: false 
              })
            }
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error("Auth check error:", error)
          set({ 
            currentUser: null, 
            isAuthenticated: false,
            isLoading: false 
          })
        }
      }
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
