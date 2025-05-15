'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Pill, Search, User, Plus } from 'lucide-react';
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
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockPrescriptions = [
  {
    id: 1,
    patientName: 'John Doe',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: '3 times daily',
        duration: '7 days',
      },
    ],
    date: '2024-03-15T10:00:00Z',
    status: 'active',
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    medications: [
      {
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        duration: '14 days',
      },
      {
        name: 'Omeprazole',
        dosage: '20mg',
        frequency: 'Once daily',
        duration: '14 days',
      },
    ],
    date: '2024-03-14T14:30:00Z',
    status: 'active',
  },
  {
    id: 3,
    patientName: 'Alice Brown',
    medications: [
      {
        name: 'Ciprofloxacin',
        dosage: '250mg',
        frequency: 'Twice daily',
        duration: '5 days',
      },
    ],
    date: '2024-03-10T09:00:00Z',
    status: 'completed',
  },
];

export default function PrescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrescriptions = mockPrescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.medications.some(med => 
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage and write prescriptions for patients
          </p>
        </div>
        <Button asChild>
          <Link href="/doctor-dashboard/prescriptions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
          <CardDescription>
            {filteredPrescriptions.length} prescriptions found
          </CardDescription>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search prescriptions..."
                className="w-full rounded-md border border-input pl-8 pr-2 py-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{prescription.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {prescription.medications.map((medication, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Pill className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {medication.name} ({medication.dosage}) -{' '}
                            {medication.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(prescription.date), 'PPP')}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        prescription.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {prescription.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctor-dashboard/prescriptions/${prescription.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 