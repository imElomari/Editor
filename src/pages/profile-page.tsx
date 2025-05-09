"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Icons } from "../lib/constances";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { t } = useTranslation(['common', 'profile']);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Icons.loading className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "U";
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast.error(t('profile:toast.error.title'), {
          description:
            error.message ||
            t('profile:toast.error.description'),
          icon: true,
        });
      } else {
        setResetSent(true);
        toast.success(t('profile:toast.success.title'), {
          description: t('profile:toast.success.description'),
          duration: 5000,
          icon: true,
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(t('profile:toast.error.title'), {
        description: t('profile:toast.error.description'),
        icon: true,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {t('profile:page.title')}

        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
        {t('profile:page.description')}
         </p>
      </div>

      <Tabs defaultValue="info" className="w-full mx-auto">
        <TabsList className="inline-flex h-auto w-full p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="info"
            className={cn(
              "inline-flex items-center justify-center w-full px-3 py-2.5",
              "rounded-lg font-medium text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-background",
              "data-[state=active]:text-foreground",
              "data-[state=active]:shadow-sm",
              "disabled:pointer-events-none",
              "disabled:opacity-50",
              "hover:bg-muted/80"
            )}
          >
            <Icons.user className="h-4 w-4 mr-2" />
            {t('profile:page.tab1.title')}
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className={cn(
              "inline-flex items-center justify-center w-full px-3 py-2.5",
              "rounded-lg font-medium text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-background",
              "data-[state=active]:text-foreground",
              "data-[state=active]:shadow-sm",
              "disabled:pointer-events-none",
              "disabled:opacity-50",
              "hover:bg-muted/80"
            )}
          >
            <Icons.security className="h-4 w-4 mr-2" />
            {t('profile:page.tab2.title')}
          </TabsTrigger>
        </TabsList>
        <div className="mt-8">
          <TabsContent value="info" className="space-y-6 outline-none">
            <Card className="border border-border/40 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-t-lg h-35 z-0"></div>

              <CardHeader className="relative z-10 pb-0">
                <div className="flex flex-col items-center">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-xl mb-4 mt-2">
                    <AvatarImage
                      src={
                        user?.user_metadata?.avatar_url || "/placeholder.svg"
                      }
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                      {getInitials(user?.email || "")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl font-bold">
                    {user?.user_metadata?.name || user?.email}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Icons.mail className="h-4 w-4 mr-1 text-muted-foreground" />
                    {user?.email}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-8 pb-6 relative z-1">
                <div className="grid gap-6 md:grid-cols-2">
                  <InfoCard
                    icon={<Icons.clock className="h-5 w-5 text-primary" />}
                    title={t('profile:page.tab1.created')}
                    value={
                      user.created_at
                        ? new Date(user.created_at).toLocaleString()
                        : "N/A"
                    }
                  />

                  <InfoCard
                    icon={<Icons.clock className="h-5 w-5 text-primary" />}
                    title={t('profile:page.tab1.updated')}
                    value={
                      user.updated_at
                        ? new Date(user.updated_at).toLocaleString()
                        : "N/A"
                    }
                  />

                  <InfoCard
                    icon={<Icons.clock className="h-5 w-5 text-primary" />}
                    title={t('profile:page.tab1.last_signin')}
                    value={
                      user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleString()
                        : "N/A"
                    }
                  />

                  <InfoCard
                    icon={<Icons.security className="h-5 w-5 text-primary" />}
                    title={t('profile:page.tab1.role')}
                    value={user.role || "User"}
                  />

                  <InfoCard
                    icon={
                      <Icons.success
                        className={cn(
                          "h-5 w-5",
                          user.email_confirmed_at
                            ? "text-green-500"
                            : "text-yellow-500"
                        )}
                      />
                    }
                    title={t('profile:page.tab1.verified.title')}
                    value={user.email_confirmed_at ? t('profile:page.tab1.verified.true') : "t('profile:page.tab1.verified.false')"}
                    valueClassName={
                      user.email_confirmed_at
                        ? "text-green-500 font-medium"
                        : "text-yellow-500 font-medium"
                    }
                  />
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/20 py-6">
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center space-x-2 py-6 relative z-1"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  <Icons.logout className="h-4 w-4" />
                  <span>{t('common:buttons.signout')}</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 outline-none">
            <Card className="border border-border/40 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icons.key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{t('profile:page.tab2.security.title')}</CardTitle>
                    <CardDescription>
                    {t('profile:page.tab2.security.description')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/10 mt-1">
                      <Icons.mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-medium">{t('profile:page.tab2.password_reset.title')}</h3>
                      <p className="text-sm text-muted-foreground">
                      {t('profile:page.tab2.password_reset.description')}
                      </p>

                      {resetSent && (
                        <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 mt-4">
                          <Icons.success className="h-4 w-4" />
                          <AlertTitle>{t('profile:page.tab2.password_reset.email_sent')}</AlertTitle>
                          <AlertDescription>
                          {t('profile:page.tab2.password_reset.check')}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                        className="w-full mt-4 transition-all duration-200 hover:shadow-md"
                      >
                        {resetLoading && (
                          <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t('profile:page.tab2.password_reset.send')}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mt-1">
                      <Icons.alert className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                      {t('profile:page.tab2.tips.title')}
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                        <li>{t('profile:page.tab2.tips.1')}</li>
                        <li>{t('profile:page.tab2.tips.2')}</li>
                        <li>{t('profile:page.tab2.tips.3')}</li>
                        <li>{t('profile:page.tab2.tips.4')}</li>
                        <li>{t('profile:page.tab2.tips.5')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/20 py-6">
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center space-x-2 py-6"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  <Icons.logout className="h-4 w-4" />
                  <span>{t('common:buttons.signout')}</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Helper component for profile information cards
const InfoCard = ({
  icon,
  title,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  valueClassName?: string;
}) => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
      <div className="mt-0.5">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className={cn("text-sm font-medium", valueClassName)}>{value}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
