# AI Report Generator

A web application that generates comprehensive academic reports using AI.

## Features

- Generate professional academic reports
- AI-powered content creation
- DOCX file output
- Modern web interface

## Deployment

This project is designed for Vercel deployment with serverless functions.

### Required Files for Deployment:

```
├── package.json
├── vercel.json
├── api/
│   ├── index.js
│   └── generate-report.js
└── public/
    └── index.html
```

### Deploy to Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

## API Endpoints

- `GET /api/` - Health check
- `POST /api/generate-report` - Generate and download report

## Usage

1. Visit the deployed URL
2. Fill out the form with project details
3. Click "Generate Report"
4. Download the generated DOCX file