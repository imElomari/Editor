"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { LogOut, Loader2, Check } from "lucide-react"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { supabase } from "../lib/supabase"
import { toast } from "sonner"

const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  if (!user) {
    return <div>Loading...</div>
  }

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "U"
  }

  const handleResetPassword = async () => {
    if (!user?.email) return

    setResetLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        toast.error("Error", {
          description: error.message || "Failed to send password reset email. Please try again.",
        })
      } else {
        setResetSent(true)
        toast.success("Password reset email sent", {
          description: "Check your email for the password reset link.",
        })
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("Error", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>

      <Tabs defaultValue="info" className="w-full  mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="info">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View your account details and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center mb-6">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback><div className="text-5xl font-bold">{getInitials(user?.email || "")}</div></AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold">{user?.user_metadata?.name || user?.email}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Account Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {user.updated_at ? new Date(user.updated_at).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Sign In</p>
                  <p className="text-sm text-muted-foreground">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{user.role || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Email Verified</p>
                  <p className="text-sm text-muted-foreground">{user.email_confirmed_at ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => {
                  signOut()
                  navigate("/")
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password Reset</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email with a link to reset your password.
                </p>

                {resetSent && (
                  <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Email sent</AlertTitle>
                    <AlertDescription>Check your email for the password reset link.</AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleResetPassword} disabled={resetLoading} className="w-full">
                  {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Password Reset Email
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Account Security Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>Use a strong, unique password for your account</li>
                  <li>Enable two-factor authentication if available</li>
                  <li>Never share your password or security details with others</li>
                  <li>Check for suspicious activity regularly</li>
                  <li>Update your password periodically</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => {
                  signOut()
                  navigate("/")
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfilePage

