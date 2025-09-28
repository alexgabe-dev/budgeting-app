import { DashboardHeader } from "@/components/dashboard-header"
import { AIInsights } from "@/components/ai-insights"
import { FinancialHealthScore } from "@/components/financial-health-score"

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIInsights />
          </div>
          <FinancialHealthScore />
        </div>
      </main>
    </div>
  )
}
