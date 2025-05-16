import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker';
import mammoth from 'mammoth';

if (typeof window === 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

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

// Function to extract text from PDF
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer));
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through each page
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to read PDF content');
  }
}

// Function to extract text from DOCX
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to read DOCX content');
  }
}

// Function to extract text based on file type
async function extractText(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const fileType = file.type;
    
    switch (fileType) {
      case 'application/pdf':
        return await extractPdfText(buffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractDocxText(buffer);
      
      case 'text/plain':
        return new TextDecoder().decode(buffer).trim();
      
      case 'application/msword':
        throw new Error('Legacy .doc files are not supported. Please convert to .docx');
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error: any) {
    throw new Error(`Error processing ${file.name}: ${error.message}`);
  }
}

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
      
      if (!file || !file.size) {
        continue; // Skip invalid files
      }
      
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
      try {
        console.log(`Processing file: ${file.name}, type: ${file.type}`);
        const text = await extractText(file);
        console.log(`Successfully extracted text from ${file.name}`);
        return {
          name: file.name,
          content: text.slice(0, 15000) // Limit content per file to avoid token limits
        };
      } catch (error: any) {
        console.error(`Error processing ${file.name}:`, error);
        throw new Error(`Error processing ${file.name}: ${error.message}`);
      }
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
      { error: error.message || 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
} 