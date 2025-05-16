import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback response for when API is unavailable
const getFallbackResponse = (symptoms: string, specialties: string[]) => {
  // Simple keyword-based analysis
  const lowerSymptoms = symptoms.toLowerCase();
  const emergencyKeywords = ['severe', 'extreme', 'unbearable', 'emergency', 'critical', 'acute'];
  const urgentKeywords = ['moderate', 'significant', 'persistent', 'worsening'];
  
  const hasEmergency = emergencyKeywords.some(keyword => lowerSymptoms.includes(keyword));
  const hasUrgent = urgentKeywords.some(keyword => lowerSymptoms.includes(keyword));
  
  const priority = hasEmergency ? 'High' : hasUrgent ? 'Medium' : 'Low';
  const immediateAttention = hasEmergency ? 'Required' : 'Not Required';
  
  // Basic specialty matching
  const matchedSpecialties = specialties.filter(specialty => {
    const lowerSpecialty = specialty.toLowerCase();
    return lowerSymptoms.includes(lowerSpecialty) || 
           (lowerSpecialty.includes('general') && priority === 'High');
  });

  // Extract symptoms from the input
  const symptomsList = symptoms.split(/[.,]/).map(s => s.trim()).filter(Boolean);
  const primarySymptoms = symptomsList.slice(0, 3);
  const associatedSymptoms = symptomsList.slice(3, 6);

  return {
    priority,
    recommendedSpecialties: matchedSpecialties.length > 0 ? matchedSpecialties : ['General Medicine'],
    description: `Based on the symptoms described: "${symptoms}", we recommend ${priority.toLowerCase()} priority attention. ${
      immediateAttention === 'Required' 
        ? 'Please seek immediate medical attention.' 
        : 'Schedule an appointment with your healthcare provider.'
    }`,
    immediateAttention,
    riskFactors: ['Unable to perform detailed risk assessment at this time'],
    potentialConditions: ['Unable to perform detailed condition analysis at this time'],
    recommendedActions: [
      immediateAttention === 'Required' 
        ? 'Seek immediate medical attention'
        : 'Schedule an appointment with your healthcare provider',
      'Keep track of any changes in symptoms',
      'Prepare a detailed symptom history for your doctor'
    ],
    clinicalAssessment: {
      primarySymptoms,
      associatedSymptoms,
      duration: 'Not specified',
      progression: 'Not specified',
      aggravatingFactors: ['Unable to determine at this time'],
      relievingFactors: ['Unable to determine at this time'],
      redFlags: hasEmergency ? ['Severe symptoms requiring immediate attention'] : [],
      vitalSigns: {
        temperature: 'Not measured',
        bloodPressure: 'Not measured',
        heartRate: 'Not measured',
        respiratoryRate: 'Not measured',
        oxygenSaturation: 'Not measured'
      },
      severityScore: hasEmergency ? 8 : hasUrgent ? 5 : 3,
      painScale: hasEmergency ? 7 : hasUrgent ? 4 : 2
    },
    differentialDiagnosis: {
      mostLikely: ['Unable to determine without detailed analysis'],
      alternatives: ['Unable to determine without detailed analysis'],
      toRuleOut: ['Unable to determine without detailed analysis'],
      probabilityScores: {},
      keyFindings: ['Unable to determine without detailed analysis']
    },
    requiredTests: [
      'Complete Blood Count (CBC)',
      'Basic Metabolic Panel',
      'Urinalysis'
    ],
    monitoringParameters: [
      'Temperature',
      'Blood Pressure',
      'Heart Rate',
      'Pain Level',
      'Symptom Progression'
    ],
    treatmentOptions: {
      immediate: [
        immediateAttention === 'Required' 
          ? 'Seek immediate medical attention'
          : 'Schedule an appointment with your healthcare provider',
        'Rest and stay hydrated',
        'Monitor symptoms closely'
      ],
      shortTerm: [
        'Follow up with healthcare provider',
        'Take prescribed medications as directed',
        'Maintain symptom diary'
      ],
      longTerm: [
        'Regular follow-up appointments',
        'Lifestyle modifications as recommended',
        'Preventive care measures'
      ],
      medications: []
    },
    followUpPlan: {
      timeline: 'Schedule follow-up within 1 week',
      milestones: [
        'Initial medical evaluation',
        'Diagnostic test completion',
        'Treatment plan implementation'
      ],
      warningSigns: [
        'Worsening of symptoms',
        'New symptoms development',
        'Severe pain or discomfort'
      ],
      lifestyleModifications: [
        'Maintain regular sleep schedule',
        'Stay hydrated',
        'Follow prescribed treatment plan'
      ]
    },
    emergencyProtocol: {
      whenToSeekHelp: [
        'Severe pain or discomfort',
        'Difficulty breathing',
        'Sudden changes in symptoms',
        'High fever'
      ],
      emergencyContacts: [
        'Emergency Services: 911',
        'Local Emergency Room',
        'Primary Care Provider'
      ],
      firstAidSteps: [
        'Stay calm and assess the situation',
        'Call emergency services if needed',
        'Follow basic first aid guidelines',
        'Keep the patient comfortable'
      ]
    },
    patientEducation: [
      'Understanding your symptoms',
      'When to seek medical attention',
      'Basic self-care measures',
      'Importance of follow-up care'
    ]
  };
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const symptoms = formData.get('symptoms') as string;
    const image = formData.get('image') as File | null;
    const specialties = JSON.parse(formData.get('specialties') as string) as string[];

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms description is required' },
        { status: 400 }
      );
    }

    // Prepare the prompt for ChatGPT
    const prompt = `As a senior medical consultant with extensive clinical experience, provide a comprehensive medical analysis of the following symptoms. Your response must be in JSON format with the specified fields. This analysis will be used by healthcare providers to make clinical decisions.

Symptoms: ${symptoms}

Available specialties: ${specialties.join(', ')}

Please provide a detailed clinical analysis considering:

1. Clinical Assessment
   - Primary symptoms and their characteristics
   - Associated symptoms and their relationships
   - Symptom duration, progression, and pattern
   - Aggravating and relieving factors
   - Impact on vital signs and general condition
   - Red flag symptoms and warning signs

2. Differential Diagnosis
   - Most likely diagnoses (in order of probability)
   - Alternative diagnoses to consider
   - Conditions to rule out
   - Risk factors and predisposing conditions
   - Comorbidities to consider
   - Age and gender-specific considerations

3. Severity and Urgency Assessment
   - Immediate medical attention required (Yes/No)
   - Risk level (Low/Medium/High)
   - Potential complications if untreated
   - Time sensitivity of intervention
   - Required level of care (Primary/Secondary/Tertiary)
   - Monitoring requirements

4. Impact Assessment
   - Effect on activities of daily living
   - Quality of life impact
   - Functional limitations
   - Work/school impact
   - Social impact
   - Psychological impact

5. Recommended Clinical Actions
   - Immediate steps required
   - Diagnostic tests needed
   - Monitoring parameters
   - When to seek emergency care
   - Preventive measures
   - Follow-up requirements
   - Patient education points

6. Specialized Care Requirements
   - Required medical specialties
   - Type of medical facility needed
   - Required expertise level
   - Multidisciplinary team needs
   - Equipment and resources needed
   - Follow-up care requirements

IMPORTANT: Respond in this exact JSON format, with no additional text:
{
  "priority": "Low|Medium|High",
  "recommendedSpecialties": ["specialty1", "specialty2", "specialty3"],
  "description": "Detailed clinical analysis including symptom assessment, differential diagnosis, severity evaluation, and recommended actions. Include specific clinical observations and medical terminology.",
  "immediateAttention": "Required|Not Required",
  "riskFactors": ["factor1", "factor2"],
  "potentialConditions": ["condition1", "condition2"],
  "recommendedActions": ["action1", "action2"],
  "clinicalAssessment": {
    "primarySymptoms": ["symptom1", "symptom2"],
    "associatedSymptoms": ["symptom1", "symptom2"],
    "duration": "description",
    "progression": "description",
    "aggravatingFactors": ["factor1", "factor2"],
    "relievingFactors": ["factor1", "factor2"],
    "redFlags": ["flag1", "flag2"]
  },
  "differentialDiagnosis": {
    "mostLikely": ["diagnosis1", "diagnosis2"],
    "alternatives": ["diagnosis1", "diagnosis2"],
    "toRuleOut": ["condition1", "condition2"]
  },
  "requiredTests": ["test1", "test2"],
  "monitoringParameters": ["parameter1", "parameter2"],
  "patientEducation": ["point1", "point2"]
}`;

    try {
      // If there's an image, analyze it first
      let imageAnalysis = '';
      if (image) {
        const imageBuffer = await image.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        const imageResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
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
        priority: analysis.priority || 'Medium',
        recommendedSpecialties: analysis.recommendedSpecialties || [],
        description: analysis.description || 'No detailed analysis available.',
        immediateAttention: analysis.immediateAttention || 'Not Required',
        riskFactors: analysis.riskFactors || [],
        potentialConditions: analysis.potentialConditions || [],
        recommendedActions: analysis.recommendedActions || [],
        clinicalAssessment: analysis.clinicalAssessment || {
          primarySymptoms: [],
          associatedSymptoms: [],
          duration: 'Not specified',
          progression: 'Not specified',
          aggravatingFactors: [],
          relievingFactors: [],
          redFlags: [],
          vitalSigns: {
            temperature: 'Not measured',
            bloodPressure: 'Not measured',
            heartRate: 'Not measured',
            respiratoryRate: 'Not measured',
            oxygenSaturation: 'Not measured'
          },
          severityScore: 0,
          painScale: 0
        },
        differentialDiagnosis: analysis.differentialDiagnosis || {
          mostLikely: [],
          alternatives: [],
          toRuleOut: [],
          probabilityScores: {},
          keyFindings: []
        },
        requiredTests: analysis.requiredTests || [],
        monitoringParameters: analysis.monitoringParameters || [],
        patientEducation: analysis.patientEducation || [],
        treatmentOptions: analysis.treatmentOptions || {
          immediate: [],
          shortTerm: [],
          longTerm: [],
          medications: []
        },
        followUpPlan: analysis.followUpPlan || {
          timeline: 'Not specified',
          milestones: [],
          warningSigns: [],
          lifestyleModifications: []
        },
        emergencyProtocol: analysis.emergencyProtocol || {
          whenToSeekHelp: [],
          emergencyContacts: [],
          firstAidSteps: []
        }
      };

      return NextResponse.json(validatedAnalysis);
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError);
      
      // If we hit quota or other API issues, use fallback
      if (apiError.code === 'insufficient_quota' || apiError.code === 'rate_limit_exceeded') {
        console.log('Using fallback analysis due to API limitations');
        const fallbackResponse = getFallbackResponse(symptoms, specialties);
        return NextResponse.json({
          ...fallbackResponse,
          _fallback: true,
          _message: 'Using basic analysis due to high service demand. For more detailed analysis, please try again later.'
        });
      }
      
      throw apiError; // Re-throw other API errors
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