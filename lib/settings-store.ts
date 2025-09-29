import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Currency {
  code: string
  symbol: string
  name: string
  position: "before" | "after"
  decimalPlaces: number
}

export interface UserProfile {
  name: string
  email?: string
  avatar?: string
}

export interface FinancialGoals {
  emergencyFund: number
  savingsGoal: number
  debtPayoff: number
  vacationFund: number
}

export interface NotificationSettings {
  budgetAlerts: boolean
  spendingAlerts: boolean
  billReminders: boolean
  goalMilestones: boolean
  emailNotifications: boolean
}

export interface AppSettings {
  theme: "light" | "dark" | "system"
  currency: Currency
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
  fiscalYearStart: number // Month (0-11)
  defaultView: "dashboard" | "transactions" | "budgets" | "insights"
  compactMode: boolean
  autoSave: boolean
  showCents: boolean
}

export interface SettingsStore {
  // Settings
  settings: AppSettings
  userProfile: UserProfile
  financialGoals: FinancialGoals
  notifications: NotificationSettings
  
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void
  updateUserProfile: (profile: Partial<UserProfile>) => void
  updateFinancialGoals: (goals: Partial<FinancialGoals>) => void
  updateNotifications: (notifications: Partial<NotificationSettings>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (data: string) => void
}

const defaultCurrency: Currency = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  position: "before",
  decimalPlaces: 2
}

const defaultSettings: AppSettings = {
  theme: "dark",
  currency: defaultCurrency,
  dateFormat: "MM/DD/YYYY",
  fiscalYearStart: 0, // January
  defaultView: "dashboard",
  compactMode: false,
  autoSave: true,
  showCents: true
}

const defaultUserProfile: UserProfile = {
  name: "",
  email: "",
  avatar: ""
}

const defaultFinancialGoals: FinancialGoals = {
  emergencyFund: 0,
  savingsGoal: 0,
  debtPayoff: 0,
  vacationFund: 0
}

const defaultNotifications: NotificationSettings = {
  budgetAlerts: true,
  spendingAlerts: true,
  billReminders: true,
  goalMilestones: true,
  emailNotifications: false
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      userProfile: defaultUserProfile,
      financialGoals: defaultFinancialGoals,
      notifications: defaultNotifications,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      updateUserProfile: (newProfile) => {
        set((state) => ({
          userProfile: { ...state.userProfile, ...newProfile }
        }))
      },

      updateFinancialGoals: (newGoals) => {
        set((state) => ({
          financialGoals: { ...state.financialGoals, ...newGoals }
        }))
      },

      updateNotifications: (newNotifications) => {
        set((state) => ({
          notifications: { ...state.notifications, ...newNotifications }
        }))
      },

      resetSettings: () => {
        set({
          settings: defaultSettings,
          userProfile: defaultUserProfile,
          financialGoals: defaultFinancialGoals,
          notifications: defaultNotifications
        })
      },

      exportSettings: () => {
        const state = get()
        return JSON.stringify({
          settings: state.settings,
          userProfile: state.userProfile,
          financialGoals: state.financialGoals,
          notifications: state.notifications
        }, null, 2)
      },

      importSettings: (data) => {
        try {
          const imported = JSON.parse(data)
          set({
            settings: { ...defaultSettings, ...imported.settings },
            userProfile: { ...defaultUserProfile, ...imported.userProfile },
            financialGoals: { ...defaultFinancialGoals, ...imported.financialGoals },
            notifications: { ...defaultNotifications, ...imported.notifications }
          })
        } catch (error) {
          console.error("Failed to import settings:", error)
        }
      }
    }),
    {
      name: "lumo-settings",
      version: 1
    }
  )
)

// Currency options
export const CURRENCY_OPTIONS: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", position: "before", decimalPlaces: 2 },
  { code: "EUR", symbol: "€", name: "Euro", position: "after", decimalPlaces: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", position: "before", decimalPlaces: 2 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", position: "after", decimalPlaces: 0 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", position: "before", decimalPlaces: 0 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", position: "before", decimalPlaces: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", position: "before", decimalPlaces: 2 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", position: "after", decimalPlaces: 2 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", position: "after", decimalPlaces: 2 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", position: "after", decimalPlaces: 2 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", position: "after", decimalPlaces: 2 },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", position: "after", decimalPlaces: 2 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", position: "after", decimalPlaces: 2 },
  { code: "RON", symbol: "lei", name: "Romanian Leu", position: "after", decimalPlaces: 2 },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", position: "after", decimalPlaces: 2 },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", position: "after", decimalPlaces: 2 },
  { code: "RSD", symbol: "дин", name: "Serbian Dinar", position: "after", decimalPlaces: 2 },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", position: "after", decimalPlaces: 2 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", position: "after", decimalPlaces: 2 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", position: "after", decimalPlaces: 2 }
]

// Utility function to format currency
export const formatCurrency = (amount: number, currency: Currency): string => {
  const formattedAmount = currency.decimalPlaces === 0 
    ? Math.round(amount).toString()
    : amount.toFixed(currency.decimalPlaces)
  
  return currency.position === "before" 
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount} ${currency.symbol}`
}
