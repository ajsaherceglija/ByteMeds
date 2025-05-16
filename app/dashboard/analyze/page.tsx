'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@/app/utils/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  priority: 'Low' | 'Medium' | 'High';
  recommendedSpecialties: string[];
  description: string;
  doctors: Array<{
    id: string;
    name: string;
    specialty: string;
    hospital: string;
  }>;
}

export default function AnalyzePage() {
  const { data: session } = useSession();
  const [symptoms, setSymptoms] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }

    setIsAnalyzing(true);
    try {
      // First, get all doctor specialties
      const { data: specialties, error: specialtiesError } = await supabase
        .from('doctors')
        .select('specialty')
        .not('specialty', 'is', null);

      if (specialtiesError) throw specialtiesError;

      // Prepare the data for analysis
      const formData = new FormData();
      formData.append('symptoms', symptoms);
      if (image) {
        formData.append('image', image);
      }
      formData.append('specialties', JSON.stringify(specialties.map(d => d.specialty)));

      // Send to our API endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysisResult = await response.json();
      setResult(analysisResult);

      // Fetch recommended doctors
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          id,
          specialty,
          hospital,
          users!inner (
            name
          )
        `)
        .in('specialty', analysisResult.recommendedSpecialties)
        .limit(3);

      if (doctorsError) throw doctorsError;

      setResult(prev => ({
        ...prev!,
        doctors: doctors.map(d => ({
          id: d.id,
          name: d.users[0].name,
          specialty: d.specialty || '',
          hospital: d.hospital || '',
        })),
      }));

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Symptom Analysis</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Symptoms</CardTitle>
          <CardDescription>
            Enter your symptoms and upload any relevant images for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms Description</Label>
            <Textarea
              id="symptoms"
              placeholder="Describe your symptoms in detail..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Upload Image (Optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Symptoms'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Priority Level</h3>
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                ${result.priority === 'High' ? 'bg-red-100 text-red-700' :
                  result.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'}`}>
                {result.priority} Priority
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Analysis</h3>
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm whitespace-pre-wrap">{result.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Recommended Doctors</h3>
              <div className="grid gap-4">
                {result.doctors.map((doctor) => (
                  <div key={doctor.id} className="rounded-lg border p-4">
                    <h4 className="font-medium">Dr. {doctor.name}</h4>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 