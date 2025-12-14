import { NextResponse } from "next/server";
import { openai } from "@/config/OpenAiModel";

const PROMPT = `
You are an expert AI system that converts a workflow into an agent-based instruction configuration.

STRICT OUTPUT RULES:
- Output ONLY valid JSON.
- Do NOT include explanations, comments, markdown, or extra text.
- Follow the schema EXACTLY. Do not rename, remove, or add keys.
- Use realistic and complete values for every field.
- Boolean values must be true or false (not strings).
- Arrays must never be empty unless explicitly allowed.

PARAMETER RULES:
- If method is GET → parameters represent query parameters or URL path parameters.
- If method is POST → parameters represent request body fields.
- Parameters must include correct data types (string, number, boolean, object, array).
- Extract parameter names from URL placeholders like {paramName} and include them in parameters.

URL PARAMETER RULES:
- If URL contains {paramName}, extract "paramName" as a parameter with type "string".
- Example: URL "https://api.weather.com/v1/current.json?q={cityName}" → parameters: {"cityName": "string"}

AUTHENTICATION RULES:
- authType can be: "none", "bearer", "query", or "header"
- "bearer": Sends API key as "Authorization: Bearer <key>" header
- "query": Appends API key as query parameter using apiKeyName (e.g., ?key=<apiKey>)
- "header": Sends API key as custom header using apiKeyName (e.g., X-API-Key: <key>)
- Copy authType, apiKey, and apiKeyName directly from the input settings if provided

JSON SCHEMA TO FOLLOW:
{
  "systemPrompt": "",
  "primaryAgentName": "",
  "agents": [
    {
      "id": "agent-id",
      "name": "",
      "model": "",
      "includeHistory": true,
      "output": "",
      "tools": ["tool-id"],
      "instruction": ""
    }
  ],
  "tools": [
    {
      "id": "tool-id",
      "name": "",
      "description": "",
      "method": "GET" | "POST",
      "url": "",
      "headers": {},
      "authType": "none" | "bearer" | "query" | "header",
      "apiKey": "",
      "apiKeyName": "",
      "parameters": {
        "parameterName": "dataType"
      },
      "usage": [],
      "assignedAgent": ""
    }
  ]
}

Generate the final JSON strictly according to this schema.
`;


const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const { jsonConfig } = await request.json();

    if (!jsonConfig) {
      return NextResponse.json(
        { error: "Missing jsonConfig payload" },
        { status: 400 }
      );
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openAiKey && !openRouterKey) {
      return NextResponse.json(
        {
          warning:
            "No model provider API key set. Returning mock agent tool configuration.",
          mock: true,
          config: jsonConfig,
        },
        { status: 200 }
      );
    }

    let outputText = "";

    if (openAiKey) {

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: JSON.stringify(jsonConfig) + PROMPT,
          },
        ],
      });

      outputText = response.choices[0]?.message?.content ?? "";
      
    } else if (openRouterKey) {
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: JSON.stringify(jsonConfig) + PROMPT,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: "OpenRouter request failed", details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      outputText = data.choices?.[0]?.message?.content ?? "";
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(
        outputText.replace("```json", "").replace("```", "")
      );
    } catch (err) {
      console.error("Failed to parse JSON from OpenAI response", err, outputText);
      return NextResponse.json(
        { error: "Failed to parse JSON from AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedJson);
  } catch (error) {
    console.error("Failed to generate agent tool config", error);
    return NextResponse.json(
      { error: "Failed to generate agent tool config" },
      { status: 500 }
    );
  }
}