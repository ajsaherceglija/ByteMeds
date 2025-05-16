'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminLayout } from '@/components/layout/admin-layout';
import { createClient } from '@/app/utils/supabase/client';
import { Search, Edit, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

type Doctor = Database['public']['Tables']['doctors']['Row'] & {
  users: Database['public']['Tables']['users']['Row'];
};

export default function DoctorsPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          users (*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setDoctors(data || []);
      setFilteredDoctors(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = doctors.filter(doctor =>
      doctor.users.name.toLowerCase().includes(query.toLowerCase()) ||
      doctor.users.email.toLowerCase().includes(query.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(query.toLowerCase()) ||
      doctor.hospital?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  const updateDoctorInfo = async (doctorId: string, updates: Partial<Doctor>) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', doctorId);

      if (error) throw error;

      toast.success('Doctor information updated successfully');
      fetchDoctors();
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to update doctor information');
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>
            View and manage doctor profiles and credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>License Number</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading doctors...
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>{doctor.users.name}</TableCell>
                      <TableCell>{doctor.users.email}</TableCell>
                      <TableCell>{doctor.specialty || 'Not specified'}</TableCell>
                      <TableCell>{doctor.hospital || 'Not specified'}</TableCell>
                      <TableCell>{doctor.license_number || 'Not specified'}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            doctor.available_for_appointments
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {doctor.available_for_appointments ? 'Available' : 'Unavailable'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateDoctorInfo(doctor.id, {
                            available_for_appointments: !doctor.available_for_appointments
                          })}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Toggle Availability
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 