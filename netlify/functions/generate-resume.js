const https = require('https');

function extractKeyInfo(jobDescription) {
  // Split the text into lines
  const lines = jobDescription.split('\n');
  
  // Initialize variables to store key information
  let title = '';
  let company = '';
  let requirements = [];
  let responsibilities = [];

  // Flag to track when we're in the requirements or responsibilities section
  let inRequirements = false;
  let inResponsibilities = false;

  // Process each line
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.toLowerCase().includes('job title:')) {
      title = trimmedLine.split(':')[1].trim();
    } else if (trimmedLine.toLowerCase().includes('company:')) {
      company = trimmedLine.split(':')[1].trim();
    } else if (trimmedLine.toLowerCase().includes('requirements:')) {
      inRequirements = true;
      inResponsibilities = false;
    } else if (trimmedLine.toLowerCase().includes('responsibilities:')) {
      inRequirements = false;
      inResponsibilities = true;
    } else if (inRequirements && trimmedLine.startsWith('-')) {
      requirements.push(trimmedLine.substring(1).trim());
    } else if (inResponsibilities && trimmedLine.startsWith('-')) {
      responsibilities.push(trimmedLine.substring(1).trim());
    }
  }

  // Limit the number of requirements and responsibilities
  const maxItems = 5;
  requirements = requirements.slice(0, maxItems);
  responsibilities = responsibilities.slice(0, maxItems);

  // Construct the summarized job description
  return {
    title,
    company,
    requirements,
    responsibilities
  };
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { jobDescription, linkedinProfile } = JSON.parse(event.body);

    if (!jobDescription || !linkedinProfile) {
      throw new Error('Missing required fields');
    }

    // Extract key information from the job description
    const extractedJobInfo = extractKeyInfo(jobDescription);

    const data = JSON.stringify({
      jobDescription: extractedJobInfo,
      linkedinProfile: linkedinProfile // Keeping this unchanged
    });

    const options = {
      hostname: 'hook.us2.make.com',
      port: 443,
      path: '/fzgdwjea416kn74694x7it4awaeeapen',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });

    if (response.statusCode !== 200) {
      throw new Error(`Webhook responded with status ${response.statusCode}: ${response.body}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Resume generation request received',
        estimatedCompletionTime: '5 minutes',
        hookResponse: JSON.parse(response.body)
      }),
    };
  } catch (error) {
    console.error('Error in generate-resume function:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Failed to generate resume',
        details: error.message
      }) 
    };
  }
};