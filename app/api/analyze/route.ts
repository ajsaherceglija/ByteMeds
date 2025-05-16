import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const prompt = `As a medical AI assistant, analyze the following symptoms and provide a detailed assessment. Respond with a JSON object containing "priority", "recommendedSpecialties", and "description" fields.

Symptoms: ${symptoms}

Available specialties: ${specialties.join(', ')}

Consider the following in your analysis:
1. Severity and urgency of symptoms
2. Potential risk factors
3. Impact on daily life
4. Need for immediate medical attention
5. Possible conditions or diagnoses
6. Recommended next steps

Respond in this exact JSON format:
{
  "priority": "Low|Medium|High",
  "recommendedSpecialties": ["specialty1", "specialty2", "specialty3"],
  "description": "Detailed analysis of the symptoms, potential conditions, and recommended actions"
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
              { type: "text", text: "Analyze this medical image and describe any visible symptoms or conditions. Be concise." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${image.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      imageAnalysis = imageResponse.choices[0].message.content || '';
    }

    // Get the final analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "user",
          content: imageAnalysis 
            ? `${prompt}\n\nAdditional image analysis: ${imageAnalysis}`
            : prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
} 