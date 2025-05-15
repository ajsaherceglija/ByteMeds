'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

// Mock data - replace with actual API calls
const mockMedications = {
  active: [
    {
      id: 1,
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      startDate: '2024-03-15T10:00:00Z',
      endDate: '2024-03-22T10:00:00Z',
      prescribedBy: 'Dr. Smith',
      instructions: 'Take with food',
      remainingDays: 5,
      nextDose: '2024-03-17T14:00:00Z',
    },
    {
      id: 2,
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'As needed',
      startDate: '2024-03-15T10:00:00Z',
      endDate: '2024-03-29T10:00:00Z',
      prescribedBy: 'Dr. Smith',
      instructions: 'Take for pain',
      remainingDays: 12,
      nextDose: null,
    },
  ],
  history: [
    {
      id: 3,
      name: 'Ciprofloxacin',
      dosage: '250mg',
      frequency: 'Twice daily',
      startDate: '2024-02-01T10:00:00Z',
      endDate: '2024-02-14T10:00:00Z',
      prescribedBy: 'Dr. Johnson',
      completed: true,
    },
  ],
};

export default function MedicationsPage() {
  //const { data: session } = useSession();
  //const [showReminders, setShowReminders] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-muted-foreground">
            Manage your medications and prescriptions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Set Reminders</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Medication Reminders</DialogTitle>
              <DialogDescription>
                Configure reminders for your medications
              </DialogDescription>
            </DialogHeader>
            {/* Add reminder configuration form here */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Medications */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Medications</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mockMedications.active.map((medication) => (
            <Card key={medication.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{medication.name}</CardTitle>
                    <CardDescription>
                      {medication.dosage} - {medication.frequency}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(medication.startDate), 'PPP')} -{' '}
                        {format(new Date(medication.endDate), 'PPP')}
                      </span>
                    </div>
                    {medication.nextDose && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Next dose: {format(new Date(medication.nextDose), 'p')}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>{medication.remainingDays} days remaining</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Instructions:</p>
                    <p className="text-muted-foreground">{medication.instructions}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Prescribed by {medication.prescribedBy}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Medication History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Medication History</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Prescribed By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMedications.history.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">{medication.name}</TableCell>
                    <TableCell>{medication.dosage}</TableCell>
                    <TableCell>{medication.frequency}</TableCell>
                    <TableCell>
                      {format(new Date(medication.startDate), 'MMM d')} -{' '}
                      {format(new Date(medication.endDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{medication.prescribedBy}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        Completed
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 