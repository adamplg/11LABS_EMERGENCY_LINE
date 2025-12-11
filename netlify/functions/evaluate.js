// Netlify function to evaluate dispatch report against call transcript

const ELEVENLABS_API_KEY = process.env.E11LABS_HACK;
const OPENAI_API_KEY = process.env.OPEN_AI;

export async function handler(event) {
  console.log('=== EVALUATE FUNCTION START ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Has E11LABS_HACK:', !!ELEVENLABS_API_KEY);
  console.log('Has OPEN_AI:', !!OPENAI_API_KEY);

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    console.log('ERROR: Method not allowed');
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Parsing request body...');
    const { conversationId, dispatchReport } = JSON.parse(event.body);
    console.log('ConversationId:', conversationId);
    console.log('DispatchReport:', JSON.stringify(dispatchReport, null, 2));

    if (!conversationId || !dispatchReport) {
      console.log('ERROR: Missing conversationId or dispatchReport');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing conversationId or dispatchReport' }),
      };
    }

    // Fetch conversation transcript from ElevenLabs
    console.log('Fetching transcript from ElevenLabs...');
    const { transcript, transcriptFormatted } = await fetchTranscript(conversationId);
    console.log('Transcript fetched successfully');
    console.log('Raw transcript length:', transcript.length);
    console.log('Formatted messages count:', transcriptFormatted.length);

    // Use OpenAI to evaluate the dispatch report against the transcript
    console.log('Calling OpenAI for evaluation...');
    const evaluation = await evaluateWithAI(transcript, dispatchReport);
    console.log('Evaluation result:', JSON.stringify(evaluation, null, 2));

    // Include transcript in response
    console.log('=== EVALUATE FUNCTION SUCCESS ===');
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
    console.error('=== EVALUATE FUNCTION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Evaluation failed', details: error.message }),
    };
  }
}

async function fetchTranscript(conversationId) {
  console.log('--- fetchTranscript START ---');
  console.log('Fetching from ElevenLabs API for conversationId:', conversationId);

  const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
  console.log('API URL:', url);

  const response = await fetch(url, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  });

  console.log('ElevenLabs response status:', response.status);
  console.log('ElevenLabs response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs error response:', errorText);
    throw new Error(`Failed to fetch transcript: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('ElevenLabs full response data:', JSON.stringify(data, null, 2));

  // Extract transcript from conversation data
  // The structure may vary - adjust based on actual API response
  const messages = data.transcript || data.messages || [];
  console.log('Extracted messages array:', JSON.stringify(messages, null, 2));

  // Raw transcript for AI evaluation
  const transcript = messages
    .map((msg) => `${msg.role || msg.speaker}: ${msg.message || msg.text || msg.content}`)
    .join('\n');
  console.log('Raw transcript for AI:', transcript);

  // Formatted transcript for display (with proper labels)
  const transcriptFormatted = messages.map((msg) => ({
    role: msg.role === 'agent' || msg.speaker === 'agent' ? 'Caller' : 'You',
    message: msg.message || msg.text || msg.content,
  }));
  console.log('Formatted transcript:', JSON.stringify(transcriptFormatted, null, 2));

  console.log('--- fetchTranscript END ---');
  return { transcript, transcriptFormatted };
}

async function evaluateWithAI(transcript, dispatchReport) {
  console.log('--- evaluateWithAI START ---');

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

  console.log('OpenAI prompt length:', prompt.length);
  console.log('Calling OpenAI API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
      temperature: 0.3,
    }),
  });

  console.log('OpenAI response status:', response.status);
  console.log('OpenAI response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI error response:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenAI full response:', JSON.stringify(data, null, 2));

  const content = data.choices[0].message.content;
  console.log('OpenAI content:', content);

  // Parse the JSON response
  try {
    const parsed = JSON.parse(content);
    console.log('Parsed evaluation:', JSON.stringify(parsed, null, 2));
    console.log('--- evaluateWithAI END ---');
    return parsed;
  } catch (parseError) {
    // If JSON parsing fails, return a default response
    console.error('Failed to parse AI response:', content);
    console.error('Parse error:', parseError.message);
    console.log('--- evaluateWithAI END (with parse error) ---');
    return {
      score: 3,
      verdict: 'mixed',
      feedback: 'Unable to fully evaluate the response. Please try again.',
    };
  }
}
