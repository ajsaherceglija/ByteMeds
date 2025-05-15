'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  UserCog,
  LogIn,
  UserPlus,
  ChevronDown,
  Stethoscope,
  UserCircle,
  ShieldCheck
} from "lucide-react";

// Interface for feature items
interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

export default function Home() {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Function to handle smooth scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to handle authentication navigation
  const handleAuthNavigation = (path: string) => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed w-full top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">ByteMeds</span>
          </div>
          <nav className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleAuthNavigation('/auth/signin')}
              className="hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
              aria-label="Login to your account"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button
              onClick={() => handleAuthNavigation('/auth/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              aria-label="Create a new account"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Transforming Healthcare in Bosnia and Herzegovina
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Connect with trusted healthcare providers, manage appointments, and access your medical records - all in one secure platform.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => handleAuthNavigation('/auth/signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors group"
                  aria-label="Get started with ByteMeds"
                >
                  <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToFeatures}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors group"
                  aria-label="Learn more about our features"
                >
                  Learn More
                  <ChevronDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px] rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
            >
              <Stethoscope className="w-48 h-48 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white dark:bg-gray-800 py-16 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Why Choose ByteMeds?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-lg bg-blue-50 dark:bg-gray-700 group hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Login Dialog - Kept for progressive enhancement */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login to ByteMeds</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            handleAuthNavigation('/auth/signin');
          }}>
            <RadioGroup defaultValue="patient" className="grid grid-cols-2 gap-4 p-4">
              <div>
                <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                <Label
                  htmlFor="patient"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <UserCircle className="mb-3 h-6 w-6" />
                  Patient
                </Label>
              </div>
              <div>
                <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                <Label
                  htmlFor="doctor"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <UserCog className="mb-3 h-6 w-6" />
                  Doctor
                </Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Dialog - Kept for progressive enhancement */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
            <DialogDescription>
              Join ByteMeds to access quality healthcare services
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            handleAuthNavigation('/auth/signup');
          }}>
            <RadioGroup defaultValue="patient" className="grid grid-cols-2 gap-4 p-4">
              <div>
                <RadioGroupItem value="patient" id="reg-patient" className="peer sr-only" />
                <Label
                  htmlFor="reg-patient"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <UserCircle className="mb-3 h-6 w-6" />
                  Patient
                </Label>
              </div>
              <div>
                <RadioGroupItem value="doctor" id="reg-doctor" className="peer sr-only" />
                <Label
                  htmlFor="reg-doctor"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <UserCog className="mb-3 h-6 w-6" />
                  Doctor
                </Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input id="reg-name" placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input id="reg-password" type="password" placeholder="Create a password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm-password">Confirm Password</Label>
              <Input id="reg-confirm-password" type="password" placeholder="Confirm your password" />
            </div>
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Features data with Lucide icons
const features: Feature[] = [
  {
    title: "Easy Appointment Booking",
    description: "Schedule appointments with healthcare providers in just a few clicks.",
    icon: CalendarDays
  },
  {
    title: "Secure Medical Records",
    description: "Access and manage your medical history securely from anywhere.",
    icon: ShieldCheck
  },
  {
    title: "Expert Healthcare Providers",
    description: "Connect with qualified and verified medical professionals.",
    icon: ClipboardList
  },
];
