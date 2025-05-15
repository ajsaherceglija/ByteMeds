'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { format } from 'date-fns';
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
import { FileText, Search, User } from 'lucide-react';

// Mock data - replace with actual API calls
const mockRecords = [
  {
    id: 1,
    patientName: 'John Doe',
    patientId: 'P001',
    recordType: 'Consultation',
    date: '2024-03-15T10:00:00Z',
    diagnosis: 'Common Cold',
    notes: 'Patient presented with symptoms of upper respiratory infection. Prescribed antibiotics and rest.',
    attachments: ['blood_test.pdf', 'prescription.pdf'],
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    patientId: 'P002',
    recordType: 'Follow-up',
    date: '2024-03-14T14:30:00Z',
    diagnosis: 'Hypertension',
    notes: 'Blood pressure remains elevated. Adjusted medication dosage.',
    attachments: ['bp_chart.pdf'],
  },
  {
    id: 3,
    patientName: 'Alice Brown',
    patientId: 'P003',
    recordType: 'Annual Check-up',
    date: '2024-03-13T09:00:00Z',
    diagnosis: 'Healthy',
    notes: 'All vitals normal. Recommended regular exercise and balanced diet.',
    attachments: ['lab_results.pdf', 'health_summary.pdf'],
  },
];

export default function MedicalRecordsPage() {
  //const { data: session } = useSession();
  const [recordType, setRecordType] = useState<string>('all');

  const filteredRecords = mockRecords.filter((record) =>
    recordType === 'all' ? true : record.recordType === recordType
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">
            Manage and view patient medical records
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/medical-records/new">Create Record</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter medical records by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Select
                value={recordType}
                onValueChange={(value) => setRecordType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="Consultation">Consultations</SelectItem>
                  <SelectItem value="Follow-up">Follow-ups</SelectItem>
                  <SelectItem value="Annual Check-up">Annual Check-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search records..."
                className="w-full rounded-md border border-input pl-8 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Record Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{record.patientName}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {record.patientId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{record.recordType}</TableCell>
                  <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={record.diagnosis}>
                      {record.diagnosis}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{record.attachments.length} files</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/medical-records/${record.id}`}>
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