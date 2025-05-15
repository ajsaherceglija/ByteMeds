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
import { LineChart } from '../../components/charts/line-chart';

// Mock data - replace with actual API calls
const mockDoctorStats = {
  totalPatients: 150,
  appointmentsToday: 8,
  pendingPrescriptions: 5,
  recentRecords: 12,
};

const mockPatientStats = {
  upcomingAppointments: 2,
  activeMedications: 3,
  recentParameters: {
    weight: '75 kg',
    bloodPressure: '120/80',
    lastUpdated: '2024-03-15',
  },
  lastCheckup: '2024-03-01',
};

const mockData = [
  { date: '2024-01', value: 98 },
  { date: '2024-02', value: 95 },
  { date: '2024-03', value: 97 },
  { date: '2024-04', value: 96 },
  { date: '2024-05', value: 99 },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const isDoctor = session?.user?.isDoctor;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your {isDoctor ? 'patients' : 'health'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href={isDoctor ? '/dashboard/appointments/new' : '/dashboard/appointments'}>
            <Plus className="mr-2 h-4 w-4" />
            {isDoctor ? 'New Appointment' : 'Book Appointment'}
          </Link>
        </Button>
        {isDoctor && (
          <Button asChild variant="secondary">
            <Link href="/dashboard/prescriptions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{isDoctor ? 'Total Patients' : 'Upcoming Appointments'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isDoctor ? mockDoctorStats.totalPatients : mockPatientStats.upcomingAppointments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isDoctor ? 'Today\'s Appointments' : 'Pending Prescriptions'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isDoctor ? mockDoctorStats.appointmentsToday : mockDoctorStats.pendingPrescriptions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isDoctor ? 'Pending Reports' : 'Next Check-up'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isDoctor ? mockDoctorStats.recentRecords : mockPatientStats.lastCheckup}</p>
          </CardContent>
        </Card>
      </div>

      {!isDoctor && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Health Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <LineChart data={mockData} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest health-related activities</CardDescription>
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