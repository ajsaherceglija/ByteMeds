'use client';

import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { FileText, User, ArrowLeft, Calendar } from 'lucide-react';
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
const mockMedicalRecords = [
  {
    id: 1,
    patientName: 'John Doe',
    recordType: 'Lab Results',
    date: '2024-03-15T10:00:00Z',
    description: 'Blood work analysis',
    status: 'completed',
    patientDetails: {
      age: 35,
      contact: '+1 234-567-8900',
      email: 'john.doe@email.com'
    },
    results: {
      bloodPressure: '120/80',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      bloodSugar: '95 mg/dL'
    },
    doctorNotes: 'All results within normal range. Follow-up in 6 months.',
    attachments: [
      { name: 'Blood Work Report.pdf', type: 'PDF', size: '2.4 MB' },
      { name: 'Lab Analysis.pdf', type: 'PDF', size: '1.8 MB' }
    ]
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    recordType: 'Imaging',
    date: '2024-03-14T14:30:00Z',
    description: 'Chest X-ray results',
    status: 'pending',
    patientDetails: {
      age: 28,
      contact: '+1 234-567-8901',
      email: 'jane.smith@email.com'
    },
    results: {
      findings: 'Awaiting radiologist report',
      preliminaryNotes: 'Initial scan completed'
    },
    doctorNotes: 'Awaiting final analysis from radiology department',
    attachments: [
      { name: 'Chest X-ray.jpg', type: 'Image', size: '5.2 MB' }
    ]
  }
];

export default function MedicalRecordDetailsPage() {
  const params = useParams();
  const recordId = Number(params.id);
  
  const record = mockMedicalRecords.find(r => r.id === recordId);

  if (!record) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/medical-records">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medical Records
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Medical Record Not Found</CardTitle>
            <CardDescription>
              The requested medical record could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/medical-records">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Medical Records
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medical Record Details</h1>
        <p className="text-muted-foreground">
          Viewing medical record information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{record.recordType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(record.date), 'PPP')}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{record.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  record.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {record.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{record.patientName}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Age</p>
              <p className="text-sm text-muted-foreground">
                {record.patientDetails.age} years
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {record.patientDetails.contact}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {record.patientDetails.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.results && (
              <div>
                <p className="text-sm font-medium">Results</p>
                {Object.entries(record.results).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Doctor's Notes</p>
              <p className="text-sm text-muted-foreground">{record.doctorNotes}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {record.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.type} • {attachment.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>
          Update Record
        </Button>
        <Button variant="outline">
          Print Record
        </Button>
      </div>
    </div>
  );
} 