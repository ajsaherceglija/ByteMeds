import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const COOLDOWN_PERIOD = 10000; // 10 seconds in milliseconds
const MAX_FILE_SIZE = 1024 * 1024; // 1MB per file
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB total
const MAX_FILES = 10; // Maximum number of files
let lastRequestTime = 0;

export async function POST(request: Request) {
  try {
    // Check if we need to wait due to rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < COOLDOWN_PERIOD) {
      const waitTime = COOLDOWN_PERIOD - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const formData = await request.formData();
    const files = [];
    let totalSize = 0;

    // Collect all files from the form data
    for (let i = 0; formData.get(`file${i}`); i++) {
      if (i >= MAX_FILES) {
        return NextResponse.json(
          { error: `Maximum number of files (${MAX_FILES}) exceeded` },
          { status: 400 }
        );
      }

      const file = formData.get(`file${i}`) as File;
      
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 1MB` },
          { status: 400 }
        );
      }

      totalSize += file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        return NextResponse.json(
          { error: 'Total file size exceeds 5MB limit' },
          { status: 400 }
        );
      }

      files.push(file);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Process each file and extract text content
    const fileContents = await Promise.all(files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return {
        name: file.name,
        content: text.slice(0, 15000) // Limit content per file to avoid token limits
      };
    }));

    // Combine all file contents into a single prompt with clear separation
    const combinedContent = fileContents.map(file => 
      `### Document: ${file.name} ###\n\n${file.content}\n\n`
    ).join('----------------------------------------\n\n');

    // Update last request time before making the API call
    lastRequestTime = Date.now();

    // Generate summary using OpenAI with retry logic
    let completion;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-16k", // Using 16k model for larger context
          messages: [
            {
              role: "system",
              content: "You are a professional document summarizer. Analyze the provided documents and create a concise summary highlighting the most important information. Each document is separated by clear markers. Create a comprehensive summary that covers all documents while highlighting unique aspects from each. Format your response as JSON with a title, content (main summary), and keyPoints (array of important bullet points)."
            },
            {
              role: "user",
              content: `Please summarize the following documents:\n\n${combinedContent}`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 2000,
        });
        break; // If successful, exit the retry loop
      } catch (error: any) {
        retryCount++;
        if (error.code === 'rate_limit_exceeded' || error.status === 429) {
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
            continue;
          }
        }
        throw error;
      }
    }

    if (!completion) {
      throw new Error('Failed to generate summary after multiple attempts');
    }

    const summary = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      title: summary.title || 'Multiple Document Summary',
      content: summary.content || 'No summary content available.',
      keyPoints: summary.keyPoints || []
    });

  } catch (error: any) {
    console.error('Summarization error:', error);
    
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return NextResponse.json(
        { error: 'Service is currently busy. Please wait a few seconds and try again.' },
        { status: 429 }
      );
    }

    if (error.code === 'model_not_found' || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    if (error.message?.includes('context length')) {
      return NextResponse.json(
        { error: 'Documents are too large. Please try with smaller or fewer documents.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
} 