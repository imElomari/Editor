"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { QuickAssetButton } from "./quick-action-button"

interface StatsCardProps {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  className?: string
  actionLabel?: string
  actionHref?: string
  showQuickUpload?: boolean
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
  actionLabel = "View all",
  actionHref = "#",
  showQuickUpload = false,
}: StatsCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" asChild>
          <a href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
        {showQuickUpload && <QuickAssetButton variant="outline" size="sm" showLabel={false} />}
      </CardFooter>
    </Card>
  )
}
