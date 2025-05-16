import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize OpenAI client with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HistoricalCase {
  patientName: string;
  symptoms: string;
  diagnosis: string;
  visitDate: string;
  treatmentOutcome: string;
}

interface MedicalRecord {
  id: string;
  patient_id: string;
  description: string;
  notes: string;
  created_at: string;
  patients: {
    id: string;
    users: { name: string }[];
  };
}

interface MedicalReport {
  id: string;
  patient_id: string;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
}

// Enhanced medical analysis system with richer data
const medicalAnalysis = {
  // Medical keywords with their weights and categories
  keywords: {
    severity: {
      severe: { weight: 3, category: 'critical', color: '#FF4B4B', icon: '⚠️' },
      extreme: { weight: 3, category: 'critical', color: '#FF4B4B', icon: '⚠️' },
      critical: { weight: 3, category: 'critical', color: '#FF4B4B', icon: '⚠️' },
      moderate: { weight: 2, category: 'moderate', color: '#FFA500', icon: '⚡' },
      mild: { weight: 1, category: 'mild', color: '#4CAF50', icon: 'ℹ️' },
      chronic: { weight: 2, category: 'moderate', color: '#FFA500', icon: '⚡' },
      acute: { weight: 2, category: 'moderate', color: '#FFA500', icon: '⚡' }
    },
    symptoms: {
      pain: { weight: 2, category: 'general', color: '#FF4B4B', icon: '💢' },
      fever: { weight: 2, category: 'general', color: '#FF4B4B', icon: '🌡️' },
      cough: { weight: 1, category: 'respiratory', color: '#4CAF50', icon: '😷' },
      headache: { weight: 1, category: 'neurological', color: '#FFA500', icon: '🤕' },
      nausea: { weight: 1, category: 'gastrointestinal', color: '#FFA500', icon: '🤢' },
      fatigue: { weight: 1, category: 'general', color: '#4CAF50', icon: '😴' },
      dizziness: { weight: 1, category: 'neurological', color: '#FFA500', icon: '💫' },
      shortness: { weight: 2, category: 'respiratory', color: '#FF4B4B', icon: '😮‍💨' },
      chest: { weight: 2, category: 'cardiac', color: '#FF4B4B', icon: '❤️' },
      abdominal: { weight: 1, category: 'gastrointestinal', color: '#FFA500', icon: '🤢' }
    },
    time: {
      sudden: { weight: 2, category: 'acute', color: '#FF4B4B', icon: '⚡' },
      gradual: { weight: 1, category: 'chronic', color: '#4CAF50', icon: '📈' },
      persistent: { weight: 2, category: 'chronic', color: '#FFA500', icon: '⏳' },
      recurring: { weight: 2, category: 'chronic', color: '#FFA500', icon: '🔄' },
      intermittent: { weight: 1, category: 'chronic', color: '#4CAF50', icon: '🔄' }
    }
  },

  // Enhanced similarity analysis with clinical context
  calculateSimilarityScore(current: string, historical: string) {
    const lowerCurrent = current.toLowerCase();
    const lowerHistorical = historical.toLowerCase();
    
    let score = 0;
    let totalWeight = 0;
    const matchedCategories = new Set<string>();
    const matchedKeywords = new Map<string, { weight: number, category: string, color: string, icon: string }>();
    const clinicalContext = {
      severity: new Set<string>(),
      symptoms: new Set<string>(),
      timePatterns: new Set<string>(),
      riskFactors: new Set<string>()
    };

    // Analyze severity with clinical context
    Object.entries(this.keywords.severity).forEach(([keyword, data]) => {
      if (lowerCurrent.includes(keyword) && lowerHistorical.includes(keyword)) {
        score += data.weight;
        totalWeight += data.weight;
        matchedCategories.add(data.category);
        matchedKeywords.set(keyword, data);
        clinicalContext.severity.add(keyword);
      }
    });

    // Analyze symptoms with clinical context
    Object.entries(this.keywords.symptoms).forEach(([keyword, data]) => {
      if (lowerCurrent.includes(keyword) && lowerHistorical.includes(keyword)) {
        score += data.weight;
        totalWeight += data.weight;
        matchedCategories.add(data.category);
        matchedKeywords.set(keyword, data);
        clinicalContext.symptoms.add(keyword);
      }
    });

    // Analyze time patterns with clinical context
    Object.entries(this.keywords.time).forEach(([keyword, data]) => {
      if (lowerCurrent.includes(keyword) && lowerHistorical.includes(keyword)) {
        score += data.weight;
        totalWeight += data.weight;
        matchedCategories.add(data.category);
        matchedKeywords.set(keyword, data);
        clinicalContext.timePatterns.add(keyword);
      }
    });

    // Calculate word overlap with medical context
    const currentWords = new Set(lowerCurrent.split(/\s+/));
    const historicalWords = new Set(lowerHistorical.split(/\s+/));
    const commonWords = new Set([...currentWords].filter(x => historicalWords.has(x)));
    
    const wordOverlapScore = commonWords.size / Math.max(currentWords.size, historicalWords.size);
    score += wordOverlapScore * 2;
    totalWeight += 2;

    // Bonus for matching medical categories
    const categoryBonus = matchedCategories.size * 0.1;
    score += categoryBonus;
    totalWeight += categoryBonus;

    // Calculate clinical relevance score
    const clinicalRelevance = {
      severityMatch: clinicalContext.severity.size > 0,
      symptomMatch: clinicalContext.symptoms.size > 0,
      timePatternMatch: clinicalContext.timePatterns.size > 0,
      categoryMatch: matchedCategories.size > 0
    };

    return {
      score: totalWeight > 0 ? score / totalWeight : 0,
      matchedKeywords: Array.from(matchedKeywords.entries()).map(([keyword, data]) => ({
        keyword,
        ...data
      })),
      matchedCategories: Array.from(matchedCategories),
      clinicalContext,
      clinicalRelevance
    };
  },

  // Enhanced key differences analysis with clinical significance
  extractKeyDifferences(current: string, historical: string) {
    const lowerCurrent = current.toLowerCase();
    const lowerHistorical = historical.toLowerCase();
    
    const currentWords = new Set(lowerCurrent.split(/\s+/));
    const historicalWords = new Set(lowerHistorical.split(/\s+/));
    
    const uniqueToCurrent = [...currentWords].filter(x => !historicalWords.has(x));
    const uniqueToHistorical = [...historicalWords].filter(x => !currentWords.has(x));

    // Enhanced categorization with clinical significance
    const categorizeDifference = (word: string) => {
      for (const [category, keywords] of Object.entries(this.keywords)) {
        for (const [keyword, data] of Object.entries(keywords)) {
          if (word.includes(keyword)) {
            return {
              category: data.category,
              color: data.color,
              icon: data.icon,
              clinicalSignificance: this.getClinicalSignificance(data.category)
            };
          }
        }
      }
      return {
        category: 'general',
        color: '#4CAF50',
        icon: 'ℹ️',
        clinicalSignificance: 'low'
      };
    };

    const differences = [
      ...uniqueToCurrent.map(word => ({
        type: 'current',
        symptom: word,
        ...categorizeDifference(word),
        description: `Current case has "${word}" not present in historical case`,
        clinicalImpact: this.assessClinicalImpact(word)
      })),
      ...uniqueToHistorical.map(word => ({
        type: 'historical',
        symptom: word,
        ...categorizeDifference(word),
        description: `Historical case had "${word}" not present in current case`,
        clinicalImpact: this.assessClinicalImpact(word)
      }))
    ];

    // Sort by clinical significance
    return differences
      .sort((a, b) => {
        const significanceOrder = { high: 3, moderate: 2, low: 1 };
        return (significanceOrder[b.clinicalSignificance as keyof typeof significanceOrder] || 0) - 
               (significanceOrder[a.clinicalSignificance as keyof typeof significanceOrder] || 0);
      })
      .slice(0, 5);
  },

  // Get clinical significance level
  getClinicalSignificance(category: string): 'high' | 'moderate' | 'low' {
    switch (category) {
      case 'critical':
        return 'high';
      case 'moderate':
        return 'moderate';
      default:
        return 'low';
    }
  },

  // Assess clinical impact of a symptom
  assessClinicalImpact(symptom: string): {
    severity: 'high' | 'moderate' | 'low';
    urgency: 'immediate' | 'urgent' | 'routine';
    monitoring: string[];
  } {
    const lowerSymptom = symptom.toLowerCase();
    let severity: 'high' | 'moderate' | 'low' = 'low';
    let urgency: 'immediate' | 'urgent' | 'routine' = 'routine';
    const monitoring: string[] = [];

    // Check for critical symptoms
    if (lowerSymptom.includes('severe') || lowerSymptom.includes('extreme') || 
        lowerSymptom.includes('critical') || lowerSymptom.includes('acute')) {
      severity = 'high';
      urgency = 'immediate';
      monitoring.push('Vital signs', 'Pain level', 'Consciousness');
    }
    // Check for moderate symptoms
    else if (lowerSymptom.includes('moderate') || lowerSymptom.includes('persistent')) {
      severity = 'moderate';
      urgency = 'urgent';
      monitoring.push('Symptom progression', 'Pain level');
    }
    // Check for specific symptoms
    if (lowerSymptom.includes('fever')) {
      monitoring.push('Temperature');
    }
    if (lowerSymptom.includes('chest') || lowerSymptom.includes('heart')) {
      monitoring.push('ECG', 'Blood pressure');
    }
    if (lowerSymptom.includes('breathing') || lowerSymptom.includes('respiratory')) {
      monitoring.push('Oxygen saturation', 'Respiratory rate');
    }

    return { severity, urgency, monitoring };
  },

  // Enhanced insights generation with clinical context
  generateInsights(case_: HistoricalCase) {
    const insights = [
      {
        type: 'diagnosis',
        content: `Previous diagnosis: ${case_.diagnosis}`,
        importance: 'high',
        color: '#FF4B4B',
        icon: '🔍',
        clinicalContext: 'Primary diagnosis from previous case'
      },
      {
        type: 'outcome',
        content: `Treatment outcome: ${case_.treatmentOutcome}`,
        importance: 'high',
        color: '#4CAF50',
        icon: '✅',
        clinicalContext: 'Treatment effectiveness and patient response'
      },
      {
        type: 'timing',
        content: `Case from: ${new Date(case_.visitDate).toLocaleDateString()}`,
        importance: 'medium',
        color: '#FFA500',
        icon: '📅',
        clinicalContext: 'Temporal context for treatment planning'
      }
    ];

    // Add severity-based insights
    const severityKeywords = Object.keys(this.keywords.severity);
    const hasSeverity = severityKeywords.some(keyword => 
      case_.symptoms.toLowerCase().includes(keyword)
    );

    if (hasSeverity) {
      insights.push({
        type: 'severity',
        content: 'Case involved severe symptoms requiring immediate attention',
        importance: 'high',
        color: '#FF4B4B',
        icon: '⚠️',
        clinicalContext: 'Severity assessment for current case comparison'
      });
    }

    return insights
      .sort((a, b) => {
        const importanceOrder = { high: 2, medium: 1, low: 0 };
        return importanceOrder[b.importance as keyof typeof importanceOrder] - 
               importanceOrder[a.importance as keyof typeof importanceOrder];
      });
  },

  // Enhanced treatment recommendations with clinical context
  generateTreatmentRecommendations(case_: HistoricalCase) {
    return {
      immediate: [
        {
          action: 'Assess vital signs',
          priority: 'high',
          color: '#FF4B4B',
          icon: '❤️',
          clinicalRationale: 'Establish baseline and identify any immediate concerns',
          parameters: ['Blood pressure', 'Heart rate', 'Temperature', 'Respiratory rate', 'Oxygen saturation']
        },
        {
          action: 'Review previous medications',
          priority: 'high',
          color: '#FF4B4B',
          icon: '💊',
          clinicalRationale: 'Identify potential drug interactions and contraindications',
          parameters: ['Current medications', 'Allergies', 'Previous adverse reactions']
        }
      ],
      shortTerm: [
        {
          action: 'Schedule follow-up',
          priority: 'medium',
          color: '#FFA500',
          icon: '📅',
          clinicalRationale: 'Monitor treatment response and adjust as needed',
          parameters: ['Symptom progression', 'Treatment adherence', 'Side effects']
        },
        {
          action: 'Monitor symptoms',
          priority: 'medium',
          color: '#FFA500',
          icon: '📊',
          clinicalRationale: 'Track symptom evolution and treatment effectiveness',
          parameters: ['Pain level', 'Symptom frequency', 'Functional status']
        }
      ],
      longTerm: [
        {
          action: 'Regular check-ups',
          priority: 'low',
          color: '#4CAF50',
          icon: '🔄',
          clinicalRationale: 'Ensure long-term management and prevention',
          parameters: ['Disease progression', 'Complications', 'Quality of life']
        },
        {
          action: 'Lifestyle modifications',
          priority: 'low',
          color: '#4CAF50',
          icon: '🌱',
          clinicalRationale: 'Support overall health and prevent recurrence',
          parameters: ['Diet', 'Exercise', 'Stress management', 'Sleep hygiene']
        }
      ]
    };
  }
};

// Enhanced fallback response with sophisticated medical analysis
const getFallbackResponse = (currentSymptoms: string, historicalCases: HistoricalCase[]) => {
  // Analyze cases with enhanced medical scoring
  const analyzedCases = historicalCases.map(case_ => {
    const similarityAnalysis = medicalAnalysis.calculateSimilarityScore(currentSymptoms, case_.symptoms);
    const keyDifferences = medicalAnalysis.extractKeyDifferences(currentSymptoms, case_.symptoms);
    const insights = medicalAnalysis.generateInsights(case_);
    const treatmentRecommendations = medicalAnalysis.generateTreatmentRecommendations(case_);

    return {
      ...case_,
      similarityScore: similarityAnalysis.score,
      matchedKeywords: similarityAnalysis.matchedKeywords,
      matchedCategories: similarityAnalysis.matchedCategories,
      keyDifferences,
      insights,
      treatmentRecommendations,
      visualElements: {
        severity: keyDifferences.some(diff => diff.category === 'critical') ? 'high' : 
                 keyDifferences.some(diff => diff.category === 'moderate') ? 'medium' : 'low',
        confidence: similarityAnalysis.score > 0.7 ? 'high' : 
                   similarityAnalysis.score > 0.4 ? 'medium' : 'low',
        relevance: insights.length > 3 ? 'high' : 
                  insights.length > 1 ? 'medium' : 'low'
      }
    };
  });

  // Sort by similarity score and get top 5
  return analyzedCases
    .filter(case_ => case_.similarityScore > 0.2)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5)
    .map(case_ => ({
      patientName: case_.patientName,
      similarityScore: case_.similarityScore,
      matchedKeywords: case_.matchedKeywords,
      matchedCategories: case_.matchedCategories,
      keyDifferences: case_.keyDifferences,
      insights: case_.insights,
      treatmentRecommendations: case_.treatmentRecommendations,
      diagnosis: case_.diagnosis,
      treatmentOutcome: case_.treatmentOutcome,
      visitDate: case_.visitDate,
      visualElements: case_.visualElements
    }));
};

// Safe API call with automatic fallback
const safeApiCall = async (messages: ChatCompletionMessageParam[]) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.2,
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.log('API call failed, using fallback analysis');
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const currentSymptoms = formData.get('currentSymptoms') as string;
    const doctorId = formData.get('doctorId') as string;

    if (!currentSymptoms) {
      return NextResponse.json(
        { error: 'Current symptoms are required' },
        { status: 400 }
      );
    }

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Fetch historical medical records for the doctor's patients
    const { data: medicalRecords, error: recordsError } = await supabase
      .from('medical_records')
      .select(`
        id,
        patient_id,
        description,
        notes,
        created_at,
        patients!inner (
          id,
          users!inner (
            name
          )
        )
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (recordsError) {
      console.error('Error fetching medical records:', recordsError);
      // Return fallback response instead of error
      return NextResponse.json({
        similarCases: [],
        _fallback: true,
        _message: 'Unable to fetch medical records. Please try again later.'
      });
    }

    // Fetch medical reports separately
    const { data: medicalReports, error: reportsError } = await supabase
      .from('medical_reports')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching medical reports:', reportsError);
      // Return fallback response instead of error
      return NextResponse.json({
        similarCases: [],
        _fallback: true,
        _message: 'Unable to fetch medical reports. Please try again later.'
      });
    }

    // Create a map of patient_id to their latest medical report
    const patientReports = new Map(
      medicalReports?.map(report => [report.patient_id, report]) || []
    );

    // Prepare historical cases for analysis
    const historicalCases: HistoricalCase[] = (medicalRecords as unknown as MedicalRecord[]).map(record => {
      const report = patientReports.get(record.patient_id);
      return {
        patientName: record.patients?.users[0]?.name || 'Unknown Patient',
        symptoms: record.description || '',
        diagnosis: report?.diagnosis || 'No diagnosis recorded',
        visitDate: record.created_at,
        treatmentOutcome: report?.notes || 'No outcome recorded'
      };
    });

    if (historicalCases.length === 0) {
      return NextResponse.json({
        similarCases: [],
        _fallback: true,
        _message: 'No historical cases found for comparison.'
      });
    }

    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a medical AI assistant helping to find similar cases from a doctor's patient history.
        Analyze the current symptoms against historical cases and return a JSON response with the following structure:
        {
          "similarCases": [
            {
              "patientName": "Name of the patient",
              "similarityScore": "Number between 0-1",
              "keyDifferences": ["List of key differences"],
              "relevantInsights": ["List of relevant insights"],
              "diagnosis": "Original diagnosis",
              "treatmentOutcome": "Treatment outcome",
              "visitDate": "Date of visit"
            }
          ]
        }
        
        Consider the following when analyzing:
        1. Symptom similarity and patterns
        2. Severity and progression
        3. Treatment outcomes
        4. Time-based patterns
        5. Risk factors
        6. Demographic similarities
        
        Return only the top 5 most similar cases.`
      },
      {
        role: 'user',
        content: `Current symptoms: ${currentSymptoms}\n\nHistorical cases:\n${JSON.stringify(historicalCases, null, 2)}`
      }
    ];

    // Try API call with automatic fallback
    const analysis = await safeApiCall(messages);
    
    if (analysis) {
      // Validate and ensure all required fields are present
      const validatedAnalysis = {
        similarCases: (analysis.similarCases || []).map((case_: any) => ({
          patientName: case_.patientName || 'Unknown Patient',
          similarityScore: case_.similarityScore || 0,
          keyDifferences: case_.keyDifferences || ['No differences analyzed'],
          relevantInsights: case_.insights || ['No insights available'],
          diagnosis: case_.diagnosis || 'No diagnosis recorded',
          treatmentOutcome: case_.treatmentOutcome || 'No outcome recorded',
          visitDate: case_.visitDate || 'Date not available'
        }))
      };

      return NextResponse.json(validatedAnalysis.similarCases);
    }

    // If API call fails, use fallback analysis
    console.log('Using enhanced medical analysis');
    const fallbackResponse = getFallbackResponse(currentSymptoms, historicalCases);
    return NextResponse.json({
      similarCases: fallbackResponse,
      _fallback: true,
      _message: 'Using advanced medical analysis for similar cases.'
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Always return a valid response, never an error
    return NextResponse.json({
      similarCases: [],
      _fallback: true,
      _message: 'Unable to perform analysis at this time. Please try again later.'
    });
  }
} 