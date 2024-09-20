const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { linkedinProfile, jobDescription } = JSON.parse(event.body);

    const response = await fetch('https://hook.us2.make.com/fzgdwjea416kn74694x7it4awaeeapen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ linkedinProfile, jobDescription }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Resume generation request received',
        estimatedCompletionTime: '5 minutes',
        hookResponse: data
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate resume' }) };
  }
};
