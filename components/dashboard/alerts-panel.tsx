"use client"

import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AlertItem {
  type: string
  message: string
  severity: "low" | "medium" | "high"
}

interface AlertsPanelProps {
  alerts: AlertItem[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2 mb-6 animate-fade-in">
      {alerts.map((alert, index) => (
        <Alert key={index} variant={alert.severity === "high" ? "destructive" : "default"}>
          <div className="flex items-start gap-3">
            {alert.severity === "high" ? (
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : alert.severity === "medium" ? (
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <AlertTitle>{alert.type}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  )
}
