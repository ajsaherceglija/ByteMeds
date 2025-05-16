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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisResult = await response.json();
      
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

      // Set the complete result with doctors
      setResult({
        ...analysisResult,
        doctors: doctors.map(d => ({
          id: d.id,
          name: d.users[0].name,
          specialty: d.specialty || '',
          hospital: d.hospital || '',
        })) || [],
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      
      // Show more specific error messages
      if (error.message.includes('temporarily unavailable')) {
        toast.error('AI service is temporarily unavailable. Please try again later.');
      } else if (error.message.includes('configuration error')) {
        toast.error('Service configuration error. Please contact support.');
      } else {
        toast.error(error.message || 'Failed to analyze symptoms. Please try again.');
      }
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
              <div className="space-y-2">
                <h3 className="font-semibold">Recommended Specialists</h3>
                <div className="grid gap-4">
                  {result.doctors.map((doctor) => (
                    <div key={doctor.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Dr. {doctor.name}</h4>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
                          {doctor.experience && (
                            <p className="text-sm text-muted-foreground">Experience: {doctor.experience}</p>
                          )}
                          {doctor.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-sm font-medium">{doctor.rating}/5</span>
                              <div className="flex">
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
                              </div>
                            </div>
                          )}
                          {doctor.availability && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Next Available: {doctor.availability}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/appointments/new?doctor=${doctor.id}`}>
                            Book Appointment
                          </Link>
                        </Button>
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