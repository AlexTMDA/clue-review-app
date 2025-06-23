// netlify/functions/generate-clue-report.js

exports.handler = async (event, context) => {
  const startTime = Date.now();
  console.log(`🚀 Function started at: ${new Date().toISOString()}`);
  
  // Set longer timeout for this function
  context.callbackWaitsForEmptyEventLoop = false;
  
  // CORS headers - MUST be consistent across all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log(`✅ OPTIONS request handled in ${Date.now() - startTime}ms`);
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    console.log(`❌ Invalid method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Parse request body
    const parseStartTime = Date.now();
    const { prompt, transcript } = JSON.parse(event.body);
    console.log(`⏱️  Request parsing took: ${Date.now() - parseStartTime}ms`);
    
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Missing API key");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" })
      };
    }

    if (!prompt || !transcript) {
      console.log(`❌ Missing data - prompt: ${!!prompt}, transcript: ${!!transcript}`);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing prompt or transcript" })
      };
    }

    console.log(`📝 Prompt length: ${prompt.length} characters`);
    console.log(`📝 Transcript length: ${transcript.length} characters`);
    console.log(`📝 Total input size: ${(prompt + transcript).length} characters`);
    console.log(`🎯 Max tokens set to: 300`);

    const apiCallStartTime = Date.now();
    console.log(`🌐 Starting Claude API call at: ${new Date().toISOString()}`);

    // Call Claude API with timeout handling
    const response = await Promise.race([
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: `${prompt}\n\nDiscovery Call Transcript:\n${transcript}`
            }
          ]
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 8 seconds')), 8000)
      )
    ]);

    const apiCallDuration = Date.now() - apiCallStartTime;
    console.log(`🌐 Claude API call completed in: ${apiCallDuration}ms (${(apiCallDuration/1000).toFixed(2)}s)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Claude API error: ${response.status}`, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: "API request failed", 
          details: errorText 
        })
      };
    }

    const parseResponseStartTime = Date.now();
    const data = await response.json();
    console.log(`📥 Response parsing took: ${Date.now() - parseResponseStartTime}ms`);
    
    // Extract the content from Claude's response
    const report = data.content?.[0]?.text || "No content received";

    const totalDuration = Date.now() - startTime;
    console.log(`📊 Report generated successfully!`);
    console.log(`📊 Report length: ${report.length} characters`);
    console.log(`📊 Total function duration: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
    console.log(`🎉 Function completed at: ${new Date().toISOString()}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        report,
        timing: {
          totalDuration: totalDuration,
          apiCallDuration: apiCallDuration,
          totalSeconds: (totalDuration/1000).toFixed(2)
        }
      })
    };

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ Function error after ${totalDuration}ms:`, error);
    
    // Handle timeout specifically
    if (error.message === 'Request timeout after 8 seconds') {
      console.log(`⏰ Function timed out during Claude API call`);
      return {
        statusCode: 408,
        headers,
        body: JSON.stringify({ 
          error: "Request timeout", 
          details: `Claude API call took longer than 8 seconds. Total function time: ${(totalDuration/1000).toFixed(2)}s`,
          timing: {
            totalDuration: totalDuration,
            totalSeconds: (totalDuration/1000).toFixed(2)
          }
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal server error", 
        details: error.message,
        timing: {
          totalDuration: totalDuration,
          totalSeconds: (totalDuration/1000).toFixed(2)
        }
      })
    };
  }
};