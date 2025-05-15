'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { format } from 'date-fns';

// Mock data - replace with actual API calls
const mockHistory = {
  diagnoses: [
    {
      id: 1,
      date: '2024-03-15T10:00:00Z',
      doctorName: 'Dr. Smith',
      diagnosis: 'Common Cold',
      notes: 'Rest recommended, prescribed antibiotics',
      followUp: '2024-03-22T10:00:00Z',
    },
    {
      id: 2,
      date: '2024-02-15T14:30:00Z',
      doctorName: 'Dr. Johnson',
      diagnosis: 'Annual Check-up',
      notes: 'All vitals normal, recommended regular exercise',
      followUp: null,
    },
  ],
  labResults: [
    {
      id: 1,
      date: '2024-03-15T10:00:00Z',
      type: 'Blood Test',
      results: [
        { name: 'Hemoglobin', value: '14.5', unit: 'g/dL', status: 'normal' },
        { name: 'White Blood Cells', value: '7.5', unit: 'K/µL', status: 'normal' },
        { name: 'Platelets', value: '250', unit: 'K/µL', status: 'normal' },
      ],
      orderedBy: 'Dr. Smith',
    },
  ],
  vaccinations: [
    {
      id: 1,
      date: '2024-01-15T09:00:00Z',
      name: 'Influenza Vaccine',
      administrator: 'Dr. Johnson',
      nextDue: '2025-01-15T09:00:00Z',
    },
    {
      id: 2,
      date: '2023-12-01T11:00:00Z',
      name: 'COVID-19 Booster',
      administrator: 'Dr. Smith',
      nextDue: null,
    },
  ],
  allergies: [
    {
      id: 1,
      allergen: 'Penicillin',
      severity: 'Severe',
      reactions: 'Rash, difficulty breathing',
      diagnosed: '2023-10-15T10:00:00Z',
      diagnosedBy: 'Dr. Smith',
    },
  ],
};

export default function MedicalHistoryPage() {
  //const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('diagnoses');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
        <p className="text-muted-foreground">
          View your complete medical history and records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnoses" className="space-y-4">
          {mockHistory.diagnoses.map((diagnosis) => (
            <Card key={diagnosis.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{diagnosis.diagnosis}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(diagnosis.date), 'PPP')}
                  </span>
                </div>
                <CardDescription>By {diagnosis.doctorName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>{diagnosis.notes}</p>
                  {diagnosis.followUp && (
                    <p className="text-sm text-muted-foreground">
                      Follow-up scheduled for:{' '}
                      {format(new Date(diagnosis.followUp), 'PPP')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lab-results" className="space-y-4">
          {mockHistory.labResults.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.type}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(result.date), 'PPP')}
                  </span>
                </div>
                <CardDescription>Ordered by {result.orderedBy}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.results.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.value} {item.unit}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.status === 'normal'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          {mockHistory.vaccinations.map((vaccination) => (
            <Card key={vaccination.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{vaccination.name}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(vaccination.date), 'PPP')}
                  </span>
                </div>
                <CardDescription>
                  Administered by {vaccination.administrator}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vaccination.nextDue && (
                  <p className="text-sm text-muted-foreground">
                    Next dose due: {format(new Date(vaccination.nextDue), 'PPP')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          {mockHistory.allergies.map((allergy) => (
            <Card key={allergy.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{allergy.allergen}</CardTitle>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      allergy.severity === 'Severe'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {allergy.severity}
                  </span>
                </div>
                <CardDescription>
                  Diagnosed by {allergy.diagnosedBy} on{' '}
                  {format(new Date(allergy.diagnosed), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Reactions: {allergy.reactions}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 