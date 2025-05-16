import { NextResponse } from 'next/server';

export async function GET() {
  // Generate a simple SVG avatar
  const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" fill="#e2e8f0"/>
    <circle cx="64" cy="64" r="60" fill="#94a3b8"/>
    <circle cx="64" cy="48" r="24" fill="#e2e8f0"/>
    <path d="M64 80 C 44 80 28 96 28 116 L 100 116 C 100 96 84 80 64 80" fill="#e2e8f0"/>
  </svg>`;

  // Convert SVG to base64
  const svgBuffer = Buffer.from(svg);

  // Return the SVG with proper headers
  return new NextResponse(svgBuffer, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
} 