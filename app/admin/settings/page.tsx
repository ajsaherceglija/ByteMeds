'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/layout/admin-layout';
import { toast } from 'sonner';

interface SystemSettings {
  registration: {
    enabled: boolean;
  };
  appointments: {
    enabled: boolean;
    default_duration: number;
    max_daily: number;
  };
  notifications: {
    enabled: boolean;
  };
  maintenance: {
    enabled: boolean;
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings>({
    registration: { enabled: true },
    appointments: {
      enabled: true,
      default_duration: 30,
      max_daily: 8,
    },
    notifications: { enabled: true },
    maintenance: { enabled: false },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();

      if (data) {
        setSettings({
          registration: data.registration || settings.registration,
          appointments: data.appointments || settings.appointments,
          notifications: data.notifications || settings.notifications,
          maintenance: data.maintenance || settings.maintenance,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    try {
      setIsLoading(true);

      console.log('Updating setting:', { key, value });

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Setting update failed:', data);
        throw new Error(data.error || 'Failed to update setting');
      }

      // Update the local state with the returned setting value
      if (data.setting) {
        setSettings(prev => ({
          ...prev,
          [data.setting.key]: data.setting.value,
        }));
      } else {
        // Fallback to the value we tried to set
        setSettings(prev => ({
          ...prev,
          [key]: value,
        }));
      }

      toast.success(data.message || 'Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update setting');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.is_admin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure global system settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Registration Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Registration</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to create accounts
                  </p>
                </div>
                <Switch
                  checked={settings.registration.enabled}
                  onCheckedChange={(checked) =>
                    updateSetting('registration', { enabled: checked })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Appointment Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Appointments</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Appointments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to book appointments
                    </p>
                  </div>
                  <Switch
                    checked={settings.appointments.enabled}
                    onCheckedChange={(checked) =>
                      updateSetting('appointments', {
                        ...settings.appointments,
                        enabled: checked,
                      })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Default Appointment Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.appointments.default_duration}
                    onChange={(e) =>
                      updateSetting('appointments', {
                        ...settings.appointments,
                        default_duration: parseInt(e.target.value),
                      })
                    }
                    min={15}
                    max={120}
                    step={15}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Maximum Daily Appointments</Label>
                  <Input
                    type="number"
                    value={settings.appointments.max_daily}
                    onChange={(e) =>
                      updateSetting('appointments', {
                        ...settings.appointments,
                        max_daily: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    max={24}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notifications</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.enabled}
                  onCheckedChange={(checked) =>
                    updateSetting('notifications', { enabled: checked })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Maintenance</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance.enabled}
                  onCheckedChange={(checked) =>
                    updateSetting('maintenance', { enabled: checked })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 