"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Stethoscope, User, Mail, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationDisabled, setRegistrationDisabled] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data?.registration?.enabled === false) {
        setRegistrationDisabled(true);
        toast.error("Registration is currently disabled. Please try again later or contact the administrator.", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to sign up');
      
      toast.success('Account created successfully');
      router.push('/auth/signin');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationDisabled) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Registration Temporarily Disabled</CardTitle>
            <CardDescription>
              New user registration is currently disabled by the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                For security and maintenance purposes, new user registration has been temporarily disabled. 
                This is typically done during system updates or maintenance periods.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please try again later or contact support if you need immediate assistance.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/signin')}
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-100/90 via-slate-100 to-indigo-100/90 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] p-4 relative z-10"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <Link href="/">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/70 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
              <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ByteMeds
              </span>
            </div>
          </Link>
        </motion.div>

        <Card className="border border-blue-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl shadow-blue-500/5 dark:shadow-black/10 bg-blue-50/70 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                  <Input
                    id="email"
                    {...form.register("email")}
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                  <Input
                    id="password"
                    {...form.register("password")}
                    type="password"
                    placeholder="Create a secure password"
                    className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button 
                  className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="text-center text-sm"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                </span>
                <Link
                  href="/auth/signin"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-sm"
                >
                  Sign in
                </Link>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 