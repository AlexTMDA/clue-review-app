// netlify/functions/generate-clue-report.js

exports.handler = async (event, context) => {
  // CORS headers - MUST be consistent across all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Parse request body
    const { prompt, transcript } = JSON.parse(event.body);
    
    // Get API key from environment - CHANGED: Removed VITE_ prefix
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error("Missing API key");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" })
      };
    }

    if (!prompt || !transcript) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing prompt or transcript" })
      };
    }

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8000,
        messages: [
          {
            role: "user",
            content: `${prompt}\n\nDiscovery Call Transcript:\n${transcript}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: "API request failed", 
          details: errorText 
        })
      };
    }

    const data = await response.json();
    
    // Extract the content from Claude's response
    const report = data.content?.[0]?.text || "No content received";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ report })
    };

  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      })
    };
  }
};
