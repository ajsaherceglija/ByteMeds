import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback response for when API is unavailable
const getFallbackResponse = (symptoms: string, specialty: string) => {
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Enhanced keyword detection
  const emergencyKeywords = ['severe', 'extreme', 'unbearable', 'emergency', 'critical', 'acute', 'sudden', 'sharp', 'intense'];
  const urgentKeywords = ['moderate', 'significant', 'persistent', 'worsening', 'chronic', 'recurring'];
  const painKeywords = ['pain', 'ache', 'discomfort', 'sore', 'tender'];
  const feverKeywords = ['fever', 'temperature', 'hot', 'chills', 'sweating'];
  const respiratoryKeywords = ['breathing', 'cough', 'chest', 'lung', 'respiratory', 'shortness of breath'];
  const gastrointestinalKeywords = ['stomach', 'abdomen', 'nausea', 'vomiting', 'diarrhea', 'constipation'];
  const neurologicalKeywords = ['headache', 'dizziness', 'confusion', 'seizure', 'numbness', 'tingling'];
  
  const hasEmergency = emergencyKeywords.some(keyword => lowerSymptoms.includes(keyword));
  const hasUrgent = urgentKeywords.some(keyword => lowerSymptoms.includes(keyword));
  const hasPain = painKeywords.some(keyword => lowerSymptoms.includes(keyword));
  const hasFever = feverKeywords.some(keyword => lowerSymptoms.includes(keyword));
  const hasRespiratory = respiratoryKeywords.some(keyword => lowerSymptoms.includes(keyword));
  const hasGastrointestinal = gastrointestinalKeywords.some(keyword => lowerSymptoms.includes(keyword));
  const hasNeurological = neurologicalKeywords.some(keyword => lowerSymptoms.includes(keyword));
  
  const priority = hasEmergency ? 'High' : hasUrgent ? 'Medium' : 'Low';
  const immediateAttention = hasEmergency ? 'Required' : 'Not Required';

  // Generate suggested diagnoses based on symptoms
  const suggestedDiagnoses = [];
  if (hasPain && hasFever) {
    suggestedDiagnoses.push('Possible infection or inflammatory condition');
  }
  if (hasRespiratory) {
    suggestedDiagnoses.push('Potential respiratory condition');
  }
  if (hasGastrointestinal) {
    suggestedDiagnoses.push('Possible gastrointestinal disorder');
  }
  if (hasNeurological) {
    suggestedDiagnoses.push('Potential neurological condition');
  }
  if (hasPain && hasNeurological) {
    suggestedDiagnoses.push('Possible neurological pain syndrome');
  }

  // Generate suggested actions based on symptoms
  const suggestedActions = [];
  if (hasEmergency) {
    suggestedActions.push('Seek immediate medical attention');
  } else {
    suggestedActions.push('Schedule an appointment with your healthcare provider');
  }
  if (hasPain) {
    suggestedActions.push('Monitor pain levels and location');
    suggestedActions.push('Note any factors that worsen or improve the pain');
  }
  if (hasFever) {
    suggestedActions.push('Monitor temperature regularly');
    suggestedActions.push('Stay hydrated and rest');
  }
  if (hasRespiratory) {
    suggestedActions.push('Monitor breathing patterns');
    suggestedActions.push('Note any changes in respiratory symptoms');
  }

  // Generate suggested monitoring parameters
  const monitoringParams = [];
  if (hasFever) {
    monitoringParams.push('Temperature');
  }
  if (hasPain) {
    monitoringParams.push('Pain Level');
  }
  if (hasRespiratory) {
    monitoringParams.push('Respiratory Rate');
    monitoringParams.push('Oxygen Saturation');
  }
  monitoringParams.push('General Symptom Progression');

  return {
    priority,
    description: `Based on the symptoms described: "${symptoms}", we recommend ${priority.toLowerCase()} priority attention. ${
      immediateAttention === 'Required' 
        ? 'Please seek immediate medical attention.' 
        : 'Schedule an appointment with your healthcare provider.'
    }`,
    immediateAttention,
    riskFactors: ['Unable to perform detailed risk assessment at this time, but consider reviewing family history and lifestyle factors'],
    potentialConditions: suggestedDiagnoses.length > 0 
      ? suggestedDiagnoses 
      : ['Unable to determine specific conditions without detailed analysis, but symptoms suggest the need for medical evaluation'],
    recommendedActions: suggestedActions,
    clinicalAssessment: {
      primarySymptoms: symptoms.split(/[.,]/).map(s => s.trim()).filter(Boolean).slice(0, 3),
      associatedSymptoms: [],
      duration: 'Not specified',
      progression: 'Not specified',
      aggravatingFactors: ['Unable to determine specific factors at this time, but consider noting any patterns in symptom worsening'],
      relievingFactors: ['Unable to determine specific factors at this time, but consider noting any patterns in symptom improvement'],
      redFlags: hasEmergency ? ['Severe symptoms requiring immediate attention'] : [],
      vitalSigns: {
        temperature: hasFever ? 'Should be monitored' : 'Not measured',
        bloodPressure: 'Not measured',
        heartRate: 'Not measured',
        respiratoryRate: hasRespiratory ? 'Should be monitored' : 'Not measured',
        oxygenSaturation: hasRespiratory ? 'Should be monitored' : 'Not measured'
      },
      severityScore: hasEmergency ? 8 : hasUrgent ? 5 : 3,
      painScale: hasPain ? (hasEmergency ? 7 : hasUrgent ? 4 : 2) : 0
    },
    differentialDiagnosis: {
      mostLikely: suggestedDiagnoses.length > 0 
        ? suggestedDiagnoses 
        : ['Unable to determine specific diagnoses without detailed analysis, but symptoms suggest the need for medical evaluation'],
      alternatives: ['Additional conditions may be considered after medical evaluation'],
      toRuleOut: ['Specific conditions to rule out will be determined during medical evaluation'],
      probabilityScores: {},
      keyFindings: ['Key findings will be determined during medical evaluation']
    },
    requiredTests: [
      'Complete Blood Count (CBC)',
      'Basic Metabolic Panel',
      'Urinalysis'
    ],
    monitoringParameters: monitoringParams,
    treatmentPlanSuggestions: {
      immediate: [{
        suggestedAction: hasEmergency ? 'Seek immediate medical attention' : 'Schedule medical evaluation',
        rationale: 'Initial assessment needed to determine appropriate treatment',
        suggestedTiming: hasEmergency ? 'Immediately' : 'Within 24-48 hours',
        suggestedMedications: [],
        suggestedProcedures: [],
        suggestedMonitoring: {
          parameters: monitoringParams,
          suggestedFrequency: hasEmergency ? 'Continuous' : 'Every 4-6 hours',
          suggestedThresholds: {
            normal: 'Baseline values',
            warning: 'Any significant change from baseline',
            critical: 'Severe symptoms or rapid deterioration'
          }
        }
      }],
      shortTerm: [{
        suggestedAction: 'Follow up with healthcare provider',
        rationale: 'Regular monitoring and assessment needed',
        suggestedTiming: 'As recommended by healthcare provider',
        suggestedMedications: []
      }],
      longTerm: [{
        suggestedAction: 'Maintain regular follow-up appointments',
        rationale: 'Ongoing monitoring and treatment adjustment may be needed',
        suggestedTiming: 'As recommended by healthcare provider',
        suggestedMedications: []
      }]
    }
  };
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const symptoms = formData.get('symptoms') as string;
    const image = formData.get('image') as File | null;
    const doctorId = formData.get('doctorId') as string;

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms description is required' },
        { status: 400 }
      );
    }

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    try {
      // Prepare the prompt for ChatGPT
      const prompt = `As a senior medical consultant with extensive clinical experience, provide a comprehensive medical analysis of the following symptoms. Your response must be in JSON format with the specified fields. This analysis will be used by healthcare providers to make clinical decisions.

Symptoms: ${symptoms}

Please provide a detailed clinical analysis considering:

1. Clinical Assessment
   - Primary symptoms with detailed characteristics (onset, quality, radiation, severity, timing, exacerbating/relieving factors)
   - Associated symptoms and their relationships
   - Detailed symptom progression and pattern
   - Impact on vital signs and general condition
   - Red flag symptoms and warning signs
   - Relevant past medical history considerations
   - Family history implications
   - Social history factors
   - Medication history and potential interactions

2. Differential Diagnosis
   - Most likely diagnoses with probability percentages
   - Alternative diagnoses to consider
   - Conditions to rule out
   - Risk factors and predisposing conditions
   - Comorbidities to consider
   - Age and gender-specific considerations
   - Relevant clinical scoring systems
   - Key clinical features supporting each diagnosis
   - Features arguing against each diagnosis

3. Treatment Plan Suggestions (This is crucial - provide detailed, actionable treatment recommendations)
   - Immediate Actions (within 24 hours):
     * Suggested actions with rationale
     * Recommended medications with suggested dosages, frequencies, and durations
     * Suggested procedures
     * Recommended monitoring parameters and thresholds
     * Expected outcomes
     * Suggested precautions and contraindications
   
   - Short-term Actions (24-72 hours):
     * Suggested follow-up actions
     * Recommended medication adjustments
     * Additional suggested procedures
     * Recommended monitoring requirements
     * Expected improvements
   
   - Long-term Management (beyond 72 hours):
     * Suggested ongoing treatment plan
     * Recommended medication maintenance
     * Suggested lifestyle modifications
     * Recommended rehabilitation needs
     * Suggested prevention strategies

4. Monitoring Parameters
   - Vital signs to track
   - Laboratory values to monitor
   - Clinical symptoms to observe
   - Warning signs to watch for
   - Frequency of monitoring
   - Thresholds for intervention

5. Patient Education
   - Key points to communicate
   - Warning signs to report
   - Self-care instructions
   - Lifestyle modifications
   - Follow-up requirements

IMPORTANT: For the treatment plan suggestions, provide specific, actionable recommendations including:
- Suggested medication dosages and frequencies
- Recommended timing for interventions
- Suggested monitoring parameters
- Recommended thresholds for action
- Detailed rationale for each suggestion
- Expected outcomes and timelines
- Potential complications to watch for
- Suggested contraindications and precautions

Respond in this exact JSON format:
{
  "priority": "Low|Medium|High",
  "recommendedSpecialties": ["specialty1", "specialty2"],
  "description": "Detailed clinical analysis...",
  "immediateAttention": "Required|Not Required",
  "clinicalAssessment": {
    "primarySymptoms": ["symptom1", "symptom2"],
    "associatedSymptoms": ["symptom1", "symptom2"],
    "duration": "description",
    "progression": "description",
    "aggravatingFactors": ["factor1", "factor2"],
    "relievingFactors": ["factor1", "factor2"],
    "redFlags": ["flag1", "flag2"],
    "vitalSigns": {
      "temperature": "value",
      "bloodPressure": "value",
      "heartRate": "value",
      "respiratoryRate": "value",
      "oxygenSaturation": "value"
    }
  },
  "differentialDiagnosis": {
    "mostLikely": [{
      "condition": "diagnosis1",
      "probability": "percentage",
      "supportingFeatures": ["feature1", "feature2"],
      "contraFeatures": ["feature1", "feature2"]
    }],
    "alternatives": [{
      "condition": "diagnosis1",
      "probability": "percentage",
      "supportingFeatures": ["feature1", "feature2"]
    }],
    "toRuleOut": [{
      "condition": "condition1",
      "rationale": "rationale",
      "requiredTests": [{
        "name": "test1",
        "expectedResult": "result",
        "urgency": "urgency"
      }]
    }]
  },
  "treatmentPlanSuggestions": {
    "immediate": [{
      "suggestedAction": "action1",
      "rationale": "rationale",
      "suggestedTiming": "timing",
      "suggestedMedications": [{
        "name": "medication1",
        "suggestedDosage": "exact dosage",
        "suggestedFrequency": "exact frequency",
        "suggestedDuration": "exact duration",
        "suggestedRoute": "route",
        "monitoring": ["parameter1", "parameter2"],
        "expectedOutcome": "outcome",
        "potentialComplications": ["complication1", "complication2"],
        "suggestedContraindications": ["contraindication1", "contraindication2"],
        "suggestedInteractions": ["interaction1", "interaction2"]
      }],
      "suggestedProcedures": [{
        "name": "procedure1",
        "suggestedTiming": "timing",
        "rationale": "rationale",
        "suggestedPrecautions": ["precaution1", "precaution2"]
      }],
      "suggestedMonitoring": {
        "parameters": ["parameter1", "parameter2"],
        "suggestedFrequency": "frequency",
        "suggestedThresholds": {
          "normal": "normal range",
          "warning": "warning threshold",
          "critical": "critical threshold"
        }
      }
    }],
    "shortTerm": [{
      "suggestedAction": "action1",
      "rationale": "rationale",
      "suggestedTiming": "timing",
      "suggestedMedications": [{
        "name": "medication1",
        "suggestedDosage": "exact dosage",
        "suggestedFrequency": "exact frequency",
        "suggestedDuration": "exact duration",
        "suggestedRoute": "route",
        "monitoring": ["parameter1", "parameter2"],
        "expectedOutcome": "outcome",
        "potentialComplications": ["complication1", "complication2"]
      }]
    }],
    "longTerm": [{
      "suggestedAction": "action1",
      "rationale": "rationale",
      "suggestedTiming": "timing",
      "suggestedMedications": [{
        "name": "medication1",
        "suggestedDosage": "exact dosage",
        "suggestedFrequency": "exact frequency",
        "suggestedDuration": "exact duration",
        "suggestedRoute": "route",
        "monitoring": ["parameter1", "parameter2"],
        "expectedOutcome": "outcome",
        "potentialComplications": ["complication1", "complication2"]
      }]
    }]
  },
  "monitoringParameters": [{
    "parameter": "parameter1",
    "frequency": "frequency",
    "normalRange": "range",
    "actionThreshold": "threshold",
    "method": "method",
    "rationale": "rationale",
    "actions": {
      "mild": {
        "threshold": "threshold",
        "action": "action",
        "rationale": "rationale"
      },
      "moderate": {
        "threshold": "threshold",
        "action": "action",
        "rationale": "rationale"
      },
      "severe": {
        "threshold": "threshold",
        "action": "action",
        "rationale": "rationale"
      }
    }
  }],
  "patientEducation": [{
    "topic": "topic1",
    "keyPoints": ["point1", "point2"],
    "warningSigns": [{
      "description": "description",
      "threshold": "threshold",
      "action": "action",
      "rationale": "rationale",
      "urgency": "urgency"
    }],
    "selfCare": [{
      "instruction": "instruction",
      "frequency": "frequency",
      "rationale": "rationale",
      "technique": "technique",
      "precautions": ["precaution1", "precaution2"],
      "expectedOutcome": "outcome",
      "whenToStop": "whenToStop"
    }]
  }]
}`;

      // If there's an image, analyze it first
      let imageAnalysis = '';
      if (image) {
        const imageBuffer = await image.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        const imageResponse = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "As a medical imaging expert, provide a detailed clinical analysis of this image. Focus on:\n1. Visible anatomical structures and their condition\n2. Any pathological findings or abnormalities\n3. Quality and diagnostic value of the image\n4. Additional views or imaging modalities needed\n5. Specific measurements or features to note\n6. Comparison with normal findings\nProvide a detailed medical analysis using proper medical terminology." 
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${image.type};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        });

        imageAnalysis = imageResponse.choices[0].message.content || '';
      }

      // Get the final analysis
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a senior medical consultant with extensive clinical experience. Your analysis should be thorough, accurate, and use proper medical terminology. Focus on providing clinically useful information that healthcare providers can use for diagnosis and treatment planning. Always prioritize patient safety and recommend immediate medical attention when necessary. Include specific clinical observations, measurements, and medical terminology in your analysis."
          },
          {
            role: "user",
            content: imageAnalysis 
              ? `${prompt}\n\nAdditional image analysis: ${imageAnalysis}`
              : prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2000,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');

      // Validate and ensure all required fields are present
      const validatedAnalysis = {
        ...analysis,
        clinicalAssessment: {
          ...analysis.clinicalAssessment,
          vitalSigns: analysis.clinicalAssessment?.vitalSigns || {
            temperature: 'Not measured',
            bloodPressure: 'Not measured',
            heartRate: 'Not measured',
            respiratoryRate: 'Not measured',
            oxygenSaturation: 'Not measured'
          },
          severityScore: analysis.clinicalAssessment?.severityScore || 0,
          painScale: analysis.clinicalAssessment?.painScale || 0
        },
        differentialDiagnosis: analysis.differentialDiagnosis || {
          mostLikely: [],
          alternatives: [],
          toRuleOut: []
        },
        requiredTests: analysis.requiredTests || [],
        monitoringParameters: analysis.monitoringParameters || [],
        treatmentPlanSuggestions: analysis.treatmentPlanSuggestions || {
          immediate: [],
          shortTerm: [],
          longTerm: []
        },
        patientEducation: analysis.patientEducation || []
      };

      return NextResponse.json(validatedAnalysis);
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError);
      
      // Handle rate limits and quota issues
      if (apiError.code === 'insufficient_quota' || 
          apiError.code === 'rate_limit_exceeded' || 
          apiError.status === 429 || 
          apiError.message?.includes('rate limit') ||
          apiError.message?.includes('quota')) {
        
        console.log('Using fallback analysis due to API limitations');
        const fallbackResponse = getFallbackResponse(symptoms, 'General Medicine');
        
        return NextResponse.json({
          ...fallbackResponse,
          _fallback: true,
          _message: 'Using basic analysis due to high service demand. For more detailed analysis, please try again in a few minutes.'
        });
      }
      
      // Handle other API errors
      if (apiError.code === 'model_not_found') {
        return NextResponse.json(
          { error: 'AI model configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      
      if (apiError.code === 'invalid_api_key') {
        return NextResponse.json(
          { error: 'AI service configuration error. Please contact support.' },
          { status: 500 }
        );
      }

      // For other errors, return a generic error message
      return NextResponse.json(
        { error: 'Failed to analyze symptoms. Please try again in a few minutes.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Handle specific OpenAI API errors
    if (error.code === 'model_not_found') {
      return NextResponse.json(
        { error: 'AI model configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze symptoms. Please try again.' },
      { status: 500 }
    );
  }
} 