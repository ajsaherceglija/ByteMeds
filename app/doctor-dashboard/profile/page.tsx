'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditProfileModal } from './components/edit-profile-modal';
import { Database } from '@/types/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface DoctorProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  DOB: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  specialty: string | null;
  license_number: string | null;
  hospital: string | null;
  department: string | null;
  years_of_experience: number | null;
  education: string | null;
  available_for_appointments: boolean | null;
}

export default function DoctorProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        // Fetch doctor specific data
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (doctorError) throw doctorError;

        setProfile({
          ...userData,
          ...doctorData,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, supabase]);

  const handleProfileUpdate = (updatedProfile: DoctorProfile) => {
    setProfile(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button onClick={() => setIsModalOpen(true)}>Edit Profile</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{profile?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{profile?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{profile?.DOB || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{profile?.gender || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Specialty</p>
              <p className="font-medium">{profile?.specialty || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-medium">{profile?.license_number || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hospital</p>
              <p className="font-medium">{profile?.hospital || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{profile?.department || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Years of Experience</p>
              <p className="font-medium">{profile?.years_of_experience || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Education</p>
              <p className="font-medium">{profile?.education || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available for Appointments</p>
              <p className="font-medium">
                {profile?.available_for_appointments ? 'Yes' : 'No'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{profile?.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="font-medium">{profile?.city || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium">{profile?.country || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {profile && (
        <EditProfileModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
} 