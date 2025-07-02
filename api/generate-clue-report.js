// api/generate-clue-report.js

export default async function handler(req, res) {
  const startTime = Date.now();
  console.log(`🚀 Function started at: ${new Date().toISOString()}`);

  // CORS headers - MUST be consistent across all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS request handled in ${Date.now() - startTime}ms`);
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`❌ Invalid method: ${req.method}`);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse request body (Vercel automatically parses req.body)
    const parseStartTime = Date.now();
    const { prompt, transcript } = req.body;
    console.log(`⏱️  Request parsing took: ${Date.now() - parseStartTime}ms`);
    
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Missing API key');
      return res.status(500).json({ error: 'API key not configured' });
    }

    if (!prompt || !transcript) {
      console.log(`❌ Missing data - prompt: ${!!prompt}, transcript: ${!!transcript}`);
      return res.status(400).json({ error: 'Missing prompt or transcript' });
    }

    console.log(`📝 Prompt length: ${prompt.length} characters`);
    console.log(`📝 Transcript length: ${transcript.length} characters`);
    console.log(`📝 Total input size: ${(prompt + transcript).length} characters`);
    console.log(`🎯 Max tokens set to: 1500`);
    console.log(`🤖 Using Claude Opus 4 for maximum quality`);

    const apiCallStartTime = Date.now();
    console.log(`🌐 Starting Claude API call at: ${new Date().toISOString()}`);

    // Call Claude API with NO timeout limits - let Vercel's 60s limit handle it
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',  // Latest Opus 4
        max_tokens: 1500,  // High quality output
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nDiscovery Call Transcript:\n${transcript}`
          }
        ]
      })
    });

    const apiCallDuration = Date.now() - apiCallStartTime;
    console.log(`🌐 Claude API call completed in: ${apiCallDuration}ms (${(apiCallDuration/1000).toFixed(2)}s)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Claude API error: ${response.status}`, errorText);
      return res.status(response.status).json({ 
        error: 'API request failed', 
        details: errorText 
      });
    }

    const parseResponseStartTime = Date.now();
    const data = await response.json();
    console.log(`📥 Response parsing took: ${Date.now() - parseResponseStartTime}ms`);
    
    // Extract the content from Claude's response
    const report = data.content?.[0]?.text || 'No content received';

    const totalDuration = Date.now() - startTime;
    console.log(`📊 Report generated successfully!`);
    console.log(`📊 Report length: ${report.length} characters`);
    console.log(`📊 Total function duration: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
    console.log(`🎉 Function completed at: ${new Date().toISOString()}`);

    return res.status(200).json({ 
      report,
      timing: {
        totalDuration: totalDuration,
        apiCallDuration: apiCallDuration,
        totalSeconds: (totalDuration/1000).toFixed(2)
      }
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ Function error after ${totalDuration}ms:`, error);

    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      timing: {
        totalDuration: totalDuration,
        totalSeconds: (totalDuration/1000).toFixed(2)
      }
    });
  }
}