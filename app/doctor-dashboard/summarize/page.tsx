'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface Summary {
  title: string;
  content: string;
  keyPoints: string[];
}

export default function SummarizePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check total number of files
    if (files.length + acceptedFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    // Calculate total size including existing files
    const existingSize = files.reduce((total, file) => total + file.size, 0);
    const newTotalSize = acceptedFiles.reduce((total, file) => total + file.size, 0) + existingSize;

    if (newTotalSize > 5 * 1024 * 1024) {
      toast.error('Total file size cannot exceed 5MB');
      return;
    }

    // Filter out unsupported file types and large files
    const supportedFiles = acceptedFiles.filter(file => {
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/msword'
      ];

      if (!supportedTypes.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.name}`);
        return false;
      }

      if (file.size > 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 1MB)`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...supportedFiles]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateSummary = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsGenerating(true);
    setRetryCount(0);

    const attemptSummary = async () => {
      try {
        const formData = new FormData();
        files.forEach((file, index) => {
          // Append each file with a unique key
          formData.append(`file${index}`, file, file.name);
        });

        const response = await fetch('/api/doctor/summarize', {
          method: 'POST',
          body: formData,
          // Remove the Content-Type header - let the browser set it with the boundary
        });

        if (!response.ok) {
          const error = await response.json();
          
          // Handle rate limiting
          if (response.status === 429 && retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            const waitTime = (retryCount + 1) * 2000; // Progressive backoff
            
            toast.info(`Service is busy. Retrying in ${waitTime/1000} seconds...`);
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return attemptSummary(); // Retry the request
          }
          
          throw new Error(error.error || 'Failed to generate summary');
        }

        const result = await response.json();
        setSummary(result);
        toast.success('Summary generated successfully');
        setRetryCount(0); // Reset retry count on success
      } catch (error: any) {
        console.error('Summary generation error:', error);
        toast.error(error.message || 'Failed to generate summary');
        setRetryCount(0); // Reset retry count on final error
      } finally {
        setIsGenerating(false);
      }
    };

    attemptSummary();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Document Summarizer</CardTitle>
          <CardDescription>
            Upload documents to generate an AI-powered summary of their contents.
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Retry attempt {retryCount} of {maxRetries}...
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
              hover:border-primary hover:bg-primary/5`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-muted-foreground">
                {isDragActive ? (
                  <p>Drop the files here</p>
                ) : (
                  <p>Drag and drop files here, or click to select files</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Supported formats: PDF, DOCX, DOC, TXT</p>
                <p>Maximum 10 files, 1MB per file, 5MB total</p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Uploaded Files</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating || files.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>

          {summary && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{summary.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {summary.content}
                    </p>
                  </div>
                  {summary.keyPoints.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Points</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.keyPoints.map((point, index) => (
                          <li key={index} className="text-muted-foreground">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 