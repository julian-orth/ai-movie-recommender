// Vercel Serverless Function
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const userPrompt = req.body.prompt;

  // Get API key from environment
  const apiKey =
    process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("OpenRouter API key not found in environment variables");
    return res.status(500).json({
      error: "API key configuration error",
    });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/devstral-2512:free",
          messages: [{ role: "user", content: userPrompt }],
          max_tokens: 300,
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    // Check for errors in the response
    if (data.error) {
      console.error("OpenRouter API error:", data.error);
      return res.status(data.error.code || 500).json({
        error: data.error.message || "AI service error",
      });
    }

    console.log(data);
    return res.json({
      reply: data.choices?.[0]?.message?.content || "Received no response.",
    });
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return res.status(500).json({
      error: "Failed to get AI recommendation",
    });
  }
}
