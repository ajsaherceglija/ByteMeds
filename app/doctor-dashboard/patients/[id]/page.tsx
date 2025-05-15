'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock patient data
const mockPatientData = {
  id: '1',
  name: 'John Doe',
  age: 45,
  gender: 'Male',
  contact: '+1 234 567 8900',
  email: 'john.doe@email.com',
  bloodType: 'O+',
  medicalHistory: [
    { date: '2024-03-15', condition: 'Hypertension', notes: 'Prescribed medication and lifestyle changes' },
    { date: '2024-02-01', condition: 'Common Cold', notes: 'Prescribed rest and over-the-counter medication' },
  ],
  upcomingAppointments: [
    { date: '2024-03-20', time: '10:00 AM', type: 'Follow-up' },
    { date: '2024-04-05', time: '2:30 PM', type: 'Regular Checkup' },
  ],
  prescriptions: [
    { date: '2024-03-15', medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { date: '2024-02-01', medication: 'Ibuprofen', dosage: '400mg', frequency: 'As needed' },
  ],
};

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id;

  // In a real application, you would fetch patient data based on the ID
  // For now, we'll use mock data
  const patient = mockPatientData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{patient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p>{patient.age}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p>{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Blood Type</p>
              <p>{patient.bloodType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact</p>
              <p>{patient.contact}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{patient.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.medicalHistory.map((record, index) => (
                  <div key={index} className="border-b pb-4">
                    <p className="font-medium">{record.date}</p>
                    <p className="text-muted-foreground">{record.condition}</p>
                    <p className="text-sm">{record.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="border-b pb-4">
                    <p className="font-medium">{appointment.date} at {appointment.time}</p>
                    <p className="text-muted-foreground">{appointment.type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.prescriptions.map((prescription, index) => (
                  <div key={index} className="border-b pb-4">
                    <p className="font-medium">{prescription.medication}</p>
                    <p className="text-muted-foreground">
                      {prescription.dosage} - {prescription.frequency}
                    </p>
                    <p className="text-sm">Prescribed on: {prescription.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 