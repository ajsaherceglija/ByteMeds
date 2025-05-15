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
  Bell,
  Clock,
  User,
  Pill,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { LineChart } from '../../components/charts/line-chart';
import { format } from 'date-fns';

// Mock data for patient dashboard
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
  const [activeAppointments, setActiveAppointments] = useState<any[]>([]);
  const [medicationReminders, setMedicationReminders] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return;

      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      // Fetch appointments (next 7 days)
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', session.user.id)
        .eq('is_active', true)
        .gte('appointment_date', today.toISOString())
        .lte('appointment_date', sevenDaysFromNow.toISOString())
        .order('appointment_date', { ascending: true });

      // Fetch active medications (all future-dated)
      const { data: medications, error: medicationsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', session.user.id)
        .eq('status', 'active')
        .gte('valid_until', today.toISOString())
        .order('valid_until', { ascending: true });

      if (!appointmentsError) setActiveAppointments(appointments || []);
      if (!medicationsError) setMedicationReminders(medications || []);
    };

    fetchDashboardData();
  }, [session]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {session?.user?.name}
      </h1>

      {/* Active Appointments Reminder */}
      {activeAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {appointment.doctor_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(appointment.appointment_date), 'h:mm a')} ({appointment.duration} mins)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                        upcoming
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {appointment.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/appointments/${appointment.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Medications Reminder */}
      {medicationReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Active Medications
            </CardTitle>
            <CardDescription>
              These medications are currently active until their expiration date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicationReminders.map((prescription) => {
                const expiresSoon = new Date(prescription.valid_until) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={prescription.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {prescription.medication_name || "Prescribed Medication"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Valid until: {format(new Date(prescription.valid_until), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      {prescription.dosage && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Dosage: {prescription.dosage}</span>
                        </div>
                      )}
                      {prescription.frequency && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Frequency: {prescription.frequency}</span>
                        </div>
                      )}
                      {expiresSoon && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700">
                            Expires soon
                          </span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/prescriptions/${prescription.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <p className="text-muted-foreground">
          Here's what's happening with your health
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/dashboard/appointments">
            <Plus className="mr-2 h-4 w-4" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockPatientStats.upcomingAppointments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockPatientStats.activeMedications}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Check-up</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockPatientStats.lastCheckup}</p>
          </CardContent>
        </Card>
      </div>

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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest health-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No recent activity to show.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}