'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface AnalysisResult {
  priority: string;
  description: string;
  clinicalAssessment: {
    primarySymptoms: string[];
    associatedSymptoms: string[];
    duration: string;
    progression: string;
    aggravatingFactors: string[];
    relievingFactors: string[];
    redFlags: Array<{
      sign: string;
      clinicalCriteria: string;
      timeSensitivity: string;
      requiredAction: string;
      rationale: string;
      potentialComplications: string[];
      monitoringFrequency: string;
      escalationCriteria: string;
    }>;
    clinicalFeatures: string[];
    physicalExam: {
      general: string[];
      cardiovascular: string[];
      respiratory: string[];
      gastrointestinal: string[];
      neurological: string[];
      musculoskeletal: string[];
      other: string[];
    };
    functionalStatus: string;
    vitalSigns: {
      temperature: string;
      bloodPressure: string;
      heartRate: string;
      respiratoryRate: string;
      oxygenSaturation: string;
    };
    severityScore: number;
    painScale: number;
  };
  differentialDiagnosis: {
    mostLikely: Array<{
      condition: string;
      probability: string;
      probabilityPercentage: number;
      supportingFeatures: string[];
      contraFeatures: string[];
      requiredTests: Array<{
        name: string;
        expectedResult: string;
        urgency: string;
        rationale: string;
        timing: string;
        interpretation: string;
      }>;
      clinicalGuidelines: string[];
      scoringSystems: Array<{
        name: string;
        score: number;
        interpretation: string;
        reference: string;
        clinicalImplications: string;
      }>;
      riskFactors: string[];
      complications: string[];
    }>;
    alternatives: Array<{
      condition: string;
      probability: string;
      probabilityPercentage: number;
      supportingFeatures: string[];
      contraFeatures: string[];
      requiredTests: Array<{
        name: string;
        expectedResult: string;
        urgency: string;
        rationale: string;
        timing: string;
        interpretation: string;
      }>;
      clinicalGuidelines: string[];
      scoringSystems: Array<{
        name: string;
        score: number;
        interpretation: string;
        reference: string;
        clinicalImplications: string;
      }>;
      riskFactors: string[];
      complications: string[];
    }>;
    toRuleOut: Array<{
      condition: string;
      rationale: string;
      requiredTests: Array<{
        name: string;
        expectedResult: string;
        urgency: string;
        rationale: string;
      }>;
      redFlags: string[];
    }>;
  };
  treatmentPlanSuggestions: {
    immediate: Array<{
      suggestedAction: string;
      rationale: string;
      suggestedTiming: string;
      suggestedMedications: Array<{
        name: string;
        suggestedDosage: string;
        suggestedFrequency: string;
        suggestedDuration: string;
        suggestedRoute: string;
        monitoring: string[];
        expectedOutcome: string;
        potentialComplications: string[];
        suggestedContraindications: string[];
        suggestedInteractions: string[];
      }>;
      suggestedProcedures: Array<{
        name: string;
        suggestedTiming: string;
        rationale: string;
        suggestedPrecautions: string[];
      }>;
      suggestedMonitoring: {
        parameters: string[];
        suggestedFrequency: string;
        suggestedThresholds: {
          normal: string;
          warning: string;
          critical: string;
        };
      };
    }>;
    shortTerm: Array<{
      suggestedAction: string;
      rationale: string;
      suggestedTiming: string;
      suggestedMedications: Array<{
        name: string;
        suggestedDosage: string;
        suggestedFrequency: string;
        suggestedDuration: string;
        suggestedRoute: string;
        monitoring: string[];
        expectedOutcome: string;
        potentialComplications: string[];
      }>;
    }>;
    longTerm: Array<{
      suggestedAction: string;
      rationale: string;
      suggestedTiming: string;
      suggestedMedications: Array<{
        name: string;
        suggestedDosage: string;
        suggestedFrequency: string;
        suggestedDuration: string;
        suggestedRoute: string;
        monitoring: string[];
        expectedOutcome: string;
        potentialComplications: string[];
      }>;
    }>;
  };
  monitoringParameters: Array<{
    parameter: string;
    frequency: string;
    normalRange: string;
    actionThreshold: string;
    method: string;
    rationale: string;
    actions: {
      mild: {
        threshold: string;
        action: string;
        rationale: string;
      };
      moderate: {
        threshold: string;
        action: string;
        rationale: string;
      };
      severe: {
        threshold: string;
        action: string;
        rationale: string;
      };
    };
    documentation: {
      format: string;
      frequency: string;
      review: string;
    };
  }>;
  patientEducation: Array<{
    topic: string;
    keyPoints: string[];
    warningSigns: Array<{
      description: string;
      threshold: string;
      action: string;
      rationale: string;
      urgency: string;
    }>;
    selfCare: Array<{
      instruction: string;
      frequency: string;
      rationale: string;
      technique: string;
      precautions: string[];
      expectedOutcome: string;
      whenToStop: string;
    }>;
    lifestyleModifications: Array<{
      modification: string;
      target: string;
      rationale: string;
      resources: string[];
      timeline: string;
      successCriteria: string;
    }>;
    followUp: {
      timing: string;
      purpose: string;
      requiredTests: string[];
      warningSigns: string[];
      successCriteria: string;
      adjustmentCriteria: string;
    };
  }>;
  impactAssessment?: {
    activitiesOfDailyLiving?: {
      functionalImpact?: string[];
      assistanceRequired?: string[];
      duration: string;
    };
    qualityOfLife?: {
      physicalImpact?: string[];
      emotionalImpact?: string[];
      socialImpact?: string[];
    };
    workSchoolImpact?: {
      functionalLimitations?: string[];
      requiredAccommodations?: string[];
      expectedDuration: string;
    };
    psychologicalImpact?: {
      emotionalEffects?: string[];
      copingMechanisms?: string[];
      supportNeeds?: string[];
    };
  };
  emergencyProtocol?: {
    whenToSeekHelp?: string[];
    emergencyContacts?: string[];
    firstAidSteps?: string[];
  };
  followUpPlan?: {
    timeline: string;
    duration: string;
    frequency: string;
    milestones?: string[];
    warningSigns?: string[];
    lifestyleModifications?: string[];
  };
}

interface VisualElements {
  severity: 'default' | 'secondary' | 'destructive' | 'outline';
  confidence: 'default' | 'secondary' | 'destructive' | 'outline';
  relevance: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface KeyDifference {
  type: 'current' | 'historical';
  description: string;
  color: string;
  icon: string;
  clinicalImpact?: {
    severity: 'default' | 'secondary' | 'destructive' | 'outline';
    urgency: 'immediate' | 'urgent' | 'routine';
    monitoring: string[];
  };
}

interface Insight {
  type: string;
  content: string;
  clinicalContext: string;
  color: string;
  icon: string;
}

interface TreatmentRecommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  color: string;
  icon: string;
  clinicalRationale: string;
  parameters: string[];
}

interface SimilarCase {
  id: string;
  patientName: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatmentOutcome: string;
  similarityScore: number;
  keyDifferences: Array<{
    type: 'current' | 'historical';
    description: string;
    clinicalImpact?: {
      severity: 'high' | 'medium' | 'low';
      urgency: 'immediate' | 'urgent' | 'routine';
      monitoring: string[];
    };
  }>;
  insights: Array<{
    type: string;
    content: string;
    clinicalContext: string;
    color: string;
    icon: string;
  }>;
  treatmentRecommendations: {
    immediate: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      color: string;
      icon: string;
      clinicalRationale: string;
      parameters: string[];
    }>;
    shortTerm: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      color: string;
      icon: string;
      clinicalRationale: string;
      parameters: string[];
    }>;
    longTerm: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      color: string;
      icon: string;
      clinicalRationale: string;
      parameters: string[];
    }>;
  };
  visualElements: {
    severity: 'default' | 'secondary' | 'destructive' | 'outline';
    confidence: 'default' | 'secondary' | 'destructive' | 'outline';
    relevance: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

export default function AnalyzePage() {
  const { data: session } = useSession();
  const [symptoms, setSymptoms] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const findSimilarCases = async (symptoms: string) => {
    if (!symptoms.trim() || !session?.user?.id) return;

    setIsLoadingSimilar(true);
    try {
      const formData = new FormData();
      formData.append('currentSymptoms', symptoms);
      formData.append('doctorId', session.user.id);

      const response = await fetch('/api/doctor/analyze/similarity', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to find similar cases');
      }

      const data = await response.json();
      setSimilarCases(data);
    } catch (error) {
      console.error('Error finding similar cases:', error);
      toast.error('Failed to find similar cases');
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error('Please enter patient symptoms');
      return;
    }

    if (!session?.user?.id) {
      toast.error('Please sign in to analyze symptoms');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('symptoms', symptoms);
      if (image) {
        formData.append('image', image);
      }
      formData.append('doctorId', session.user.id);
      formData.append('patientId', session.user.id); // For now, using doctor's ID as patient ID

      const response = await fetch('/api/doctor/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);

      // After successful analysis, find similar cases
      await findSimilarCases(symptoms);

      toast.success('Analysis completed successfully');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze symptoms');
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add a function to check if a section has actual data
  const hasActualData = (data: any): boolean => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') {
      return Object.values(data).some(value => hasActualData(value));
    }
    return typeof data === 'string' && data.trim() !== '';
  };

  // Add a function to render section content with data validation
  const renderSectionContent = (content: any, fallback: string = 'No data available') => {
    if (!hasActualData(content)) {
      return <p className="text-muted-foreground">{fallback}</p>;
    }

    // Handle differential diagnosis specifically
    if (content.mostLikely || content.alternatives || content.toRuleOut) {
      return (
        <div className="space-y-4">
          {content.mostLikely && content.mostLikely.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Most Likely Diagnoses</h4>
              <ul className="list-disc pl-4">
                {content.mostLikely.map((diagnosis: any, index: number) => (
                  <li key={index}>
                    {typeof diagnosis === 'string' ? diagnosis : diagnosis.condition}
                    {diagnosis.probability && ` (${diagnosis.probability})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {content.alternatives && content.alternatives.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Alternative Diagnoses</h4>
              <ul className="list-disc pl-4">
                {content.alternatives.map((diagnosis: any, index: number) => (
                  <li key={index}>
                    {typeof diagnosis === 'string' ? diagnosis : diagnosis.condition}
                    {diagnosis.probability && ` (${diagnosis.probability})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {content.toRuleOut && content.toRuleOut.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Conditions to Rule Out</h4>
              <ul className="list-disc pl-4">
                {content.toRuleOut.map((condition: any, index: number) => (
                  <li key={index}>
                    {typeof condition === 'string' ? condition : condition.condition}
                    {condition.rationale && ` - ${condition.rationale}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // Handle arrays
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc pl-4">
          {content.map((item, index) => (
            <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      );
    }

    // Handle objects
    if (typeof content === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(content).map(([key, value]) => (
            <div key={key}>
              <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
              {renderSectionContent(value)}
            </div>
          ))}
        </div>
      );
    }

    // Handle strings
    return <p>{content}</p>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Analysis</h1>
        <p className="text-muted-foreground">
          Analyze patient symptoms and find similar cases
        </p>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="similar">Similar Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Symptoms</CardTitle>
              <CardDescription>
                Enter patient symptoms and upload any relevant images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms Description</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe the patient's symptoms in detail..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
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
                <CardTitle>Clinical Analysis</CardTitle>
                <CardDescription>
                  Detailed medical analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Priority and Urgency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Priority Level</h3>
                    <Badge variant={result.priority === 'High' ? 'destructive' : result.priority === 'Medium' ? 'secondary' : 'default'}>
                      {result.priority || 'Not Specified'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.description}
                  </p>
                </div>

                {/* Clinical Assessment */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Clinical Assessment</h3>
                  {result.clinicalAssessment && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Primary Symptoms</h4>
                        <ul className="list-disc pl-4">
                          {result.clinicalAssessment.primarySymptoms.map((symptom, index) => (
                            <li key={index}>{symptom}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Associated Symptoms</h4>
                        <ul className="list-disc pl-4">
                          {result.clinicalAssessment.associatedSymptoms.map((symptom, index) => (
                            <li key={index}>{symptom}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Duration</h4>
                          <p>{result.clinicalAssessment.duration}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Progression</h4>
                          <p>{result.clinicalAssessment.progression}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Aggravating Factors</h4>
                          <ul className="list-disc pl-4">
                            {result.clinicalAssessment.aggravatingFactors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Relieving Factors</h4>
                          <ul className="list-disc pl-4">
                            {result.clinicalAssessment.relievingFactors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Red Flags</h4>
                        <div className="space-y-2">
                          {result.clinicalAssessment.redFlags.map((flag, index) => (
                            <Alert key={index} variant="destructive">
                              <AlertTitle>{flag.sign}</AlertTitle>
                              <AlertDescription>
                                <div className="space-y-1">
                                  <p><strong>Clinical Criteria:</strong> {flag.clinicalCriteria}</p>
                                  <p><strong>Time Sensitivity:</strong> {flag.timeSensitivity}</p>
                                  <p><strong>Required Action:</strong> {flag.requiredAction}</p>
                                  <p><strong>Rationale:</strong> {flag.rationale}</p>
                                  <div>
                                    <strong>Potential Complications:</strong>
                                    <ul className="list-disc pl-4">
                                      {flag.potentialComplications.map((complication, i) => (
                                        <li key={i}>{complication}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <p><strong>Monitoring Frequency:</strong> {flag.monitoringFrequency}</p>
                                  <p><strong>Escalation Criteria:</strong> {flag.escalationCriteria}</p>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Vital Signs</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(result.clinicalAssessment.vitalSigns).map(([key, value]) => (
                            <div key={key} className="p-2 bg-muted rounded-lg">
                              <p className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-sm">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Severity Score</h4>
                          <Progress value={result.clinicalAssessment.severityScore * 10} className="w-full" />
                          <p className="text-sm mt-1">{result.clinicalAssessment.severityScore}/10</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Pain Scale</h4>
                          <Progress value={result.clinicalAssessment.painScale * 10} className="w-full" />
                          <p className="text-sm mt-1">{result.clinicalAssessment.painScale}/10</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Differential Diagnosis */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Differential Diagnosis</h3>
                  {renderSectionContent(result.differentialDiagnosis, 'No differential diagnosis available')}
                </div>

                {/* Treatment Plan Suggestions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Treatment Plan Suggestions</h3>
                  {result.treatmentPlanSuggestions && (
                    <div className="space-y-6">
                      {/* Immediate Actions */}
                      {result.treatmentPlanSuggestions.immediate && result.treatmentPlanSuggestions.immediate.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Immediate Actions</h4>
                          <div className="space-y-4">
                            {result.treatmentPlanSuggestions.immediate.map((action: any, index: number) => (
                              <Card key={index} className="bg-muted/50">
                                <CardContent className="pt-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h5 className="font-medium">{action.suggestedAction}</h5>
                                      <p className="text-sm text-muted-foreground">{action.rationale}</p>
                                      {action.suggestedTiming && (
                                        <p className="text-sm mt-1">
                                          <span className="font-medium">Suggested Timing:</span> {action.suggestedTiming}
                                        </p>
                                      )}
                                    </div>

                                    {/* Medications */}
                                    {action.suggestedMedications && action.suggestedMedications.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium mb-2">Suggested Medications</h6>
                                        <div className="space-y-2">
                                          {action.suggestedMedications.map((med: any, medIndex: number) => (
                                            <div key={medIndex} className="bg-background p-3 rounded-lg">
                                              <p className="font-medium">{med.name}</p>
                                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                <div>
                                                  <span className="font-medium">Suggested Dosage:</span> {med.suggestedDosage}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Frequency:</span> {med.suggestedFrequency}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Duration:</span> {med.suggestedDuration}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Route:</span> {med.suggestedRoute}
                                                </div>
                                              </div>
                                              {med.monitoring && med.monitoring.length > 0 && (
                                                <div className="mt-2">
                                                  <p className="text-sm font-medium">Monitoring:</p>
                                                  <ul className="list-disc pl-4 text-sm">
                                                    {med.monitoring.map((item: string, i: number) => (
                                                      <li key={i}>{item}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                              {med.expectedOutcome && (
                                                <p className="text-sm mt-2">
                                                  <span className="font-medium">Expected Outcome:</span> {med.expectedOutcome}
                                                </p>
                                              )}
                                              {med.suggestedContraindications && med.suggestedContraindications.length > 0 && (
                                                <div className="mt-2">
                                                  <p className="text-sm font-medium">Suggested Contraindications:</p>
                                                  <ul className="list-disc pl-4 text-sm">
                                                    {med.suggestedContraindications.map((item: string, i: number) => (
                                                      <li key={i}>{item}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Procedures */}
                                    {action.suggestedProcedures && action.suggestedProcedures.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium mb-2">Suggested Procedures</h6>
                                        <div className="space-y-2">
                                          {action.suggestedProcedures.map((proc: any, procIndex: number) => (
                                            <div key={procIndex} className="bg-background p-3 rounded-lg">
                                              <p className="font-medium">{proc.name}</p>
                                              <p className="text-sm mt-1">{proc.rationale}</p>
                                              {proc.suggestedTiming && (
                                                <p className="text-sm mt-1">
                                                  <span className="font-medium">Suggested Timing:</span> {proc.suggestedTiming}
                                                </p>
                                              )}
                                              {proc.suggestedPrecautions && proc.suggestedPrecautions.length > 0 && (
                                                <div className="mt-2">
                                                  <p className="text-sm font-medium">Suggested Precautions:</p>
                                                  <ul className="list-disc pl-4 text-sm">
                                                    {proc.suggestedPrecautions.map((item: string, i: number) => (
                                                      <li key={i}>{item}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Monitoring */}
                                    {action.suggestedMonitoring && (
                                      <div>
                                        <h6 className="text-sm font-medium mb-2">Suggested Monitoring</h6>
                                        <div className="bg-background p-3 rounded-lg">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <span className="font-medium">Parameters:</span>
                                              <ul className="list-disc pl-4">
                                                {action.suggestedMonitoring.parameters.map((param: string, i: number) => (
                                                  <li key={i}>{param}</li>
                                                ))}
                                              </ul>
                                            </div>
                                            <div>
                                              <span className="font-medium">Suggested Frequency:</span> {action.suggestedMonitoring.suggestedFrequency}
                                            </div>
                                          </div>
                                          {action.suggestedMonitoring.suggestedThresholds && (
                                            <div className="mt-2">
                                              <p className="text-sm font-medium">Suggested Thresholds:</p>
                                              <div className="grid grid-cols-3 gap-2 text-sm">
                                                <div>
                                                  <span className="font-medium">Normal:</span> {action.suggestedMonitoring.suggestedThresholds.normal}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Warning:</span> {action.suggestedMonitoring.suggestedThresholds.warning}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Critical:</span> {action.suggestedMonitoring.suggestedThresholds.critical}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Short-term Actions */}
                      {result.treatmentPlanSuggestions.shortTerm && result.treatmentPlanSuggestions.shortTerm.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Short-term Actions</h4>
                          <div className="space-y-4">
                            {result.treatmentPlanSuggestions.shortTerm.map((action: any, index: number) => (
                              <Card key={index} className="bg-muted/50">
                                <CardContent className="pt-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h5 className="font-medium">{action.suggestedAction}</h5>
                                      <p className="text-sm text-muted-foreground">{action.rationale}</p>
                                      {action.suggestedTiming && (
                                        <p className="text-sm mt-1">
                                          <span className="font-medium">Suggested Timing:</span> {action.suggestedTiming}
                                        </p>
                                      )}
                                    </div>

                                    {/* Medications */}
                                    {action.suggestedMedications && action.suggestedMedications.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium mb-2">Suggested Medications</h6>
                                        <div className="space-y-2">
                                          {action.suggestedMedications.map((med: any, medIndex: number) => (
                                            <div key={medIndex} className="bg-background p-3 rounded-lg">
                                              <p className="font-medium">{med.name}</p>
                                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                <div>
                                                  <span className="font-medium">Suggested Dosage:</span> {med.suggestedDosage}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Frequency:</span> {med.suggestedFrequency}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Duration:</span> {med.suggestedDuration}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Route:</span> {med.suggestedRoute}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Long-term Actions */}
                      {result.treatmentPlanSuggestions.longTerm && result.treatmentPlanSuggestions.longTerm.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Long-term Actions</h4>
                          <div className="space-y-4">
                            {result.treatmentPlanSuggestions.longTerm.map((action: any, index: number) => (
                              <Card key={index} className="bg-muted/50">
                                <CardContent className="pt-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h5 className="font-medium">{action.suggestedAction}</h5>
                                      <p className="text-sm text-muted-foreground">{action.rationale}</p>
                                      {action.suggestedTiming && (
                                        <p className="text-sm mt-1">
                                          <span className="font-medium">Suggested Timing:</span> {action.suggestedTiming}
                                        </p>
                                      )}
                                    </div>

                                    {/* Medications */}
                                    {action.suggestedMedications && action.suggestedMedications.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium mb-2">Suggested Medications</h6>
                                        <div className="space-y-2">
                                          {action.suggestedMedications.map((med: any, medIndex: number) => (
                                            <div key={medIndex} className="bg-background p-3 rounded-lg">
                                              <p className="font-medium">{med.name}</p>
                                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                <div>
                                                  <span className="font-medium">Suggested Dosage:</span> {med.suggestedDosage}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Frequency:</span> {med.suggestedFrequency}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Duration:</span> {med.suggestedDuration}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Suggested Route:</span> {med.suggestedRoute}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Monitoring Parameters */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Monitoring Parameters</h3>
                  {renderSectionContent(result.monitoringParameters, 'No monitoring parameters available')}
                </div>

                {/* Patient Education */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Patient Education</h3>
                  {renderSectionContent(result.patientEducation, 'No patient education materials available')}
                </div>

                {/* Impact Assessment */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Impact Assessment</h3>
                  {result.impactAssessment && (
                    <div className="space-y-6">
                      {/* Activities of Daily Living */}
                      {result.impactAssessment?.activitiesOfDailyLiving && (
                        <div>
                          <h4 className="font-medium mb-2">Activities of Daily Living</h4>
                          <div className="space-y-2">
                            {(() => {
                              const functionalImpact = result.impactAssessment?.activitiesOfDailyLiving?.functionalImpact;
                              return Array.isArray(functionalImpact) && functionalImpact.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Functional Impact</h5>
                                  <ul className="list-disc pl-4">
                                    {functionalImpact.map((impact, index) => (
                                      <li key={index}>{impact}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            {(() => {
                              const assistanceRequired = result.impactAssessment?.activitiesOfDailyLiving?.assistanceRequired;
                              return Array.isArray(assistanceRequired) && assistanceRequired.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Assistance Required</h5>
                                  <ul className="list-disc pl-4">
                                    {assistanceRequired.map((assistance, index) => (
                                      <li key={index}>{assistance}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            <div>
                              <h5 className="text-sm font-medium">Duration</h5>
                              <p>{result.impactAssessment?.activitiesOfDailyLiving?.duration}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quality of Life */}
                      {result.impactAssessment?.qualityOfLife && (
                        <div>
                          <h4 className="font-medium mb-2">Quality of Life Impact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(() => {
                              const physicalImpact = result.impactAssessment?.qualityOfLife?.physicalImpact;
                              return Array.isArray(physicalImpact) && physicalImpact.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Physical Impact</h5>
                                  <ul className="list-disc pl-4">
                                    {physicalImpact.map((impact, index) => (
                                      <li key={index}>{impact}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            {(() => {
                              const emotionalImpact = result.impactAssessment?.qualityOfLife?.emotionalImpact;
                              return Array.isArray(emotionalImpact) && emotionalImpact.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Emotional Impact</h5>
                                  <ul className="list-disc pl-4">
                                    {emotionalImpact.map((impact, index) => (
                                      <li key={index}>{impact}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            {(() => {
                              const socialImpact = result.impactAssessment?.qualityOfLife?.socialImpact;
                              return Array.isArray(socialImpact) && socialImpact.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Social Impact</h5>
                                  <ul className="list-disc pl-4">
                                    {socialImpact.map((impact, index) => (
                                      <li key={index}>{impact}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Work/School Impact */}
                      {result.impactAssessment?.workSchoolImpact && (
                        <div>
                          <h4 className="font-medium mb-2">Work/School Impact</h4>
                          <div className="space-y-2">
                            {(() => {
                              const functionalLimitations = result.impactAssessment?.workSchoolImpact?.functionalLimitations;
                              return Array.isArray(functionalLimitations) && functionalLimitations.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Functional Limitations</h5>
                                  <ul className="list-disc pl-4">
                                    {functionalLimitations.map((limitation, index) => (
                                      <li key={index}>{limitation}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            {(() => {
                              const requiredAccommodations = result.impactAssessment?.workSchoolImpact?.requiredAccommodations;
                              return Array.isArray(requiredAccommodations) && requiredAccommodations.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Required Accommodations</h5>
                                  <ul className="list-disc pl-4">
                                    {requiredAccommodations.map((accommodation, index) => (
                                      <li key={index}>{accommodation}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            <div>
                              <h5 className="text-sm font-medium">Expected Duration</h5>
                              <p>{result.impactAssessment?.workSchoolImpact?.expectedDuration}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Psychological Impact */}
                      {result.impactAssessment?.psychologicalImpact && (
                        <div>
                          <h4 className="font-medium mb-2">Psychological Impact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(() => {
                              const emotionalEffects = result.impactAssessment?.psychologicalImpact?.emotionalEffects;
                              return Array.isArray(emotionalEffects) && emotionalEffects.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Emotional Effects</h5>
                                  <ul className="list-disc pl-4">
                                    {emotionalEffects.map((effect, index) => (
                                      <li key={index}>{effect}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            {(() => {
                              const copingMechanisms = result.impactAssessment?.psychologicalImpact?.copingMechanisms;
                              return Array.isArray(copingMechanisms) && copingMechanisms.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Coping Mechanisms</h5>
                                  <ul className="list-disc pl-4">
                                    {copingMechanisms.map((mechanism, index) => (
                                      <li key={index}>{mechanism}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                            {(() => {
                              const supportNeeds = result.impactAssessment?.psychologicalImpact?.supportNeeds;
                              return Array.isArray(supportNeeds) && supportNeeds.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium">Support Needs</h5>
                                  <ul className="list-disc pl-4">
                                    {supportNeeds.map((need, index) => (
                                      <li key={index}>{need}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Emergency Protocol */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Emergency Protocol</h3>
                  {result.emergencyProtocol && (
                    <div className="space-y-4">
                      {(() => {
                        const whenToSeekHelp = result.emergencyProtocol?.whenToSeekHelp;
                        return Array.isArray(whenToSeekHelp) && whenToSeekHelp.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">When to Seek Help</h4>
                            <ul className="list-disc pl-4">
                              {whenToSeekHelp.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}

                      {(() => {
                        const emergencyContacts = result.emergencyProtocol?.emergencyContacts;
                        return Array.isArray(emergencyContacts) && emergencyContacts.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Emergency Contacts</h4>
                            <ul className="list-disc pl-4">
                              {emergencyContacts.map((contact, index) => (
                                <li key={index}>{contact}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}

                      {(() => {
                        const firstAidSteps = result.emergencyProtocol?.firstAidSteps;
                        return Array.isArray(firstAidSteps) && firstAidSteps.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">First Aid Steps</h4>
                            <ol className="list-decimal pl-4">
                              {firstAidSteps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Follow-up Plan */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Follow-up Plan</h3>
                  {result.followUpPlan && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Timeline</h4>
                          <p>{result.followUpPlan.timeline}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Duration</h4>
                          <p>{result.followUpPlan.duration}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Frequency</h4>
                          <p>{result.followUpPlan.frequency}</p>
                        </div>
                      </div>

                      {(() => {
                        const milestones = result.followUpPlan?.milestones;
                        return Array.isArray(milestones) && milestones.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Milestones</h4>
                            <ul className="list-disc pl-4">
                              {milestones.map((milestone, index) => (
                                <li key={index}>{milestone}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}

                      {(() => {
                        const warningSigns = result.followUpPlan?.warningSigns;
                        return Array.isArray(warningSigns) && warningSigns.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Warning Signs</h4>
                            <ul className="list-disc pl-4">
                              {warningSigns.map((sign, index) => (
                                <li key={index}>{sign}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}

                      {(() => {
                        const lifestyleModifications = result.followUpPlan?.lifestyleModifications;
                        return Array.isArray(lifestyleModifications) && lifestyleModifications.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Lifestyle Modifications</h4>
                            <ul className="list-disc pl-4">
                              {lifestyleModifications.map((modification, index) => (
                                <li key={index}>{modification}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Similar Cases</CardTitle>
              <CardDescription>
                Patients with similar symptoms and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSimilar ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : similarCases.length > 0 ? (
                <div className="space-y-4">
                  {similarCases.map((case_) => (
                    <Card key={case_.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{case_.patientName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Visit Date: {new Date(case_.visitDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={case_.visualElements.severity}>
                              {case_.visualElements.severity} Severity
                            </Badge>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">Similarity:</span>
                              <Progress value={case_.similarityScore * 100} className="w-24" />
                              <span className="text-sm">{Math.round(case_.similarityScore * 100)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Clinical Presentation</h4>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <span className="font-medium">Symptoms:</span> {case_.symptoms}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Diagnosis:</span> {case_.diagnosis}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Treatment Outcome:</span> {case_.treatmentOutcome}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Key Differences</h4>
                              <ScrollArea className="h-32">
                                <div className="space-y-2">
                                  {case_.keyDifferences.map((diff, index) => (
                                    <Alert key={index} className={`border-${diff.clinicalImpact?.severity} bg-${diff.clinicalImpact?.severity}/10`}>
                                      <div className="flex items-center gap-2">
                                        <span>{diff.type === 'current' ? '🔄' : '📅'}</span>
                                        <AlertTitle className="text-sm font-medium">
                                          {diff.type === 'current' ? 'Current Case' : 'Historical Case'}
                                        </AlertTitle>
                                      </div>
                                      <AlertDescription className="text-sm">
                                        {diff.description}
                                      </AlertDescription>
                                      {diff.clinicalImpact && (
                                        <div className="mt-2 text-xs">
                                          <Badge variant={diff.clinicalImpact.severity === 'high' ? 'destructive' : 'default'}>
                                            {diff.clinicalImpact.urgency} Priority
                                          </Badge>
                                          <div className="mt-1">
                                            <span className="font-medium">Monitor:</span> {diff.clinicalImpact.monitoring.join(', ')}
                                          </div>
                                        </div>
                                      )}
                                    </Alert>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Clinical Insights</h4>
                              <ScrollArea className="h-32">
                                <div className="space-y-2">
                                  {case_.insights.map((insight: { type: string; content: string; clinicalContext: string; color: string; icon: string }, index: number) => (
                                    <Alert key={index} className={`border-${insight.color} bg-${insight.color}/10`}>
                                      <div className="flex items-center gap-2">
                                        <span>{insight.icon}</span>
                                        <AlertTitle className="text-sm font-medium">{insight.type}</AlertTitle>
                                      </div>
                                      <AlertDescription className="text-sm">
                                        {insight.content}
                                      </AlertDescription>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {insight.clinicalContext}
                                      </div>
                                    </Alert>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Treatment Recommendations</h4>
                              <div className="space-y-4">
                                {Object.entries(case_.treatmentRecommendations).map(([timeline, recommendations]) => (
                                  <div key={timeline}>
                                    <h5 className="text-sm font-medium mb-2 capitalize">{timeline} Actions</h5>
                                    <div className="space-y-2">
                                      {(recommendations as Array<{
                                        action: string;
                                        priority: 'high' | 'medium' | 'low';
                                        color: string;
                                        icon: string;
                                        clinicalRationale: string;
                                        parameters: string[];
                                      }>).map((rec, index: number) => (
                                        <Alert key={index} className={`border-${rec.color} bg-${rec.color}/10`}>
                                          <div className="flex items-center gap-2">
                                            <span>{rec.icon}</span>
                                            <AlertTitle className="text-sm font-medium">{rec.action}</AlertTitle>
                                          </div>
                                          <AlertDescription className="text-sm">
                                            {rec.clinicalRationale}
                                          </AlertDescription>
                                          <div className="mt-2">
                                            <div className="text-xs font-medium">Parameters to Monitor:</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {rec.parameters.map((param, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                  {param}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </Alert>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="font-medium">Confidence:</span>
                              <Badge variant={case_.visualElements.confidence}>
                                {case_.visualElements.confidence}
                              </Badge>
                            </div>
                            <div>
                              <span className="font-medium">Relevance:</span>
                              <Badge variant={case_.visualElements.relevance}>
                                {case_.visualElements.relevance}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-muted-foreground">
                            Last updated: {new Date(case_.visitDate).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No similar cases found. Try analyzing symptoms first.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 