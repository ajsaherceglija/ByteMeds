'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
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
  ShieldCheck,
  LayoutDashboard,
  Heart,
  Clock,
  Shield
} from "lucide-react";

// Interface for feature items
interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

const features: Feature[] = [
  {
    title: "Easy Appointment Booking",
    description: "Schedule appointments with healthcare providers seamlessly through our intuitive platform.",
    icon: CalendarDays,
  },
  {
    title: "Secure Medical Records",
    description: "Your medical information is stored securely and accessible only to authorized personnel.",
    icon: ShieldCheck,
  },
  {
    title: "Digital Prescriptions",
    description: "Get and manage your prescriptions digitally, with easy access to your medication history.",
    icon: ClipboardList,
  },
];

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
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

  // Function to handle dashboard navigation
  const handleDashboardNavigation = () => {
    const path = session?.user?.is_doctor ? '/doctor-dashboard' : '/dashboard';
    router.push(path);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-100/90 via-slate-100 to-indigo-100/90 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed w-full top-0 bg-blue-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-blue-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200/50 dark:border-gray-700/50 shadow-sm">
            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              ByteMeds
            </span>
          </div>
          <nav className="flex gap-4">
            {session ? (
              <Button
                onClick={handleDashboardNavigation}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                aria-label="Go to dashboard"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAuthNavigation('/auth/signin')}
                  className="border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  aria-label="Login to your account"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={() => handleAuthNavigation('/auth/signup')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Create a new account"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </Button>
              </>
            )}
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
              className="relative z-10"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Transforming Healthcare in Bosnia and Herzegovina
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Connect with trusted healthcare providers, manage appointments, and access your medical records - all in one secure platform.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => handleAuthNavigation('/auth/signup')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                  aria-label="Get started with ByteMeds"
                >
                  <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToFeatures}
                  className="border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
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
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl transform rotate-6 blur-xl"></div>
              <div className="relative h-[400px] rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-gray-800 dark:to-gray-900 border border-blue-200/50 dark:border-gray-700/50 shadow-xl backdrop-blur-xl flex items-center justify-center overflow-hidden group">
                <Stethoscope className="w-48 h-48 text-blue-600 dark:text-blue-400 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-900/50 pointer-events-none"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-gray-800 dark:to-gray-900"></div>
          <div className="container mx-auto px-4 relative">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Why Choose ByteMeds?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl transform -rotate-3 blur-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-105"></div>
                  <div className="relative p-6 rounded-xl bg-blue-50/50 dark:bg-gray-800/80 backdrop-blur-xl border border-blue-200/50 dark:border-gray-700/50 shadow-lg transition-transform duration-500 hover:scale-[1.02]">
                    <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-transparent to-blue-100/50 dark:to-gray-900/50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ByteMeds
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              © 2024 ByteMeds. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
