'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { User, Search, Plus } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Link from 'next/link';
import { SharePatientModal } from './components/share-patient-modal';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  condition: string;
  status: string;
  sharedBy?: string;
}

// Mock data - replace with actual API calls
const mockMyPatients: Patient[] = [
  {
    id: 'P001',
    name: 'John Doe',
    age: 35,
    lastVisit: '2024-03-15T10:00:00Z',
    condition: 'Hypertension',
    status: 'Active',
  },
  {
    id: 'P002',
    name: 'Jane Smith',
    age: 28,
    lastVisit: '2024-03-14T14:30:00Z',
    condition: 'Diabetes Type 2',
    status: 'Active',
  },
  {
    id: 'P003',
    name: 'Alice Brown',
    age: 45,
    lastVisit: '2024-03-10T09:00:00Z',
    condition: 'Arthritis',
    status: 'Active',
  },
];

const mockSharedPatients: Patient[] = [
  {
    id: 'P004',
    name: 'Robert Wilson',
    age: 52,
    lastVisit: '2024-03-12T11:00:00Z',
    condition: 'Post-Surgery Recovery',
    status: 'Active',
    sharedBy: 'Dr. Johnson',
  },
  {
    id: 'P005',
    name: 'Emily Davis',
    age: 31,
    lastVisit: '2024-03-13T15:30:00Z',
    condition: 'Pregnancy',
    status: 'Active',
    sharedBy: 'Dr. Williams',
  },
];

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-patients');

  const currentPatients = activeTab === 'my-patients' ? mockMyPatients : mockSharedPatients;
  const filteredPatients = currentPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage and view your patient list
          </p>
        </div>
        {activeTab === 'my-patients' && (
          <Button asChild>
            <Link href="/doctor-dashboard/patients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-patients">My Patients</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="my-patients">
          <Card>
            <CardHeader>
              <CardTitle>My Patients</CardTitle>
              <CardDescription>
                {filteredPatients.length} patients found
              </CardDescription>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search patients..."
                    className="w-full rounded-md border border-input pl-8 pr-2 py-2 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PatientsTable patients={filteredPatients} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared">
          <Card>
            <CardHeader>
              <CardTitle>Shared Patients</CardTitle>
              <CardDescription>
                {filteredPatients.length} shared patients found
              </CardDescription>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search shared patients..."
                    className="w-full rounded-md border border-input pl-8 pr-2 py-2 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PatientsTable 
                patients={filteredPatients}
                showSharedBy={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PatientsTableProps {
  patients: Patient[];
  showSharedBy?: boolean;
}

function PatientsTable({ patients, showSharedBy = false }: PatientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Last Visit</TableHead>
          <TableHead>Condition</TableHead>
          <TableHead>Status</TableHead>
          {showSharedBy && <TableHead>Shared By</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>{patient.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{patient.name}</span>
              </div>
            </TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{format(new Date(patient.lastVisit), 'PPP')}</TableCell>
            <TableCell>{patient.condition}</TableCell>
            <TableCell>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                {patient.status}
              </span>
            </TableCell>
            {showSharedBy && (
              <TableCell>{patient.sharedBy}</TableCell>
            )}
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {!showSharedBy && (
                  <SharePatientModal
                    patientName={patient.name}
                    patientId={patient.id}
                  />
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/doctor-dashboard/patients/${patient.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 