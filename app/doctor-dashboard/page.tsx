'use client';

import { Stethoscope, Calendar, Users, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual API calls
const mockDoctorStats = {
  totalPatients: 150,
  appointmentsToday: 8,
  pendingReports: 12,
};

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Dr. Smith</h1>
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
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Total Patients</CardTitle>
                <CardDescription>Overall patient count</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockDoctorStats.totalPatients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>Scheduled for today</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockDoctorStats.appointmentsToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Pending Reports</CardTitle>
                <CardDescription>Reports awaiting review</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockDoctorStats.pendingReports}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 