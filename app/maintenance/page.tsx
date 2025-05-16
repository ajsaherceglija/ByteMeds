'use client';

import { Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <Settings className="h-24 w-24 text-primary animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter">
          System Maintenance
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          We're currently performing system maintenance to improve your experience.
          Please check back later.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.refresh()}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Check Status
          </Button>
        </div>
      </div>
    </div>
  );
} 