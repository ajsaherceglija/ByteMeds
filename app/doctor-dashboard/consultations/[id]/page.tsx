'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Stethoscope, User, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getConsultationDetails, ConsultationDetails, updateConsultation, UpdateConsultationData } from '../actions';
import { useToast } from "@/components/ui/use-toast";

export default function ConsultationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const consultationId = params.id as string;
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateConsultationData>({
    type: '',
    duration: 30,
    notes: '',
    is_active: true
  });

  useEffect(() => {
    async function loadConsultation() {
      try {
        const data = await getConsultationDetails(consultationId);
        setConsultation(data);
        if (data) {
          setUpdateData({
            type: data.type,
            duration: data.duration,
            notes: data.notes || '',
            is_active: data.status === 'scheduled'
          });
        }
      } catch (err) {
        setError('Failed to load consultation details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadConsultation();
  }, [consultationId]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await updateConsultation(consultationId, updateData);
      toast({
        title: "Success",
        description: "Consultation updated successfully",
      });
      // Refresh the consultation data
      const updatedData = await getConsultationDetails(consultationId);
      setConsultation(updatedData);
      // Close the dialog
      setIsDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update consultation",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/consultations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Consultations
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load the consultation details.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/consultations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Consultations
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'The requested consultation could not be found.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/consultations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Consultations
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consultation Details</h1>
        <p className="text-muted-foreground">
          Viewing consultation information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consultation Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{consultation.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(consultation.date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(consultation.date), 'p')} ({consultation.duration} mins)</span>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  consultation.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {consultation.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Symptoms</p>
              <p className="text-sm text-muted-foreground">{consultation.symptoms || 'No symptoms recorded'}</p>
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
              <span className="font-medium">{consultation.patientName}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Age</p>
              <p className="text-sm text-muted-foreground">
                {consultation.patientDetails.age ? `${consultation.patientDetails.age} years` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {consultation.patientDetails.contact || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {consultation.patientDetails.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(consultation.vitalSigns).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm text-muted-foreground">{value || 'Not recorded'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Clinical Notes</p>
              <p className="text-sm text-muted-foreground">{consultation.notes || 'No notes recorded'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Recommendations</p>
              <p className="text-sm text-muted-foreground">{consultation.recommendations || 'No recommendations recorded'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Update Consultation</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Consultation</DialogTitle>
            <DialogDescription>
              Make changes to the consultation details here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={updateData.type}
                onValueChange={(value) => setUpdateData({ ...updateData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Consultation">Initial Consultation</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Routine Check">Routine Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input
                id="duration"
                type="number"
                value={updateData.duration}
                onChange={(e) => setUpdateData({ ...updateData, duration: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={updateData.is_active}
                  onCheckedChange={(checked) => setUpdateData({ ...updateData, is_active: checked })}
                />
                <Label htmlFor="status">
                  {updateData.is_active ? 'Scheduled' : 'Completed'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 