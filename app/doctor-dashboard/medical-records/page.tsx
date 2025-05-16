'use client';

import { useState, useEffect } from 'react';
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
import { useSession } from 'next-auth/react';
import { createClient } from '@/app/utils/supabase/client';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'] & {
  patient_name?: string;
};

export default function MedicalRecordsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [patientStatus, setPatientStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  console.log('Session status:', status);
  console.log('Session data:', session);

  // Initialize Supabase client on the client side only
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch medical records
  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!session?.user?.id || !supabase) {
        return;
      }

      try {
        console.log('Fetching medical records for doctor:', session.user.id);
        const { data: medicalRecords, error } = await supabase
          .from('medical_records')
          .select(`
            *,
            patients!medical_records_patient_id_fkey (
              users!patients_id_fkey (
                name
              )
            )
          `)
          .eq('doctor_id', session.user.id);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Fetched records:', medicalRecords);

        const transformedRecords = medicalRecords.map(record => ({
          ...record,
          patient_name: record.patients?.users?.name || 'Unknown Patient'
        }));

        console.log('Transformed records:', transformedRecords);
        setRecords(transformedRecords);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [session, supabase]);

  // Show loading state while session is loading
  if (status === 'loading' || !supabase) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If no session and not loading, don't render anything
  if (!session?.user?.id) {
    return null;
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.patient_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (record.record_type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (record.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      patientStatus === 'all' || 
      (patientStatus === 'active' && record.is_active) ||
      (patientStatus === 'inactive' && !record.is_active);

    return matchesSearch && matchesStatus;
  });

  // Add debug log for filtered records
  console.log('Filtered records:', filteredRecords);

  return (
    <div className="space-y-6" suppressHydrationWarning>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading records...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{record.patient_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{record.record_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(record.created_at), 'PPP')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          record.order_requested
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {record.order_requested ? 'Pending' : 'Completed'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          record.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {record.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/doctor-dashboard/medical-records/${record.id}`}>
                          Update Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 