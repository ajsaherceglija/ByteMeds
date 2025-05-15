'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, X, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock patient data
const mockPatientData = {
  id: '1',
  name: 'John Doe',
  age: 45,
  gender: 'Male',
  contact: '+1 234 567 8900',
  email: 'john.doe@email.com',
  bloodType: 'O+',
  address: '123 Main St, Anytown, ST 12345',
  emergencyName: 'Jane Doe',
  emergencyPhone: '+1 234 567 8901',
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

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genderOptions = ['Male', 'Female', 'Other'];

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState(mockPatientData);
  const [editedData, setEditedData] = useState(mockPatientData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(patientData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(patientData);
  };

  const handleSave = async () => {
    // Here you would make an API call to update the patient data
    console.log('Saving patient data:', editedData);
    setPatientData(editedData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/patients" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patient Information</CardTitle>
          {!isEditing ? (
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Name</Label>
              {isEditing ? (
                <Input
                  value={editedData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              ) : (
                <p>{patientData.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Age</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                />
              ) : (
                <p>{patientData.age}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
              {isEditing ? (
                <Select
                  value={editedData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p>{patientData.gender}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Blood Type</Label>
              {isEditing ? (
                <Select
                  value={editedData.bloodType}
                  onValueChange={(value) => handleChange('bloodType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p>{patientData.bloodType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
              {isEditing ? (
                <Input
                  value={editedData.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                />
              ) : (
                <p>{patientData.contact}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              ) : (
                <p>{patientData.email}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-muted-foreground">Address</Label>
              {isEditing ? (
                <Input
                  value={editedData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter full address"
                />
              ) : (
                <p>{patientData.address}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Emergency Contact Name</Label>
              {isEditing ? (
                <Input
                  value={editedData.emergencyName}
                  onChange={(e) => handleChange('emergencyName', e.target.value)}
                  placeholder="Emergency contact name"
                />
              ) : (
                <p>{patientData.emergencyName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Emergency Contact Phone</Label>
              {isEditing ? (
                <Input
                  value={editedData.emergencyPhone}
                  onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                  placeholder="Emergency contact phone"
                />
              ) : (
                <p>{patientData.emergencyPhone}</p>
              )}
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
                {patientData.medicalHistory.map((record, index) => (
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
                {patientData.upcomingAppointments.map((appointment, index) => (
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
                {patientData.prescriptions.map((prescription, index) => (
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