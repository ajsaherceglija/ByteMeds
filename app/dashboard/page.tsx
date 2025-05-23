'use client';

import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Bell,
  Clock,
  User,
  Pill,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { format } from 'date-fns';

// Types for our dashboard data
interface DashboardData {
  activeAppointments: any[];
  nextCheckup: any | null;
  favoriteDoctor: {
    id: string;
    users: {
      name: string;
    };
    visitCount: number;
    latestVisit: string;
  } | null;
  recentActivity: any[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeAppointments: [],
    nextCheckup: null,
    favoriteDoctor: null,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status === 'loading') {
        return;
      }

      if (!session?.user?.id) {
        console.error('No session or user ID available');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch active appointments
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            duration,
            type,
            notes,
            doctor_id,
            doctors!inner(
              id,
              users!inner(
                name
              )
            )
          `)
          .eq('patient_id', session.user.id)
          .eq('is_active', true)
          .gte('appointment_date', new Date().toISOString())
          .order('appointment_date', { ascending: true });

        if (appointmentsError) {
          console.error('Appointments error:', appointmentsError);
          throw appointmentsError;
        }

        // Find the next checkup (next upcoming appointment)
        const nextCheckup = appointments?.[0] || null;

        // Find favorite doctor (doctor with most appointments)
        const { data: doctorStats, error: doctorStatsError } = await supabase
          .rpc('get_favorite_doctor_all', {
            p_patient_id: session.user.id
          });

        if (doctorStatsError) {
          console.error('Doctor stats error:', doctorStatsError);
          throw doctorStatsError;
        }

        const doctorData = doctorStats?.[0];
        const favoriteDoctor = doctorData ? {
          id: doctorData.doctor_id,
          users: {
            name: doctorData.doctor_name
          },
          visitCount: doctorData.visit_count,
          latestVisit: doctorData.latest_visit
        } : null;

        // Fetch recent activity
        const { data: recentActivity, error: activityError } = await supabase
          .from('health_parameters')
          .select('*')
          .eq('patient_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activityError) {
          console.error('Activity error:', activityError);
          throw activityError;
        }

        setDashboardData({
          activeAppointments: appointments || [],
          nextCheckup,
          favoriteDoctor,
          recentActivity: recentActivity || [],
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {session.user.name}
      </h1>

      {/* Active Appointments Reminder */}
      {dashboardData.activeAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.activeAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        Dr. {appointment.doctors.users.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(appointment.appointment_date), 'PPP p')} ({appointment.duration} mins)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                        {appointment.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
            <CardTitle>Active Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.activeAppointments.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Doctor</CardTitle>
            <CardDescription>Doctor you visit most frequently</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.favoriteDoctor ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">Dr. {dashboardData.favoriteDoctor.users.name}</p>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.favoriteDoctor.visitCount} visits
                  {dashboardData.favoriteDoctor.latestVisit && (
                    <> · Last visit: {format(new Date(Math.min(Date.now(), new Date(dashboardData.favoriteDoctor.latestVisit).getTime())), 'PP')}</>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No regular doctor yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Check-up</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.nextCheckup ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {format(new Date(dashboardData.nextCheckup.appointment_date), 'PPP')}
                </p>
                <p className="text-sm text-muted-foreground">
                  with Dr. {dashboardData.nextCheckup.doctors.users.name}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming check-ups</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest health-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      Updated {activity.parameter}: {activity.value} {activity.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.created_at), 'PPP p')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity to show</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}