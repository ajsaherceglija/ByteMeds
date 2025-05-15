'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockAppointments = [
  {
    id: 1,
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    date: '2024-03-20T10:00:00Z',
    duration: 30,
    type: 'Check-up',
    status: 'upcoming',
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    doctorName: 'Dr. Johnson',
    date: '2024-03-20T14:30:00Z',
    duration: 45,
    type: 'Follow-up',
    status: 'upcoming',
  },
  {
    id: 3,
    patientName: 'Alice Brown',
    doctorName: 'Dr. Smith',
    date: '2024-03-19T09:00:00Z',
    duration: 30,
    type: 'Consultation',
    status: 'completed',
  },
];

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const isDoctor = session?.user?.is_doctor;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const filteredAppointments = mockAppointments.filter(
    (appointment) =>
      selectedDate &&
      format(new Date(appointment.date), 'yyyy-MM-dd') ===
        format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your {isDoctor ? 'patient appointments' : 'medical appointments'}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/appointments/new">
            {isDoctor ? 'Schedule Appointment' : 'Book Appointment'}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Appointments List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? format(selectedDate, 'MMMM d, yyyy')
                  : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length
                  ? `${filteredAppointments.length} appointments scheduled`
                  : 'No appointments scheduled'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {isDoctor
                            ? appointment.patientName
                            : appointment.doctorName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(appointment.date), 'h:mm a')} (
                          {appointment.duration} mins)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            appointment.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {appointment.status}
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
                {filteredAppointments.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No appointments scheduled for this date.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 