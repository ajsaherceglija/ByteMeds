'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  Users,
  FileText,
  Pill,
  Stethoscope,
  Menu,
  X,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserNav } from '../../components/layout/user-nav';

const navItems = [
  { href: '/doctor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctor-dashboard/patients', label: 'Patients', icon: Users },
  { href: '/doctor-dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/doctor-dashboard/medical-records', label: 'Medical Records', icon: FileText },
  { href: '/doctor-dashboard/prescriptions', label: 'Prescriptions', icon: Pill },
  { href: '/doctor-dashboard/consultations', label: 'Consultations', icon: Stethoscope },
  { href: '/doctor-dashboard/analyze', label: 'Analyze with AI', icon: Brain },
];

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 transform border-r bg-background transition-transform duration-200 ease-in-out',
          !isSidebarOpen && '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/doctor-dashboard" className="flex items-center space-x-2">
              <span className="text-lg font-bold">HACKMEDRECON</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                    pathname === item.href
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="mt-auto border-t p-4 z-50">
            <UserNav />
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main content */}
      <main
        className={cn(
          'min-h-screen bg-background transition-all duration-200 ease-in-out',
          isSidebarOpen ? 'md:pl-64' : ''
        )}
      >
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 