"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  TrendingUp,
  Target,
  Shield,
  Calendar,
  CopySlash as Crystal,
  Lightbulb,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { useTransactionStore } from "@/lib/store"
import { AIInsightsEngine, type SpendingInsight } from "@/lib/ai-insights"
import { motion } from "framer-motion"

const iconMap = {
  AlertTriangle,
  TrendingUp,
  Target,
  Shield,
  Calendar,
  Crystal,
  Lightbulb,
}

export function AIInsights() {
  const { transactions, loadTransactions } = useTransactionStore()
  const [insights, setInsights] = useState<SpendingInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    if (transactions.length > 0) {
      analyzeTransactions()
    }
  }, [transactions])

  const analyzeTransactions = async () => {
    setIsAnalyzing(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const engine = new AIInsightsEngine(transactions)
    const generatedInsights = engine.generateInsights()
    setInsights(generatedInsights)
    setIsAnalyzing(false)
  }

  const getSeverityColor = (severity: SpendingInsight["severity"]) => {
    switch (severity) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-chart-4"
      case "low":
        return "text-chart-1"
      default:
        return "text-muted-foreground"
    }
  }

  const getSeverityBadge = (severity: SpendingInsight["severity"]) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTypeIcon = (type: SpendingInsight["type"]) => {
    switch (type) {
      case "anomaly":
        return AlertTriangle
      case "pattern":
        return TrendingUp
      case "suggestion":
        return Lightbulb
      case "forecast":
        return Crystal
      default:
        return Sparkles
    }
  }

  if (isAnalyzing) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-foreground">AI Insights</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">Analyzing your spending patterns with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <span className="text-muted-foreground">Generating insights...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-foreground">AI Insights</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">Smart financial insights powered by AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Add some transactions to get AI-powered insights</p>
            <p className="text-sm mt-2">I'll analyze your spending patterns and provide personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-foreground">AI Insights</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={analyzeTransactions}>
            <Sparkles className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription className="text-muted-foreground">
          Smart financial insights based on your spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No significant insights found.</p>
            <p className="text-sm mt-2">Keep adding transactions to get better insights!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const TypeIcon = getTypeIcon(insight.type)
              const IconComponent = iconMap[insight.icon as keyof typeof iconMap] || Sparkles

              return (
                <motion.div
                  key={insight.id}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-foreground">{insight.title}</h3>
                        <Badge variant={getSeverityBadge(insight.severity)} className="text-xs">
                          {insight.type}
                        </Badge>
                        {insight.confidence && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {insight.category && (
                            <Badge variant="outline" className="text-xs">
                              {insight.category}
                            </Badge>
                          )}
                          {insight.amount && (
                            <span className="text-xs font-medium text-foreground">${insight.amount.toFixed(2)}</span>
                          )}
                        </div>

                        {insight.actionable && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            Take Action
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
