// Test the API locally
const handler = require('./api/generate-report.js');

// Mock request and response objects
const mockReq = {
    method: 'POST',
    body: {
        studentName: 'John Doe',
        studentId: '12345',
        course: 'Computer Science Engineering',
        semester: 'Final Year',
        institution: 'Test University',
        supervisor: 'Dr. Jane Smith',
        projectTitle: 'AI Report Generator',
        projectDescription: 'A web application that generates academic reports using AI',
        reportType: 'project',
        targetWordCount: '15000'
    }
};

const mockRes = {
    setHeader: (key, value) => console.log(`Header: ${key} = ${value}`),
    status: (code) => ({
        json: (data) => console.log(`Status ${code}:`, data),
        end: () => console.log(`Status ${code}: Request ended`)
    }),
    send: (data) => {
        console.log(`✅ Success! Generated ${data.length} bytes`);
        console.log('📄 Report generated successfully!');
    }
};

console.log('🧪 Testing API...');
handler(mockReq, mockRes).catch(console.error);