import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/admin/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Login failed')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { success: true }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          })
          return { success: false, error: error.message }
        }
      },

      logout: async () => {
        try {
          const token = get().token
          if (token) {
            await fetch('/api/admin/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            })
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          })
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (user) => set({ user }),

      // Check if user has specific permission
      hasPermission: (permission) => {
        const user = get().user
        return user?.permissions?.includes(permission) || false
      },

      // Check if user has any of the given permissions
      hasAnyPermission: (permissions) => {
        const user = get().user
        return permissions.some(permission => user?.permissions?.includes(permission)) || false
      },

      // Check if user has all of the given permissions
      hasAllPermissions: (permissions) => {
        const user = get().user
        return permissions.every(permission => user?.permissions?.includes(permission)) || false
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)