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
import Link from 'next/link';

interface AnalysisResult {
  priority: 'Low' | 'Medium' | 'High';
  recommendedSpecialties: string[];
  description: string;
  immediateAttention: 'Required' | 'Not Required';
  riskFactors: string[];
  potentialConditions: string[];
  recommendedActions: string[];
  clinicalAssessment: {
    primarySymptoms: string[];
    associatedSymptoms: string[];
    duration: string;
    progression: string;
    aggravatingFactors: string[];
    relievingFactors: string[];
    redFlags: string[];
    vitalSigns?: {
      temperature?: string;
      bloodPressure?: string;
      heartRate?: string;
      respiratoryRate?: string;
      oxygenSaturation?: string;
    };
    severityScore?: number;
    painScale?: number;
  };
  differentialDiagnosis: {
    mostLikely: string[];
    alternatives: string[];
    toRuleOut: string[];
    probabilityScores?: { [key: string]: number };
    keyFindings?: string[];
  };
  requiredTests: string[];
  monitoringParameters: string[];
  patientEducation: string[];
  treatmentOptions?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    medications?: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      precautions: string[];
    }[];
  };
  followUpPlan?: {
    timeline: string;
    milestones: string[];
    warningSigns: string[];
    lifestyleModifications: string[];
  };
  emergencyProtocol?: {
    whenToSeekHelp: string[];
    emergencyContacts: string[];
    firstAidSteps: string[];
  };
  _fallback?: boolean;
  _message?: string;
  doctors: Array<{
    id: string;
    name: string;
    specialty: string;
    hospital: string;
    availability?: string;
    rating?: number;
    experience?: string;
    email: string;
  }>;
}

export default function AnalyzePage() {
  const { data: session, status } = useSession();
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

      if (specialtiesError) {
        console.error('Error fetching specialties:', specialtiesError);
        throw new Error('Failed to fetch available specialties');
      }

      if (!specialties || specialties.length === 0) {
        throw new Error('No specialties available in the system');
      }

      // Prepare the data for analysis
      const formData = new FormData();
      formData.append('symptoms', symptoms);
      if (image) {
        formData.append('image', image);
      }
      formData.append('specialties', JSON.stringify(specialties.map(d => d.specialty)));

      // Send to our API endpoint
      let response;
      try {
        response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
      } catch (fetchError: any) {
        console.error('Network error during analysis:', {
          error: fetchError,
          message: fetchError.message,
          stack: fetchError.stack
        });
        throw new Error('Network error while connecting to analysis service');
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        errorData = {};
      }

      if (!response.ok) {
        console.error('Analysis API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.status === 404) {
          throw new Error('The analysis service is currently unavailable. Please try again later.');
        } else if (response.status === 429) {
          throw new Error('The service is currently busy. Please try again in a few minutes.');
        } else if (response.status === 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          throw new Error(errorData.error || `Analysis failed (${response.status}). Please try again.`);
        }
      }

      if (!errorData || typeof errorData !== 'object') {
        console.error('Invalid response format:', errorData);
        throw new Error('Received invalid response from analysis service');
      }

      const analysisResult = errorData;

      // Fetch recommended doctors
      console.log('Starting doctors fetch...');
      
      try {
        // First, verify the specialties
        console.log('Recommended specialties:', analysisResult.recommendedSpecialties);
        
        if (!analysisResult.recommendedSpecialties || !Array.isArray(analysisResult.recommendedSpecialties)) {
          console.warn('Invalid specialties format:', analysisResult.recommendedSpecialties);
          analysisResult.recommendedSpecialties = ['General Medicine'];
        }

        // Try to fetch doctors with a simpler query first
        const { data: doctors, error: doctorsError } = await supabase
          .from('doctors')
          .select('id, specialty, hospital')
          .limit(5);

        console.log('Initial doctors query result:', { doctors, error: doctorsError });

        let processedDoctors = [];

        if (doctorsError) {
          console.warn('Error fetching doctors, using mock data:', doctorsError);
          // Use mock data as fallback
          processedDoctors = [
            {
              id: '1',
              name: 'Dr. John Smith',
              specialty: 'General Medicine',
              hospital: 'City General Hospital',
              experience: '15 years',
              rating: 4.8,
              availability: 'Next week',
              email: 'john.smith@hospital.com'
            },
            {
              id: '2',
              name: 'Dr. Sarah Johnson',
              specialty: 'Internal Medicine',
              hospital: 'Medical Center',
              experience: '12 years',
              rating: 4.7,
              availability: 'Tomorrow',
              email: 'sarah.johnson@hospital.com'
            },
            {
              id: '3',
              name: 'Dr. Michael Brown',
              specialty: 'Family Medicine',
              hospital: 'Community Hospital',
              experience: '10 years',
              rating: 4.6,
              availability: 'This week',
              email: 'michael.brown@hospital.com'
            }
          ];
        } else if (doctors && doctors.length > 0) {
          // If we got doctors, try to fetch their user data
          const doctorIds = doctors.map(d => d.id);
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', doctorIds);

          console.log('User data query result:', { userData, error: userError });

          if (userError) {
            console.warn('Error fetching user data:', userError);
            // Use the doctors data we have, with mock user data
            processedDoctors = doctors.map(d => ({
              id: d.id,
              name: `Dr. Doctor ${d.id}`,
              specialty: d.specialty || 'General Medicine',
              hospital: d.hospital || 'Not specified',
              experience: 'Not specified',
              rating: 4.5,
              availability: 'Not specified',
              email: 'doctor@hospital.com'
            }));
          } else {
            // Combine doctors and user data
            processedDoctors = doctors.map(d => {
              const user = userData?.find(u => u.id === d.id);
              return {
                id: d.id,
                name: user ? `Dr. ${user.name}` : `Dr. Doctor ${d.id}`,
                specialty: d.specialty || 'General Medicine',
                hospital: d.hospital || 'Not specified',
                experience: 'Not specified',
                rating: 4.5,
                availability: 'Not specified',
                email: user?.email || 'doctor@hospital.com'
              };
            });
          }
        } else {
          console.warn('No doctors found, using mock data');
          // Use mock data if no doctors found
          processedDoctors = [
            {
              id: '1',
              name: 'Dr. John Smith',
              specialty: 'General Medicine',
              hospital: 'City General Hospital',
              experience: '15 years',
              rating: 4.8,
              availability: 'Next week',
              email: 'john.smith@hospital.com'
            }
          ];
        }

        console.log('Final processed doctors:', processedDoctors);

        // Set the complete result with doctors
        setResult({
          ...analysisResult,
          doctors: processedDoctors,
          _message: doctorsError ? 'Using sample doctor data due to database connection issues' : undefined
        });

      } catch (doctorsError: any) {
        console.error('Error in doctors fetch:', {
          error: doctorsError,
          message: doctorsError.message,
          stack: doctorsError.stack
        });

        // Set result with mock doctors
        setResult({
          ...analysisResult,
          doctors: [
            {
              id: '1',
              name: 'Dr. John Smith',
              specialty: 'General Medicine',
              hospital: 'City General Hospital',
              experience: '15 years',
              rating: 4.8,
              availability: 'Next week',
              email: 'john.smith@hospital.com'
            }
          ],
          _message: 'Using sample doctor data due to technical issues'
        });

        toast.error('Unable to fetch real doctor data. Showing sample data instead.');
      }

    } catch (error: any) {
      console.error('Analysis error:', {
        error,
        message: error.message,
        stack: error.stack,
        details: error.details
      });
      
      // Show more specific error messages
      if (error.message.includes('Network error')) {
        toast.error('Unable to connect to the analysis service. Please check your internet connection.');
      } else if (error.message.includes('temporarily unavailable')) {
        toast.error('AI service is temporarily unavailable. Please try again later.');
      } else if (error.message.includes('configuration error')) {
        toast.error('Service configuration error. Please contact support.');
      } else if (error.message.includes('No specialties available')) {
        toast.error('No medical specialties available in the system. Please contact support.');
      } else if (error.message.includes('Database error')) {
        toast.error('Error accessing the database. Please try again later.');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error(`Failed to fetch data: ${error.message}`);
      } else if (error.message.includes('Invalid response')) {
        toast.error('Received invalid response from the analysis service. Please try again.');
      } else {
        toast.error(error.message || 'Failed to analyze symptoms. Please try again.');
      }
      
      // Reset the result state on error
      setResult(null);
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
            <CardTitle>Clinical Analysis Results</CardTitle>
            {result._fallback && (
              <CardDescription className="text-yellow-600">
                {result._message}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Priority Level</h3>
              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                  ${result.priority === 'High' ? 'bg-red-100 text-red-700' :
                    result.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'}`}>
                  {result.priority} Priority
                </div>
                {result.immediateAttention === 'Required' && (
                  <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-red-100 text-red-700">
                    Immediate Attention Required
                  </div>
                )}
              </div>
            </div>

            {result.clinicalAssessment && (
              <div className="space-y-2">
                <h3 className="font-semibold">Clinical Assessment</h3>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="space-y-4">
                    {result.clinicalAssessment.vitalSigns && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-3 bg-white rounded-lg shadow-sm">
                        {result.clinicalAssessment.vitalSigns.temperature && (
                          <div className="text-center">
                            <p className="text-sm font-medium">Temperature</p>
                            <p className="text-lg">{result.clinicalAssessment.vitalSigns.temperature}</p>
                          </div>
                        )}
                        {result.clinicalAssessment.vitalSigns.bloodPressure && (
                          <div className="text-center">
                            <p className="text-sm font-medium">Blood Pressure</p>
                            <p className="text-lg">{result.clinicalAssessment.vitalSigns.bloodPressure}</p>
                          </div>
                        )}
                        {result.clinicalAssessment.vitalSigns.heartRate && (
                          <div className="text-center">
                            <p className="text-sm font-medium">Heart Rate</p>
                            <p className="text-lg">{result.clinicalAssessment.vitalSigns.heartRate}</p>
                          </div>
                        )}
                        {result.clinicalAssessment.vitalSigns.respiratoryRate && (
                          <div className="text-center">
                            <p className="text-sm font-medium">Respiratory Rate</p>
                            <p className="text-lg">{result.clinicalAssessment.vitalSigns.respiratoryRate}</p>
                          </div>
                        )}
                        {result.clinicalAssessment.vitalSigns.oxygenSaturation && (
                          <div className="text-center">
                            <p className="text-sm font-medium">O₂ Saturation</p>
                            <p className="text-lg">{result.clinicalAssessment.vitalSigns.oxygenSaturation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(result.clinicalAssessment.severityScore || result.clinicalAssessment.painScale) && (
                      <div className="grid grid-cols-2 gap-4">
                        {result.clinicalAssessment.severityScore && (
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <h4 className="font-medium mb-2">Severity Score</h4>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full bg-blue-600" 
                                  style={{ width: `${result.clinicalAssessment.severityScore * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{result.clinicalAssessment.severityScore}/10</span>
                            </div>
                          </div>
                        )}
                        {result.clinicalAssessment.painScale && (
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <h4 className="font-medium mb-2">Pain Scale</h4>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full bg-red-600" 
                                  style={{ width: `${result.clinicalAssessment.painScale * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{result.clinicalAssessment.painScale}/10</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {result.clinicalAssessment.primarySymptoms?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Primary Symptoms</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.clinicalAssessment.primarySymptoms.map((symptom, index) => (
                            <li key={index} className="text-sm">{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.clinicalAssessment.associatedSymptoms?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Associated Symptoms</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.clinicalAssessment.associatedSymptoms.map((symptom, index) => (
                            <li key={index} className="text-sm">{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(result.clinicalAssessment.duration || result.clinicalAssessment.progression) && (
                      <div>
                        <h4 className="font-medium mb-2">Duration & Progression</h4>
                        {result.clinicalAssessment.duration && (
                          <p className="text-sm">Duration: {result.clinicalAssessment.duration}</p>
                        )}
                        {result.clinicalAssessment.progression && (
                          <p className="text-sm">Progression: {result.clinicalAssessment.progression}</p>
                        )}
                      </div>
                    )}
                    {result.clinicalAssessment.redFlags?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Red Flags</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.clinicalAssessment.redFlags.map((flag, index) => (
                            <li key={index} className="text-sm text-red-600">{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.differentialDiagnosis && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Differential Diagnosis</h3>
                  <div className="rounded-lg border p-4">
                    <div className="space-y-4">
                      {result.differentialDiagnosis.mostLikely?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Most Likely</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {result.differentialDiagnosis.mostLikely.map((diagnosis, index) => (
                              <li key={index} className="text-sm">
                                {diagnosis}
                                {result.differentialDiagnosis.probabilityScores?.[diagnosis] && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({result.differentialDiagnosis.probabilityScores[diagnosis]}% probability)
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.differentialDiagnosis.keyFindings && result.differentialDiagnosis.keyFindings.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Clinical Findings</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {result.differentialDiagnosis.keyFindings.map((finding, index) => (
                              <li key={index} className="text-sm">{finding}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.differentialDiagnosis.alternatives?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Alternatives</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {result.differentialDiagnosis.alternatives.map((diagnosis, index) => (
                              <li key={index} className="text-sm">{diagnosis}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.differentialDiagnosis.toRuleOut?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">To Rule Out</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {result.differentialDiagnosis.toRuleOut.map((condition, index) => (
                              <li key={index} className="text-sm">{condition}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Required Tests & Monitoring</h3>
                  <div className="rounded-lg border p-4">
                    <div className="space-y-4">
                      {result.requiredTests?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Required Tests</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {result.requiredTests.map((test, index) => (
                              <li key={index} className="text-sm">{test}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.monitoringParameters?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Monitoring Parameters</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {result.monitoringParameters.map((param, index) => (
                              <li key={index} className="text-sm">{param}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result.treatmentOptions && (
              <div className="space-y-2">
                <h3 className="font-semibold">Treatment Options</h3>
                <div className="rounded-lg border p-4">
                  <div className="space-y-4">
                    {result.treatmentOptions.immediate?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Immediate Actions</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.treatmentOptions.immediate.map((action, index) => (
                            <li key={index} className="text-sm">{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.treatmentOptions.medications && result.treatmentOptions.medications.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommended Medications</h4>
                        <div className="space-y-3">
                          {result.treatmentOptions.medications.map((med, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                              <h5 className="font-medium">{med.name}</h5>
                              <div className="mt-2 space-y-1 text-sm">
                                <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                                <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                                <p><span className="font-medium">Duration:</span> {med.duration}</p>
                                {med.precautions && med.precautions.length > 0 && (
                                  <div>
                                    <p className="font-medium">Precautions:</p>
                                    <ul className="list-disc list-inside">
                                      {med.precautions.map((precaution, idx) => (
                                        <li key={idx}>{precaution}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.followUpPlan && (
              <div className="space-y-2">
                <h3 className="font-semibold">Follow-up Plan</h3>
                <div className="rounded-lg border p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Timeline</h4>
                      <p className="text-sm">{result.followUpPlan.timeline}</p>
                    </div>
                    {result.followUpPlan.milestones?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Milestones</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.followUpPlan.milestones.map((milestone, index) => (
                            <li key={index} className="text-sm">{milestone}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.followUpPlan.lifestyleModifications?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Lifestyle Modifications</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.followUpPlan.lifestyleModifications.map((mod, index) => (
                            <li key={index} className="text-sm">{mod}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.emergencyProtocol && (
              <div className="space-y-2">
                <h3 className="font-semibold">Emergency Protocol</h3>
                <div className="rounded-lg border p-4 bg-red-50">
                  <div className="space-y-4">
                    {result.emergencyProtocol.whenToSeekHelp?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">When to Seek Help</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.emergencyProtocol.whenToSeekHelp.map((item, index) => (
                            <li key={index} className="text-sm text-red-600">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.emergencyProtocol.firstAidSteps?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">First Aid Steps</h4>
                        <ol className="list-decimal list-inside space-y-1">
                          {result.emergencyProtocol.firstAidSteps.map((step, index) => (
                            <li key={index} className="text-sm">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.doctors?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Recommended Specialists</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.doctors.length} specialists available
                  </p>
                </div>
                <div className="grid gap-4">
                  {result.doctors.map((doctor) => (
                    <div key={doctor.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium text-lg">{doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}</h4>
                            <p className="text-sm font-medium text-primary">{doctor.specialty}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
                            </div>
                            
                            {doctor.experience && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-muted-foreground">Experience: {doctor.experience}</p>
                              </div>
                            )}
                            
                            {doctor.rating && doctor.rating > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(doctor.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                  <span className="ml-1 text-sm font-medium">{(doctor.rating || 0).toFixed(1)}</span>
                                </div>
                              </div>
                            )}
                            
                            {doctor.availability && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-muted-foreground">
                                  Next Available: {doctor.availability}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/dashboard/appointments/new?doctor=${doctor.id}`}>
                              Book Appointment
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 