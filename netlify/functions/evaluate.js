// Netlify function to evaluate dispatch report against call transcript

const ELEVENLABS_API_KEY = process.env.E11LABS_HACK;
const OPENAI_API_KEY = process.env.OPEN_AI;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { conversationId, dispatchReport } = JSON.parse(event.body);

    if (!conversationId || !dispatchReport) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing conversationId or dispatchReport' }),
      };
    }

    const { transcript, transcriptFormatted } = await fetchTranscript(conversationId);
    const evaluation = await evaluateWithAI(transcript, dispatchReport);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ...evaluation,
        transcript: transcriptFormatted,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Evaluation failed', details: error.message }),
    };
  }
}

async function fetchTranscript(conversationId) {
  const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;

  const response = await fetch(url, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch transcript: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const messages = data.transcript || data.messages || [];

  const transcript = messages
    .map((msg) => `${msg.role || msg.speaker}: ${msg.message || msg.text || msg.content}`)
    .join('\n');

  const transcriptFormatted = messages.map((msg) => ({
    role: msg.role === 'agent' || msg.speaker === 'agent' ? 'Caller' : 'You',
    message: msg.message || msg.text || msg.content,
  }));

  return { transcript, transcriptFormatted };
}

async function evaluateWithAI(transcript, dispatchReport) {
  const prompt = `You are an expert emergency dispatch trainer evaluating a trainee's performance.

CALL TRANSCRIPT:
${transcript}

TRAINEE'S DISPATCH REPORT:
- Caller Name: ${dispatchReport.callerName}
- Emergency Address: ${dispatchReport.address}
- Severity: ${dispatchReport.severity}
- Situation: ${dispatchReport.situation}
- Units Dispatched: ${dispatchReport.units.join(', ')}

EVALUATION CRITERIA:
1. Did the trainee correctly identify the caller's name? (if mentioned)
2. Did they get the correct address/location?
3. Is the severity assessment appropriate for the situation?
4. Does the situation description capture the key facts?
5. Are the dispatched units appropriate for this emergency?

Score from 1-5:
- 5 = Excellent: All critical information correct, appropriate response
- 4 = Good: Most information correct, minor omissions
- 3 = Mixed: Some correct, some incorrect or missing
- 2 = Poor: Significant errors or omissions
- 1 = Fail: Wrong response or critical information missing

Respond with ONLY valid JSON in this exact format:
{
  "score": <number 1-5>,
  "verdict": "<excellent|good|mixed|poor|fail>",
  "feedback": "<2-3 sentences explaining what they did well and what could improve>"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an emergency dispatch evaluation system. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (parseError) {
    return {
      score: 3,
      verdict: 'mixed',
      feedback: 'Unable to fully evaluate the response. Please try again.',
    };
  }
}
