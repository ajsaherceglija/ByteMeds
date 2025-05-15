'use client';

import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Plus,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for doctor dashboard
const mockDoctorStats = {
  totalPatients: 150,
  appointmentsToday: 8,
  pendingPrescriptions: 5,
  recentRecords: 12,
};

export default function DoctorDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, Dr. {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your patients
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/doctor-dashboard/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/doctor-dashboard/prescriptions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockDoctorStats.totalPatients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockDoctorStats.appointmentsToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockDoctorStats.recentRecords}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest patient interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add recent activity items here */}
            <p className="text-sm text-muted-foreground">No recent activity to show.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 