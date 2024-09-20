const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { linkedinProfile, jobDescription } = JSON.parse(event.body);

    const data = JSON.stringify({
      linkedinProfile,
      jobDescription
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Resume generation request received',
        estimatedCompletionTime: '5 minutes',
        hookResponse: JSON.parse(response.body)
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate resume' }) };
  }
};