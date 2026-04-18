const apiKey = "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";

async function testKey() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://claritiy.pro",
        "X-Title": "CLARITIY",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-oss-120b:free",
        "messages": [{ "role": "user", "content": "test" }],
        "reasoning": { "enabled": true }
      })
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testKey();
