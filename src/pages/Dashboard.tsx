"use client"

import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ArrowRight, Clock, FileText, Plus, Tag } from "lucide-react"

// Simplified dummy data
const recentLabels = [
  {
    id: 1,
    name: "Product Label A-123",
    lastEdited: "2 hours ago",
  },
  {
    id: 2,
    name: "Shipping Label B-456",
    lastEdited: "Yesterday",
  },
  {
    id: 3,
    name: "Warning Label C-789",
    lastEdited: "3 days ago",
  },
]

const stats = [
  {
    title: "Total Labels",
    value: "24",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    title: "Recent Activity",
    value: "12",
    icon: <FileText className="h-4 w-4" />,
  },
]

export default function Dashboard() {
  const { user } = useAuth()

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return " >>> morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Get first name from email or metadata
  const getFirstName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(" ")[0]
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "there"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, <span className="text-primary">{getFirstName()}</span>
        </h1>
        <p className="text-muted-foreground">Here's an overview of your labels.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}

        <Card className="border border-border/40 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-full">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Label
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Labels - Simplified */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Labels</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <Card className="border border-border/40">
          <CardContent className="p-0">
            <div className="divide-y">
              {recentLabels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/50 rounded-md">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{label.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {label.lastEdited}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Further Simplified */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Card className="border border-border/40">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">Label "Product Label A-123" updated</div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">Created new label "Shipping Label B-456"</div>
                  <div className="text-sm text-muted-foreground">Yesterday</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">Updated "Warning Label C-789"</div>
                  <div className="text-sm text-muted-foreground">3 days ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
