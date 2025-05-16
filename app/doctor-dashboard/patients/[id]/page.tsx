'use client';

import { useState, useEffect } from 'react';
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
import { Pencil, X, Check, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { Switch } from "@/components/ui/switch";
import { getPatientDetails, PatientDetail, updatePatientStatus, savePatientParameters, updatePatientDetails } from './actions';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genderOptions = ['Male', 'Female', 'Other'];

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState<PatientDetail | null>(null);
  const [editedData, setEditedData] = useState<PatientDetail | null>(null);
  const [isAddingParameters, setIsAddingParameters] = useState(false);
  const [newParameters, setNewParameters] = useState({
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    heartRate: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatientData() {
      try {
        setIsLoading(true);
        const data = await getPatientDetails(patientId as string);
        setPatientData(data);
        setEditedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patient data');
      } finally {
        setIsLoading(false);
      }
    }

    loadPatientData();
  }, [patientId]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(patientData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(patientData);
  };

  const handleSave = async () => {
    if (!editedData) return;
    try {
      await updatePatientDetails(patientId as string, {
        name: editedData.name,
        age: editedData.age,
        gender: editedData.gender,
        contact: editedData.contact,
        address: editedData.address,
        bloodType: editedData.bloodType,
        emergencyName: editedData.emergencyName,
        emergencyPhone: editedData.emergencyPhone,
        status: editedData.isActive ? 'active' : 'inactive',
      });
      // Refresh patient data from backend
      const updated = await getPatientDetails(patientId as string);
      setPatientData(updated);
      setEditedData(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update patient: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleChange = (field: string, value: string | number) => {
    if (!editedData) return;
    setEditedData(prev => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleParameterChange = (field: string, value: string) => {
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewParameters(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSaveParameters = async () => {
    try {
      await savePatientParameters(patientId as string, newParameters);
      
      // Refresh patient data to show new parameters
      const updatedData = await getPatientDetails(patientId as string);
      setPatientData(updatedData);
      
      // Reset form
      setIsAddingParameters(false);
      setNewParameters({
        weight: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        bloodSugar: '',
        heartRate: '',
      });
    } catch (error) {
      console.error('Error saving parameters:', error);
    }
  };

  const handleActiveStatusChange = async (checked: boolean) => {
    try {
      await updatePatientStatus(patientId as string, checked);
      
      // Update local state
      setPatientData(prev => prev ? {
        ...prev,
        isActive: checked,
      } : null);
    } catch (error) {
      console.error('Error updating patient status:', error);
      // Revert the switch if there was an error
      setPatientData(prev => prev ? {
        ...prev,
        isActive: !checked,
      } : null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!patientData) {
    return <div>Patient not found</div>;
  }

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
          <div className="space-y-1">
            <CardTitle>Patient Information</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Switch
                checked={patientData.isActive}
                onCheckedChange={handleActiveStatusChange}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm font-medium">
                {patientData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
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
                  value={editedData?.name}
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
                  value={editedData?.age}
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
                  value={editedData?.gender}
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
                  value={editedData?.bloodType}
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
                  value={editedData?.contact}
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
                  value={editedData?.email}
                  readOnly
                  disabled
                />
              ) : (
                <p>{patientData.email}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-muted-foreground">Address</Label>
              {isEditing ? (
                <Input
                  value={editedData?.address}
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
                  value={editedData?.emergencyName}
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
                  value={editedData?.emergencyPhone}
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patient Parameters</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddingParameters(!isAddingParameters)}
          >
            {isAddingParameters ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Parameters */}
            <div className="space-y-4">
              <h3 className="font-medium">Current Readings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                  <p>{patientData.parameters.current.weight}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Blood Pressure</Label>
                  <p>{patientData.parameters.current.bloodPressure}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Blood Sugar</Label>
                  <p>{patientData.parameters.current.bloodSugar}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Heart Rate</Label>
                  <p>{patientData.parameters.current.heartRate}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated: {patientData.parameters.current.lastUpdated}
              </p>
            </div>

            {/* Add New Parameters Form */}
            {isAddingParameters && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Add New Readings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g., 70"
                      value={newParameters.weight}
                      onChange={(e) => handleParameterChange('weight', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Pressure (mmHg)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Systolic"
                        value={newParameters.bloodPressureSystolic}
                        onChange={(e) => handleParameterChange('bloodPressureSystolic', e.target.value)}
                      />
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Diastolic"
                        value={newParameters.bloodPressureDiastolic}
                        onChange={(e) => handleParameterChange('bloodPressureDiastolic', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Sugar (mg/dL)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g., 100"
                      value={newParameters.bloodSugar}
                      onChange={(e) => handleParameterChange('bloodSugar', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heart Rate (bpm)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g., 72"
                      value={newParameters.heartRate}
                      onChange={(e) => handleParameterChange('heartRate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingParameters(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveParameters}>Save Readings</Button>
                </div>
              </div>
            )}

            {/* Parameters History */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">History</h3>
              <div className="space-y-4">
                {patientData.parameters.history.map((record, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="mb-2 font-medium">{record.date}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Weight: </span>
                        {record.weight}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blood Pressure: </span>
                        {record.bloodPressure}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blood Sugar: </span>
                        {record.bloodSugar}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Heart Rate: </span>
                        {record.heartRate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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