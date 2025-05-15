'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FileText, Search, User, Plus, Calendar } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockMedicalRecords = [
  {
    id: 1,
    patientName: 'John Doe',
    recordType: 'Lab Results',
    date: '2024-03-15T10:00:00Z',
    description: 'Blood work analysis',
    status: 'completed',
    isActive: true,
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    recordType: 'Imaging',
    date: '2024-03-14T14:30:00Z',
    description: 'Chest X-ray results',
    status: 'pending',
    isActive: true,
  },
  {
    id: 3,
    patientName: 'Alice Brown',
    recordType: 'Treatment Plan',
    date: '2024-03-10T09:00:00Z',
    description: 'Physiotherapy schedule',
    status: 'pending',
    isActive: false,
  },
];

export default function MedicalRecordsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [patientStatus, setPatientStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredRecords = mockMedicalRecords.filter(record => {
    const matchesSearch = 
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.recordType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      patientStatus === 'all' || 
      (patientStatus === 'active' && record.isActive) ||
      (patientStatus === 'inactive' && !record.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">
            View and manage patient medical records
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={patientStatus}
            onValueChange={(value: 'all' | 'active' | 'inactive') => setPatientStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select patient status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="active">Active Patients</SelectItem>
              <SelectItem value="inactive">Inactive Patients</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push('/doctor-dashboard/medical-records/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Medical Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} records found
          </CardDescription>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search medical records..."
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
                <TableHead>Record Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patient Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{record.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{record.recordType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(record.date), 'PPP')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        record.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        record.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {record.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctor-dashboard/medical-records/${record.id}`}>
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