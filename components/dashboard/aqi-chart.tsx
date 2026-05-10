"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ChartDataPoint {
  time: string
  aqi: number
  pm25: number
}

interface AqiChartProps {
  data: ChartDataPoint[]
}

const chartConfig = {
  aqi: {
    label: "AQI",
    color: "oklch(0.65 0.2 200)",
  },
  pm25: {
    label: "PM2.5",
    color: "oklch(0.7 0.18 160)",
  },
}

export function AqiChart({ data }: AqiChartProps) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">AQI Trend (24h)</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">AQI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">PM2.5</span>
          </div>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-64 w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.2 200)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.65 0.2 200)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.18 160)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.7 0.18 160)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260 / 0.3)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "oklch(0.7 0 0)", fontSize: 12 }}
              axisLine={{ stroke: "oklch(0.3 0.02 260 / 0.3)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.7 0 0)", fontSize: 12 }}
              axisLine={{ stroke: "oklch(0.3 0.02 260 / 0.3)" }}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "oklch(0.65 0.2 200 / 0.3)" }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="oklch(0.65 0.2 200)"
              strokeWidth={2}
              fill="url(#aqiGradient)"
            />
            <Area
              type="monotone"
              dataKey="pm25"
              stroke="oklch(0.7 0.18 160)"
              strokeWidth={2}
              fill="url(#pm25Gradient)"
            />
          </AreaChart>
      </ChartContainer>
    </div>
  )
}
