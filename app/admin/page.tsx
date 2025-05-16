'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AdminLayout } from '@/components/layout/admin-layout';
import { createClient } from '@/app/utils/supabase/client';
import { Users, UserCog, Calendar, Activity } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  activeAppointments: number;
  totalAppointmentsToday: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    activeAppointments: 0,
    totalAppointmentsToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get total patients (users who are not doctors and not admins)
      const { data: patients, error: patientsError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_doctor', false)
        .eq('is_admin', false);

      if (patientsError) throw patientsError;

      // Get total doctors
      const { data: doctors, error: doctorsError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_doctor', true);

      if (doctorsError) throw doctorsError;

      // Get active appointments (future appointments)
      const { data: activeAppts, error: activeApptsError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
        .gte('appointment_date', new Date().toISOString());

      if (activeApptsError) throw activeApptsError;

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: todayAppts, error: todayApptsError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .gte('appointment_date', today.toISOString())
        .lt('appointment_date', tomorrow.toISOString());

      if (todayApptsError) throw todayApptsError;

      setStats({
        totalPatients: patients?.length || 0,
        totalDoctors: doctors?.length || 0,
        activeAppointments: activeAppts?.length || 0,
        totalAppointmentsToday: todayAppts?.length || 0,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description }: {
    title: string;
    value: number;
    icon: any;
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your medical practice
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={Users}
            description="Registered patients in the system"
          />
          <StatCard
            title="Total Doctors"
            value={stats.totalDoctors}
            icon={UserCog}
            description="Active medical practitioners"
          />
          <StatCard
            title="Active Appointments"
            value={stats.activeAppointments}
            icon={Calendar}
            description="Upcoming scheduled appointments"
          />
          <StatCard
            title="Today's Appointments"
            value={stats.totalAppointmentsToday}
            icon={Activity}
            description="Appointments scheduled for today"
          />
        </div>
      </div>
    </AdminLayout>
  );
} 