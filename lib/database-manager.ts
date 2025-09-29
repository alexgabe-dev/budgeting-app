import { db, type Transaction, type Budget, type Category, type AppSettings, type DataBackup } from "./database"

export class DatabaseManager {
  // Transaction Management
  static async getTransactions() {
    return await db.transactions.orderBy("date").reverse().toArray()
  }

  static async getTransaction(id: number) {
    return await db.transactions.get(id)
  }

  static async addTransaction(transaction: Omit<Transaction, "id">) {
    return await db.transactions.add(transaction)
  }

  static async updateTransaction(id: number, updates: Partial<Transaction>) {
    return await db.transactions.update(id, { ...updates, updatedAt: new Date() })
  }

  static async deleteTransaction(id: number) {
    return await db.transactions.delete(id)
  }

  // Budget Management
  static async getBudgets() {
    return await db.budgets.orderBy("createdAt").reverse().toArray()
  }

  static async getBudget(id: number) {
    return await db.budgets.get(id)
  }

  static async addBudget(budget: Omit<Budget, "id">) {
    return await db.budgets.add(budget)
  }

  static async updateBudget(id: number, updates: Partial<Budget>) {
    return await db.budgets.update(id, { ...updates, updatedAt: new Date() })
  }

  static async deleteBudget(id: number) {
    return await db.budgets.delete(id)
  }

  // Category Management
  static async getCategories() {
    return await db.categories.orderBy("name").toArray()
  }

  static async getCategory(id: number) {
    return await db.categories.get(id)
  }

  static async addCategory(category: Omit<Category, "id">) {
    return await db.categories.add(category)
  }

  static async updateCategory(id: number, updates: Partial<Category>) {
    return await db.categories.update(id, { ...updates, updatedAt: new Date() })
  }

  static async deleteCategory(id: number) {
    return await db.categories.delete(id)
  }

  // Settings Management
  static async getSetting(key: string) {
    const setting = await db.appSettings.get({ key })
    return setting?.value
  }

  static async setSetting(key: string, value: any, type: "string" | "number" | "boolean" | "object" = "string") {
    const existing = await db.appSettings.get({ key })
    if (existing) {
      return await db.appSettings.update(key, { value, type, updatedAt: new Date() })
    } else {
      return await db.appSettings.add({ key, value, type, updatedAt: new Date() })
    }
  }

  static async getAllSettings() {
    const settings = await db.appSettings.toArray()
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)
  }

  // Backup Management
  static async createBackup(name: string, description?: string) {
    return await db.createBackup(name, description)
  }

  static async getBackups() {
    return await db.getBackups()
  }

  static async restoreBackup(backupId: number) {
    return await db.restoreBackup(backupId)
  }

  static async deleteBackup(backupId: number) {
    return await db.deleteBackup(backupId)
  }

  // Data Export/Import
  static async exportData() {
    return await db.exportAllData()
  }

  static async importData(data: any) {
    return await db.importData(data)
  }

  // Database Maintenance
  static async getStats() {
    return await db.getDatabaseStats()
  }

  static async clearAllData() {
    try {
      await db.clearAllData()
      return { success: true, message: "All data cleared successfully" }
    } catch (error) {
      console.error("Failed to clear all data:", error)
      throw new Error(`Failed to clear all data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Utility Methods
  static async searchTransactions(query: string) {
    const transactions = await db.transactions.toArray()
    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(query.toLowerCase()) ||
      transaction.category.toLowerCase().includes(query.toLowerCase())
    )
  }

  static async getTransactionsByDateRange(startDate: Date, endDate: Date) {
    return await db.transactions
      .where("date")
      .between(startDate, endDate)
      .toArray()
  }

  static async getTransactionsByCategory(category: string) {
    return await db.transactions
      .where("category")
      .equals(category)
      .toArray()
  }

  static async getActiveBudgets() {
    return await db.budgets
      .filter(budget => budget.isActive === true)
      .toArray()
  }

  static async getDefaultCategories() {
    return await db.categories
      .filter(category => category.isDefault === true)
      .toArray()
  }

  static async getCustomCategories() {
    return await db.categories
      .filter(category => category.isDefault === false)
      .toArray()
  }

  // Data Validation
  static validateTransaction(transaction: Partial<Transaction>): string[] {
    const errors: string[] = []
    
    if (!transaction.description || transaction.description.trim() === "") {
      errors.push("Description is required")
    }
    
    if (transaction.amount === undefined || transaction.amount === null) {
      errors.push("Amount is required")
    } else if (typeof transaction.amount !== "number") {
      errors.push("Amount must be a number")
    }
    
    if (!transaction.category || transaction.category.trim() === "") {
      errors.push("Category is required")
    }
    
    if (!transaction.date) {
      errors.push("Date is required")
    } else if (!(transaction.date instanceof Date)) {
      errors.push("Date must be a valid date")
    }
    
    if (!transaction.type || !["income", "expense"].includes(transaction.type)) {
      errors.push("Type must be either 'income' or 'expense'")
    }
    
    return errors
  }

  static validateBudget(budget: Partial<Budget>): string[] {
    const errors: string[] = []
    
    if (!budget.category || budget.category.trim() === "") {
      errors.push("Category is required")
    }
    
    if (budget.amount === undefined || budget.amount === null) {
      errors.push("Amount is required")
    } else if (typeof budget.amount !== "number" || budget.amount <= 0) {
      errors.push("Amount must be a positive number")
    }
    
    if (!budget.period || !["monthly", "weekly", "yearly"].includes(budget.period)) {
      errors.push("Period must be 'monthly', 'weekly', or 'yearly'")
    }
    
    return errors
  }

  static validateCategory(category: Partial<Category>): string[] {
    const errors: string[] = []
    
    if (!category.name || category.name.trim() === "") {
      errors.push("Name is required")
    }
    
    if (!category.color || category.color.trim() === "") {
      errors.push("Color is required")
    }
    
    if (!category.icon || category.icon.trim() === "") {
      errors.push("Icon is required")
    }
    
    if (!category.type || !["income", "expense"].includes(category.type)) {
      errors.push("Type must be either 'income' or 'expense'")
    }
    
    return errors
  }

  static async cleanupDuplicateCategories() {
    try {
      const cleanedCount = await db.cleanupDuplicateCategories()
      return { success: true, cleanedCount }
    } catch (error) {
      console.error("Failed to cleanup duplicate categories:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Manual User Management
  static async addUser(email: string, password: string, name: string) {
    try {
      const result = await db.addUser(email, password, name)
      return result
    } catch (error) {
      console.error("Failed to add user:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  static async getAllUsers() {
    try {
      const users = await db.getAllUsers()
      return { success: true, users }
    } catch (error) {
      console.error("Failed to get users:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error", users: [] }
    }
  }
}

export default DatabaseManager
