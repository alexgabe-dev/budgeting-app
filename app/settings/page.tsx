"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { 
  Settings, 
  User, 
  DollarSign, 
  Bell, 
  Download, 
  Upload, 
  RotateCcw,
  Palette,
  Globe,
  Shield,
  ArrowLeft,
  Tag,
  Plus,
  Trash2,
  Edit,
  Database,
  Save,
  X
} from "lucide-react"
import { useSettingsStore, CURRENCY_OPTIONS, formatCurrency } from "@/lib/settings-store"
import { useTransactionStore } from "@/lib/store"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { DatabaseManagement } from "@/components/database-management"
import { BudgetRulesSettings } from "@/components/budget-rules-settings"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const {
    settings,
    userProfile,
    notifications,
    updateSettings,
    updateUserProfile,
    updateNotifications,
    resetSettings,
    exportSettings,
    importSettings
  } = useSettingsStore()
  
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory } = useTransactionStore()

  const [importData, setImportData] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingChange, setPendingChange] = useState<{
    type: string
    value: any
    action: () => void
  } | null>(null)
  
  // Category management state
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#FF6B6B")
  const [newCategoryType, setNewCategoryType] = useState<"expense" | "income">("expense")
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [editCategoryColor, setEditCategoryColor] = useState("")
  const [editCategoryType, setEditCategoryType] = useState<"expense" | "income">("expense")

  const handleImport = () => {
    if (importData.trim()) {
      importSettings(importData)
      setImportData("")
    }
  }

  const handleExport = () => {
    const data = exportSettings()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "lumo-settings.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSettingChange = (type: string, value: any, action: () => void) => {
    setPendingChange({ type, value, action })
    setShowConfirmDialog(true)
  }

  const confirmChange = () => {
    if (pendingChange) {
      pendingChange.action()
    }
    setShowConfirmDialog(false)
    setPendingChange(null)
  }

  const cancelChange = () => {
    setShowConfirmDialog(false)
    setPendingChange(null)
  }

  // Category management functions
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: "Tag",
        type: newCategoryType,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await addCategory(newCategory)
      // The addCategory function will automatically update the store
      // No need to manually sync here
      setNewCategoryName("")
      setNewCategoryColor("#FF6B6B")
      setNewCategoryType("expense")
    }
  }

  const handleEditCategory = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      setEditingCategory(categoryId)
      setEditCategoryName(category.name)
      setEditCategoryColor(category.color)
      setEditCategoryType(category.type)
    }
  }

  const handleUpdateCategory = async () => {
    if (editingCategory && editCategoryName.trim()) {
      await updateCategory(editingCategory, {
        name: editCategoryName.trim(),
        color: editCategoryColor,
        type: editCategoryType
      })
      // The updateCategory function will automatically update the store
      // No need to manually sync here
      setEditingCategory(null)
      setEditCategoryName("")
      setEditCategoryColor("")
      setEditCategoryType("expense")
    }
  }

  const handleDeleteCategory = (categoryId: number) => {
    handleSettingChange(
      "Delete Category",
      "permanently",
      async () => {
        await deleteCategory(categoryId)
        // The deleteCategory function will automatically update the store
        // No need to manually sync here
      }
    )
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditCategoryName("")
    setEditCategoryColor("")
  }

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Customize your Lumo experience</p>
            </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 rounded-lg">
              <TabsTrigger 
                value="general" 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all duration-200 rounded-md"
              >
                <Settings className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger 
                value="budgeting" 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all duration-200 rounded-md"
              >
                <DollarSign className="h-4 w-4" />
                <span>Budgeting</span>
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all duration-200 rounded-md"
              >
                <Database className="h-4 w-4" />
                <span>Data</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all duration-200 rounded-md"
              >
                <Bell className="h-4 w-4" />
                <span>Alerts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Appearance</span>
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your app</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={theme || "dark"}
                        onValueChange={(value: "light" | "dark" | "system") => {
                          handleSettingChange(
                            "Theme",
                            value,
                            () => {
                              setTheme(value)
                          updateSettings({ theme: value })
                        }
                          )
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultView">Default View</Label>
                      <Select
                        value={settings.defaultView}
                        onValueChange={(value: "dashboard" | "transactions" | "budgets") => 
                          handleSettingChange(
                            "Default View",
                            value,
                            () => updateSettings({ defaultView: value })
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="transactions">Transactions</SelectItem>
                          <SelectItem value="budgets">Budgets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compactMode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Show more data in a denser layout
                      </p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => 
                        handleSettingChange(
                          "Compact Mode",
                          checked,
                          () => updateSettings({ compactMode: checked })
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showCents">Show Cents</Label>
                      <p className="text-sm text-muted-foreground">
                        Display decimal places in amounts
                      </p>
                    </div>
                    <Switch
                      id="showCents"
                      checked={settings.showCents}
                      onCheckedChange={(checked) => 
                        handleSettingChange(
                          "Show Cents",
                          checked,
                          () => updateSettings({ showCents: checked })
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Currency</span>
                  </CardTitle>
                  <CardDescription>Set your preferred currency and formatting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency.code}
                      onValueChange={(value) => {
                        const currency = CURRENCY_OPTIONS.find(c => c.code === value)
                        if (currency) {
                          handleSettingChange(
                            "Currency",
                            currency.name,
                            () => updateSettings({ currency })
                          )
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center space-x-2">
                              <span>{currency.symbol}</span>
                              <span>{currency.name}</span>
                              <Badge variant="outline">{currency.code}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="space-y-2 text-sm">
                      <p>Sample amounts:</p>
                      <p className="font-mono">{formatCurrency(1234.56, settings.currency, settings.showCents)}</p>
                      <p className="font-mono">{formatCurrency(0.99, settings.currency, settings.showCents)}</p>
                      <p className="font-mono">{formatCurrency(1000000, settings.currency, settings.showCents)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Localization</span>
                  </CardTitle>
                  <CardDescription>Set your preferred date format and fiscal year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={settings.dateFormat}
                        onValueChange={(value: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD") => 
                          handleSettingChange(
                            "Date Format",
                            value,
                            () => updateSettings({ dateFormat: value })
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                      <Select
                        value={settings.fiscalYearStart.toString()}
                        onValueChange={(value) => 
                          handleSettingChange(
                            "Fiscal Year Start",
                            value,
                            () => updateSettings({ fiscalYearStart: parseInt(value) })
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        {/* honapok */}
                        <SelectContent>
                          {[
                            { value: "0", label: "January" },
                            { value: "1", label: "February" },
                            { value: "2", label: "March" },
                            { value: "3", label: "April" },
                            { value: "4", label: "May" },
                            { value: "5", label: "June" },
                            { value: "6", label: "July" },
                            { value: "7", label: "August" },
                            { value: "8", label: "September" },
                            { value: "9", label: "October" },
                            { value: "10", label: "November" },
                            { value: "11", label: "December" }
                          ].map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>Tell us about yourself for a personalized experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={userProfile.name}
                        onChange={(e) => updateUserProfile({ name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userProfile.email || ""}
                        onChange={(e) => updateUserProfile({ email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="currency" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Currency Settings</span>
                  </CardTitle>
                  <CardDescription>Set your preferred currency and formatting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency.code}
                      onValueChange={(value) => {
                        const currency = CURRENCY_OPTIONS.find(c => c.code === value)
                        if (currency) {
                          handleSettingChange(
                            "Currency",
                            currency.name,
                            () => updateSettings({ currency })
                          )
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center space-x-2">
                              <span>{currency.symbol}</span>
                              <span>{currency.name}</span>
                              <Badge variant="outline">{currency.code}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="space-y-2 text-sm">
                      <p>Sample amounts:</p>
                      <p className="font-mono">{formatCurrency(1234.56, settings.currency, settings.showCents)}</p>
                      <p className="font-mono">{formatCurrency(0.99, settings.currency, settings.showCents)}</p>
                      <p className="font-mono">{formatCurrency(1000000, settings.currency, settings.showCents)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Category Management</span>
                  </CardTitle>
                  <CardDescription>Manage your transaction categories and their colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Category */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Add New Category</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="newCategoryName">Category Name</Label>
                      <Input
                          id="newCategoryName"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                      />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newCategoryType">Type</Label>
                        <Select value={newCategoryType} onValueChange={(value: "expense" | "income") => setNewCategoryType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newCategoryColor">Color</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="newCategoryColor"
                            value={newCategoryColor}
                            onChange={(e) => setNewCategoryColor(e.target.value)}
                            className="w-10 h-10 rounded border border-input cursor-pointer"
                          />
                      <Input
                            value={newCategoryColor}
                            onChange={(e) => setNewCategoryColor(e.target.value)}
                            placeholder="#FF6B6B"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Existing Categories */}
                  <div className="space-y-6">
                    {/* Expense Categories */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-500">Expense Categories</span>
                        <Badge variant="secondary" className="ml-2">
                          {categories.filter(c => c.type === "expense").length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.filter(c => c.type === "expense").map((category) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border border-border rounded-lg p-4 space-y-3 ${editingCategory === category.id ? 'ring-2 ring-primary/20' : ''}`}
                        >
                          {editingCategory === category.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                    <div className="space-y-2">
                                <Label>Category Name</Label>
                      <Input
                                  value={editCategoryName}
                                  onChange={(e) => setEditCategoryName(e.target.value)}
                                  placeholder="Enter category name"
                      />
                    </div>
                    <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={editCategoryType} onValueChange={(value: "expense" | "income") => setEditCategoryType(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                  </SelectContent>
                                </Select>
                    </div>
                    <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="color"
                                    value={editCategoryColor}
                                    onChange={(e) => setEditCategoryColor(e.target.value)}
                                    className="w-8 h-8 rounded border border-input cursor-pointer"
                                  />
                      <Input
                                    value={editCategoryColor}
                                    onChange={(e) => setEditCategoryColor(e.target.value)}
                                    placeholder="#FF6B6B"
                                    className="flex-1"
                                  />
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={handleUpdateCategory}
                                  disabled={!editCategoryName.trim()}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="font-medium">{category.name}</span>
                                <Badge variant={category.type === "income" ? "default" : "secondary"} className="ml-auto">
                                  {category.type}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => category.id && handleEditCategory(category.id)}
                                  disabled={!category.id}
                                  className={`group flex items-center justify-center p-2 transition-all duration-300 ease-in-out min-w-[32px] ${editingCategory !== category.id ? 'hover:px-3' : ''}`}
                                >
                                  <div className="flex items-center justify-center">
                                    <Edit className={`h-4 w-4 text-foreground transition-all duration-300 ease-in-out ${editingCategory !== category.id ? 'group-hover:mr-1' : ''}`} />
                                    <span className={`opacity-0 w-0 overflow-hidden transition-all duration-300 ease-in-out font-medium text-foreground ${editingCategory !== category.id ? 'group-hover:opacity-100 group-hover:w-auto' : ''}`}>
                                      Edit
                                    </span>
                                  </div>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => category.id && handleDeleteCategory(category.id)}
                                  disabled={!category.id}
                                  className={`group flex items-center justify-center p-2 transition-all duration-300 ease-in-out min-w-[32px] ${editingCategory !== category.id ? 'hover:px-3' : ''}`}
                                >
                                  <div className="flex items-center justify-center">
                                    <Trash2 className={`h-4 w-4 text-destructive-foreground transition-all duration-300 ease-in-out ${editingCategory !== category.id ? 'group-hover:mr-1' : ''}`} />
                                    <span className={`opacity-0 w-0 overflow-hidden transition-all duration-300 ease-in-out font-medium text-destructive-foreground ${editingCategory !== category.id ? 'group-hover:opacity-100 group-hover:w-auto' : ''}`}>
                                      Delete
                                    </span>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      </div>
                      {categories.filter(c => c.type === "expense").length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No expense categories yet. Add your first expense category above!</p>
                        </div>
                      )}
                    </div>

                    {/* Income Categories */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-500">Income Categories</span>
                        <Badge variant="secondary" className="ml-2">
                          {categories.filter(c => c.type === "income").length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.filter(c => c.type === "income").map((category) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border border-border rounded-lg p-4 space-y-3 ${editingCategory === category.id ? 'ring-2 ring-primary/20' : ''}`}
                        >
                          {editingCategory === category.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                    <div className="space-y-2">
                                <Label>Category Name</Label>
                      <Input
                                  value={editCategoryName}
                                  onChange={(e) => setEditCategoryName(e.target.value)}
                                  placeholder="Enter category name"
                      />
                    </div>
                    <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={editCategoryType} onValueChange={(value: "expense" | "income") => setEditCategoryType(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                  </SelectContent>
                                </Select>
                    </div>
                    <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="color"
                                    value={editCategoryColor}
                                    onChange={(e) => setEditCategoryColor(e.target.value)}
                                    className="w-8 h-8 rounded border border-input cursor-pointer"
                                  />
                      <Input
                                    value={editCategoryColor}
                                    onChange={(e) => setEditCategoryColor(e.target.value)}
                                    placeholder="#FF6B6B"
                                    className="flex-1"
                                  />
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={handleUpdateCategory}
                                  disabled={!editCategoryName.trim()}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="font-medium">{category.name}</span>
                                <Badge variant={category.type === "income" ? "default" : "secondary"} className="ml-auto">
                                  {category.type}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => category.id && handleEditCategory(category.id)}
                                  disabled={!category.id}
                                  className={`group flex items-center justify-center p-2 transition-all duration-300 ease-in-out min-w-[32px] ${editingCategory !== category.id ? 'hover:px-3' : ''}`}
                                >
                                  <div className="flex items-center justify-center">
                                    <Edit className={`h-4 w-4 text-foreground transition-all duration-300 ease-in-out ${editingCategory !== category.id ? 'group-hover:mr-1' : ''}`} />
                                    <span className={`opacity-0 w-0 overflow-hidden transition-all duration-300 ease-in-out font-medium text-foreground ${editingCategory !== category.id ? 'group-hover:opacity-100 group-hover:w-auto' : ''}`}>
                                      Edit
                                    </span>
                                  </div>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => category.id && handleDeleteCategory(category.id)}
                                  disabled={!category.id}
                                  className={`group flex items-center justify-center p-2 transition-all duration-300 ease-in-out min-w-[32px] ${editingCategory !== category.id ? 'hover:px-3' : ''}`}
                                >
                                  <div className="flex items-center justify-center">
                                    <Trash2 className={`h-4 w-4 text-destructive-foreground transition-all duration-300 ease-in-out ${editingCategory !== category.id ? 'group-hover:mr-1' : ''}`} />
                                    <span className={`opacity-0 w-0 overflow-hidden transition-all duration-300 ease-in-out font-medium text-destructive-foreground ${editingCategory !== category.id ? 'group-hover:opacity-100 group-hover:w-auto' : ''}`}>
                                      Delete
                                    </span>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      </div>
                      {categories.filter(c => c.type === "income").length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No income categories yet. Add your first income category above!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budgeting" className="space-y-6">
              {/* Categories Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Category Management</span>
                  </CardTitle>
                  <CardDescription>Organize your transactions with custom categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Category Form */}
                  <div className="border border-border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add New Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newCategoryType} onValueChange={(value: "expense" | "income") => setNewCategoryType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={newCategoryColor}
                            onChange={(e) => setNewCategoryColor(e.target.value)}
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input
                            value={newCategoryColor}
                            onChange={(e) => setNewCategoryColor(e.target.value)}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddCategory} 
                      disabled={!newCategoryName.trim()}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-6">
                    {/* Expense Categories */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-500">Expense Categories</span>
                        <Badge variant="secondary" className="ml-2">
                          {categories.filter(c => c.type === "expense").length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.filter(c => c.type === "expense").map((category) => (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border border-border rounded-lg p-4 space-y-3 ${editingCategory === category.id ? 'ring-2 ring-primary/20' : ''}`}
                          >
                            {editingCategory === category.id ? (
                              // Edit Mode
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Category Name</Label>
                                  <Input
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Type</Label>
                                  <Select value={editCategoryType} onValueChange={(value: "expense" | "income") => setEditCategoryType(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="expense">Expense</SelectItem>
                                      <SelectItem value="income">Income</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Color</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="color"
                                      value={editCategoryColor}
                                      onChange={(e) => setEditCategoryColor(e.target.value)}
                                      className="w-12 h-10 p-1 border rounded"
                                    />
                                    <Input
                                      value={editCategoryColor}
                                      onChange={(e) => setEditCategoryColor(e.target.value)}
                                      placeholder="#000000"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" onClick={() => handleUpdateCategory(category.id!)}>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-4 h-4 rounded-full" 
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="font-medium">{category.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditCategory(category.id!)}
                                      className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteCategory(category.id!)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>{category.type}</span>
                                  <span>{category.color}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      {categories.filter(c => c.type === "expense").length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No expense categories yet. Add your first expense category above!</p>
                        </div>
                      )}
                    </div>

                    {/* Income Categories */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-500">Income Categories</span>
                        <Badge variant="secondary" className="ml-2">
                          {categories.filter(c => c.type === "income").length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.filter(c => c.type === "income").map((category) => (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border border-border rounded-lg p-4 space-y-3 ${editingCategory === category.id ? 'ring-2 ring-primary/20' : ''}`}
                          >
                            {editingCategory === category.id ? (
                              // Edit Mode
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Category Name</Label>
                                  <Input
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Type</Label>
                                  <Select value={editCategoryType} onValueChange={(value: "expense" | "income") => setEditCategoryType(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="expense">Expense</SelectItem>
                                      <SelectItem value="income">Income</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Color</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="color"
                                      value={editCategoryColor}
                                      onChange={(e) => setEditCategoryColor(e.target.value)}
                                      className="w-12 h-10 p-1 border rounded"
                                    />
                                    <Input
                                      value={editCategoryColor}
                                      onChange={(e) => setEditCategoryColor(e.target.value)}
                                      placeholder="#000000"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" onClick={() => handleUpdateCategory(category.id!)}>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-4 h-4 rounded-full" 
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="font-medium">{category.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditCategory(category.id!)}
                                      className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteCategory(category.id!)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>{category.type}</span>
                                  <span>{category.color}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      {categories.filter(c => c.type === "income").length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No income categories yet. Add your first income category above!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Rules Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Budget Rules (50/30/20)</span>
                  </CardTitle>
                  <CardDescription>
                    Customize your budget allocation percentages. The 50/30/20 rule suggests 50% for needs, 30% for wants, and 20% for savings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <BudgetRulesSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <DatabaseManagement />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when approaching budget limits
                        </p>
                      </div>
                      <Switch
                        id="budgetAlerts"
                        checked={notifications.budgetAlerts}
                        onCheckedChange={(checked) => updateNotifications({ budgetAlerts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="spendingAlerts">Spending Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Daily or weekly spending limit notifications
                        </p>
                      </div>
                      <Switch
                        id="spendingAlerts"
                        checked={notifications.spendingAlerts}
                        onCheckedChange={(checked) => updateNotifications({ spendingAlerts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="billReminders">Bill Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Reminders for recurring payments
                        </p>
                      </div>
                      <Switch
                        id="billReminders"
                        checked={notifications.billReminders}
                        onCheckedChange={(checked) => updateNotifications({ billReminders: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="goalMilestones">Goal Milestones</Label>
                        <p className="text-sm text-muted-foreground">
                          Celebrate when you reach financial goals
                        </p>
                      </div>
                      <Switch
                        id="goalMilestones"
                        checked={notifications.goalMilestones}
                        onCheckedChange={(checked) => updateNotifications({ goalMilestones: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => updateNotifications({ emailNotifications: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>Export, import, or reset your settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="export">Export Settings</Label>
                  <Button onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import">Import Settings</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Paste settings JSON here"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                    />
                    <Button onClick={handleImport} disabled={!importData.trim()}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => 
                    handleSettingChange(
                      "All Settings",
                      "default values",
                      () => resetSettings()
                    )
                  }
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingChange?.type === "All Settings" ? "Reset All Settings" : "Confirm Setting Change"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.type === "All Settings" 
                ? "Are you sure you want to reset all settings to their default values? This action cannot be undone and will affect all your preferences."
                : `Are you sure you want to change the ${pendingChange?.type} setting to "${pendingChange?.value}"? This change will be applied immediately.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmChange}
              className={pendingChange?.type === "All Settings" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {pendingChange?.type === "All Settings" ? "Reset All Settings" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
