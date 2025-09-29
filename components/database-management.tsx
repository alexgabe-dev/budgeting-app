"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings
} from "lucide-react"
import { motion } from "framer-motion"
import DatabaseManager from "@/lib/database-manager"

interface Backup {
  id?: number
  name: string
  description?: string
  createdAt: Date
}

export function DatabaseManagement() {
  const [stats, setStats] = useState<any>(null)
  const [backups, setBackups] = useState<Backup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateBackup, setShowCreateBackup] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [backupForm, setBackupForm] = useState({
    name: "",
    description: ""
  })
  const [resetConfirmation, setResetConfirmation] = useState("")
  const [alert, setAlert] = useState<{ type: "success" | "error" | "warning", message: string } | null>(null)

  useEffect(() => {
    loadStats()
    loadBackups()
  }, [])

  const loadStats = async () => {
    try {
      console.log("Loading database stats...")
      const databaseStats = await DatabaseManager.getStats()
      console.log("Database stats loaded:", databaseStats)
      setStats(databaseStats)
    } catch (error) {
      console.error("Failed to load database stats:", error)
    }
  }

  const loadBackups = async () => {
    try {
      const backupList = await DatabaseManager.getBackups()
      setBackups(backupList)
    } catch (error) {
      console.error("Failed to load backups:", error)
    }
  }

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleCreateBackup = async () => {
    if (!backupForm.name.trim()) {
      showAlert("error", "Backup name is required")
      return
    }

    setIsLoading(true)
    try {
      await DatabaseManager.createBackup(backupForm.name, backupForm.description)
      setBackupForm({ name: "", description: "" })
      setShowCreateBackup(false)
      await loadBackups()
      showAlert("success", "Backup created successfully")
    } catch (error) {
      showAlert("error", "Failed to create backup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup?.id) return

    setIsLoading(true)
    try {
      await DatabaseManager.restoreBackup(selectedBackup.id)
      setShowRestoreDialog(false)
      setSelectedBackup(null)
      await loadStats()
      showAlert("success", "Backup restored successfully")
    } catch (error) {
      showAlert("error", "Failed to restore backup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBackup = async (backupId: number) => {
    if (!window.confirm("Are you sure you want to delete this backup?")) return

    setIsLoading(true)
    try {
      await DatabaseManager.deleteBackup(backupId)
      await loadBackups()
      showAlert("success", "Backup deleted successfully")
    } catch (error) {
      showAlert("error", "Failed to delete backup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const data = await DatabaseManager.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lumo-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showAlert("success", "Data exported successfully")
    } catch (error) {
      showAlert("error", "Failed to export data")
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await DatabaseManager.importData(data)
      await loadStats()
      showAlert("success", "Data imported successfully")
    } catch (error) {
      showAlert("error", "Failed to import data")
    }
  }

  const handleCleanupDuplicates = async () => {
    setIsLoading(true)
    try {
      const result = await DatabaseManager.cleanupDuplicateCategories()
      await loadStats()
      if (result.success) {
        showAlert("success", `Cleaned up ${result.cleanedCount} duplicate categories`)
      } else {
        showAlert("error", result.error || "Failed to cleanup duplicates")
      }
    } catch (error) {
      console.error("Cleanup duplicates error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to cleanup duplicates"
      showAlert("error", `Failed to cleanup duplicates: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAllData = () => {
    setShowResetDialog(true)
  }

  const handleConfirmReset = async () => {
    if (resetConfirmation.toLowerCase() !== "accept") {
      showAlert("error", "Please type 'accept' to confirm the database reset")
      return
    }

    setIsLoading(true)
    try {
      const result = await DatabaseManager.clearAllData()
      
      // Show success message immediately
      showAlert("success", result.message || "All data cleared successfully")
      setShowResetDialog(false)
      setResetConfirmation("")
      
      // Wait for the database operations to complete
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Force reload stats and backups to show updated counts
      await loadStats()
      await loadBackups()
      
      // Show the updated stats for a moment before reloading
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reload the page to refresh all store states
      window.location.reload()
    } catch (error) {
      console.error("Clear data error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to clear data"
      showAlert("error", `Failed to clear data: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert className={alert.type === "error" ? "border-destructive" : alert.type === "warning" ? "border-yellow-500" : "border-green-500"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}


      {/* Database Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Statistics</span>
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            {isLoading ? "Updating statistics..." : "Overview of your data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${isLoading ? 'opacity-50' : ''}`}>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.transactions}</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.budgets}</div>
                <div className="text-sm text-muted-foreground">Budgets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.categories}</div>
                <div className="text-sm text-muted-foreground">Custom Categories</div>
                {stats.defaultCategories > 0 && (
                  <div className="text-xs text-muted-foreground">+{stats.defaultCategories} default</div>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.appSettings}</div>
                <div className="text-sm text-muted-foreground">Settings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.users}</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.budgetRules}</div>
                <div className="text-sm text-muted-foreground">Budget Rules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.backups}</div>
                <div className="text-sm text-muted-foreground">Backups</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export & Import</span>
          </CardTitle>
          <CardDescription>Backup and restore your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleExportData} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
            <div className="flex-1">
              <Label htmlFor="import-file" className="sr-only">Import Data</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("import-file")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Backup Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Backup Management</span>
              </CardTitle>
              <CardDescription>Create and manage data backups</CardDescription>
            </div>
            <Button onClick={() => setShowCreateBackup(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HardDrive className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No backups yet</p>
              <p className="text-sm">Create your first backup to protect your data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <motion.div
                  key={backup.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{backup.name}</p>
                      {backup.description && (
                        <p className="text-sm text-muted-foreground">{backup.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(backup.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBackup(backup)
                        setShowRestoreDialog(true)
                      }}
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => backup.id && handleDeleteBackup(backup.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Database Maintenance</span>
          </CardTitle>
          <CardDescription>Clean up and optimize your database</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleCleanupDuplicates}
            disabled={isLoading}
            className="w-full"
          >
            <Database className="h-4 w-4 mr-2" />
            Clean Up Duplicate Categories
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleClearAllData}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateBackup} onOpenChange={setShowCreateBackup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogDescription>
              Create a new backup of your data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="backup-name">Backup Name</Label>
              <Input
                id="backup-name"
                value={backupForm.name}
                onChange={(e) => setBackupForm({ ...backupForm, name: e.target.value })}
                placeholder="Enter backup name"
              />
            </div>
            <div>
              <Label htmlFor="backup-description">Description (Optional)</Label>
              <Textarea
                id="backup-description"
                value={backupForm.description}
                onChange={(e) => setBackupForm({ ...backupForm, description: e.target.value })}
                placeholder="Enter backup description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBackup(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore the backup "{selectedBackup?.name}"? 
              This will replace all current data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRestoreBackup} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Restore Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Reset Database</span>
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3">
                <p className="font-medium text-destructive">
                  ⚠️ This action will permanently delete ALL data in your database!
                </p>
                <p>This includes:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>All transactions</li>
                  <li>All categories</li>
                  <li>All budgets</li>
                  <li>All budget rules</li>
                  <li>All user data</li>
                </ul>
                <p className="font-medium">This action cannot be undone!</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetConfirmation" className="text-sm font-medium">
                Type <span className="font-mono bg-muted px-1 rounded">accept</span> to confirm:
              </Label>
              <Input
                id="resetConfirmation"
                value={resetConfirmation}
                onChange={(e) => setResetConfirmation(e.target.value)}
                placeholder="Type 'accept' to confirm"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowResetDialog(false)
              setResetConfirmation("")
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmReset} 
              disabled={isLoading || resetConfirmation.toLowerCase() !== "accept"}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {isLoading ? "Resetting..." : "Reset Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
