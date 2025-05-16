"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, User, Mail, Lock, UserCog, Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          is_doctor: formData.get("is_doctor") === "on",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      toast.success(data.message || "Account created successfully!");
      router.push("/auth/signin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-100/90 via-slate-100 to-indigo-100/90 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decorative elements */}
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

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] p-4 relative z-10"
      >
        {/* Logo section */}
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

        {/* Card */}
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
            <form onSubmit={onSubmit} className="space-y-4">
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
                    name="name"
                    placeholder="John Doe"
                    required
                    autoFocus
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    placeholder="Create a secure password"
                    className="pl-10 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center space-x-2 p-3 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm group hover:bg-blue-200/50 dark:hover:bg-blue-900/30 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_doctor" 
                    name="is_doctor"
                    checked={isDoctor}
                    onCheckedChange={(checked) => setIsDoctor(checked as boolean)}
                    className="border-blue-400 dark:border-blue-500 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="is_doctor" className="text-sm font-medium text-blue-700 dark:text-blue-300 cursor-pointer">
                      I am a doctor
                    </Label>
                  </div>
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