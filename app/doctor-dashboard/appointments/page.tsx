'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

// Mock appointment data
const mockAppointments = [
  {
    id: '1',
    patientName: 'John Doe',
    date: new Date('2024-03-25T09:00:00'),
    duration: 30,
    type: 'Check-up',
    status: 'scheduled',
    notes: 'Regular check-up appointment'
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    date: new Date('2024-03-25T10:00:00'),
    duration: 45,
    type: 'Follow-up',
    status: 'completed',
    notes: 'Follow-up for previous treatment'
  },
  {
    id: '3',
    patientName: 'Alice Johnson',
    date: new Date('2024-03-26T14:00:00'),
    duration: 60,
    type: 'Initial Visit',
    status: 'scheduled',
    notes: 'New patient consultation'
  },
  {
    id: '4',
    patientName: 'Bob Wilson',
    date: new Date('2024-03-26T15:30:00'),
    duration: 30,
    type: 'Emergency',
    status: 'cancelled',
    notes: 'Emergency consultation'
  }
];

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments] = useState(mockAppointments);

  const filteredAppointments = appointments.filter(
    (appointment) =>
      selectedDate &&
      format(appointment.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:sticky md:top-6">
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
                    className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{appointment.patientName}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(appointment.date, 'h:mm a')} ({appointment.duration} mins)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            appointment.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : appointment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {appointment.status}
                        </Badge>
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