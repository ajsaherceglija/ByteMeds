'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
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
    date: '2024-03-20T10:00:00Z',
    duration: 30,
    type: 'Check-up',
    status: 'upcoming',
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    date: '2024-03-20T11:00:00Z',
    duration: 45,
    type: 'Follow-up',
    status: 'upcoming',
  },
  {
    id: 3,
    patientName: 'Alice Brown',
    date: '2024-03-20T13:30:00Z',
    duration: 30,
    type: 'Consultation',
    status: 'upcoming',
  },
  {
    id: 4,
    patientName: 'Robert Wilson',
    date: '2024-03-20T14:30:00Z',
    duration: 30,
    type: 'Check-up',
    status: 'upcoming',
  },
  {
    id: 5,
    patientName: 'Emily Davis',
    date: '2024-03-20T15:30:00Z',
    duration: 45,
    type: 'Initial Consultation',
    status: 'upcoming',
  },
  {
    id: 6,
    patientName: 'Michael Johnson',
    date: '2024-03-20T16:30:00Z',
    duration: 30,
    type: 'Follow-up',
    status: 'upcoming',
  },
  {
    id: 7,
    patientName: 'Sarah Thompson',
    date: '2024-03-20T17:15:00Z',
    duration: 30,
    type: 'Check-up',
    status: 'upcoming',
  },
  {
    id: 8,
    patientName: 'David Anderson',
    date: '2024-03-20T18:00:00Z',
    duration: 30,
    type: 'Consultation',
    status: 'upcoming',
  }
];

export default function AppointmentsPage() {
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
            Manage your patient appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/doctor-dashboard/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>
              Appointments for {selectedDate ? format(selectedDate, 'PPP') : 'Today'}
            </CardTitle>
            <CardDescription>
              {filteredAppointments.length} appointments scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments scheduled for this day.</p>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between space-x-4 rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{appointment.patientName}</p>
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
                      <Link href={`/doctor-dashboard/appointments/${appointment.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 