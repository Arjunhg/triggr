import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/config/OpenAiModel";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Agent {
  id: string;
  name: string;
  model: string;
  instruction: string;
  tools?: string[];
  includeHistory?: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  method: "GET" | "POST";
  url: string;
  parameters?: Record<string, any>;
  apiKey?: string;
  includeApiKey?: boolean;
  headers?: Record<string, string> | string;

  // New auth fields
  authType?: 'none' | 'bearer' | 'query' | 'header';
  apiKeyName?: string;
}

interface AgentToolConfig {
  systemPrompt?: string;
  primaryAgentName?: string;
  agents: Agent[];
  tools: Tool[];
}

// Execute a tool call
async function executeTool(tool: Tool, parameters: Record<string, any>): Promise<any> {
  try {
    let urlString = tool.url;

    // Replace URL parameters in {paramName} format
    Object.keys(parameters).forEach(key => {
      urlString = urlString.replace(`{${key}}`, encodeURIComponent(parameters[key]));
    });

    const url = new URL(urlString);

    // For GET requests, also add remaining parameters as query params
    if (tool.method === "GET") {
      Object.keys(parameters).forEach(key => {
        // Only add if not already in URL
        if (!tool.url.includes(`{${key}}`)) {
          url.searchParams.set(key, parameters[key]);
        }
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge custom headers from tool config (supports JSON string or object)
    if (tool.headers) {
      let resolvedHeaders: Record<string, string> | undefined;
      if (typeof tool.headers === "string") {
        try {
          resolvedHeaders = JSON.parse(tool.headers);
        } catch (err) {
          console.warn(`Failed to parse headers for tool ${tool.name}:`, err);
        }
      } else {
        resolvedHeaders = tool.headers;
      }

      if (resolvedHeaders) {
        Object.assign(headers, resolvedHeaders);
      }
    }

    // Handle authentication based on authType
    const authType = tool.authType || (tool.includeApiKey ? 'bearer' : 'none');
    const keyName = tool.apiKeyName || 'key';

    // Attempt to resolve API key value from config or existing headers
    let apiKeyValue = tool.apiKey;

    if (!apiKeyValue) {
      const headerAuth = headers["Authorization"] || headers["authorization"];
      if (headerAuth && headerAuth.toLowerCase().startsWith("bearer ")) {
        apiKeyValue = headerAuth.slice(7).trim();
      } else if (headers[keyName]) {
        apiKeyValue = headers[keyName];
      }
    }

    if (apiKeyValue && authType !== 'none') {
      switch (authType) {
        case 'bearer':
          headers["Authorization"] = `Bearer ${apiKeyValue}`;
          break;
        case 'query':
          // Add API key as query parameter
          url.searchParams.set(keyName, apiKeyValue);
          break;
        case 'header':
          // Add API key as custom header
          headers[keyName || 'X-API-Key'] = apiKeyValue;
          break;
      }
    }

    const options: RequestInit = {
      method: tool.method,
      headers,
    };

    if (tool.method === "POST" && parameters) {
      options.body = JSON.stringify(parameters);
    }

    console.log(`🔧 Executing tool: ${tool.name}`, { 
      url: url.toString(), 
      method: tool.method,
      authType: authType 
    });
    
    const response = await fetch(url.toString(), options);
    const result = await response.json();
    
    console.log(`✅ Tool result:`, result);
    return result;
  } catch (error) {
    console.error(`Error executing tool ${tool.name}:`, error);
    return { error: `Failed to execute tool: ${error}` };
  }
}

// Execute agent workflow
async function executeAgentWorkflow(
  config: AgentToolConfig,
  input: string,
  conversationHistory: Message[] = []
): Promise<string> {
  const primaryAgent = config.agents.find(
    (a) => a.name === config.primaryAgentName || a.id === config.agents[0]?.id
  );

  if (!primaryAgent) {
    throw new Error("Primary agent not found");
  }

  // Build messages for the agent
  const messages: Message[] = [];

  if (config.systemPrompt) {
    messages.push({
      role: "system",
      content: config.systemPrompt,
    });
  }

  if (primaryAgent.instruction) {
    messages.push({
      role: "system",
      content: primaryAgent.instruction,
    });
  }

  // Include conversation history if enabled
  if (primaryAgent.includeHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  // Add current user input
  messages.push({
    role: "user",
    content: input,
  });

  // Get available tools for this agent
  const availableTools = config.tools.filter(
    (tool) => !primaryAgent.tools || primaryAgent.tools.includes(tool.id)
  );

  // Sanitize function name to comply with API requirements
  // Must start with letter/underscore, only alphanumeric, underscores, dots, colons, dashes allowed
  const sanitizeFunctionName = (name: string): string => {
    // Replace spaces and invalid chars with underscores
    let sanitized = name.replace(/[^a-zA-Z0-9_.\-:]/g, '_');
    // Ensure it starts with a letter or underscore
    if (!/^[a-zA-Z_]/.test(sanitized)) {
      sanitized = '_' + sanitized;
    }
    // Limit to 64 characters
    return sanitized.slice(0, 64);
  };

  // Create a mapping from sanitized names back to original tool names
  const nameMapping: Record<string, string> = {};
  availableTools.forEach(tool => {
    nameMapping[sanitizeFunctionName(tool.name)] = tool.name;
  });

  // Prepare function definitions for OpenAI/OpenRouter
  const functions = availableTools.map((tool) => ({
    type: "function" as const,
    function: {
      name: sanitizeFunctionName(tool.name),
      description: tool.description,
      parameters: {
        type: "object",
        properties: Object.entries(tool.parameters || {}).reduce(
          (acc, [key, value]) => {
            acc[key] = {
              type: typeof value === "string" ? "string" : typeof value,
              description: `Parameter ${key}`,
            };
            return acc;
          },
          {} as Record<string, any>
        ),
        required: [],
      },
    },
  }));

  const openAiKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openAiKey && !openRouterKey) {
    return "API key not configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY.";
  }

  let response: any;
  const toolCalls: any[] = [];

  // Make initial API call
  if (openAiKey) {
    response = await openai.chat.completions.create({
      model: primaryAgent.model || "gpt-4o-mini",
      messages: messages as any,
      tools: functions.length > 0 ? functions : undefined,
      tool_choice: functions.length > 0 ? "auto" : undefined,
    });
  } else if (openRouterKey) {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify({
        model: primaryAgent.model || "openai/gpt-4o-mini",
        messages: messages as any,
        tools: functions.length > 0 ? functions : undefined,
        tool_choice: functions.length > 0 ? "auto" : undefined,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenRouter request failed: ${errorText}`);
    }

    response = await res.json();
  }

  const assistantMessage = response.choices?.[0]?.message;
  let finalResponse = assistantMessage?.content || "";

  // Handle tool calls if any
  if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
    const toolCallMessages: any[] = [
      {
        role: "assistant",
        content: assistantMessage.content || "",
        tool_calls: assistantMessage.tool_calls,
      },
    ];

    // Execute all tool calls
    for (const toolCall of assistantMessage.tool_calls) {
      // Map sanitized function name back to original tool name
      const originalToolName = nameMapping[toolCall.function.name] || toolCall.function.name;
      const tool = availableTools.find((t) => t.name === originalToolName);
      if (tool) {
        const parameters = JSON.parse(toolCall.function.arguments || "{}");
        console.log(`🔧 Calling tool: ${tool.name} with params:`, parameters);
        const toolResult = await executeTool(tool, parameters);

        toolCallMessages.push({
          role: "tool",
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });
      }
    }

    // Get final response after tool execution
    const finalMessages = [...messages, ...toolCallMessages];

    if (openAiKey) {
      const finalResponseData = await openai.chat.completions.create({
        model: primaryAgent.model || "gpt-4o-mini",
        messages: finalMessages as any,
      });
      finalResponse = finalResponseData.choices[0]?.message?.content || finalResponse;
    } else if (openRouterKey) {
      const finalRes = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: primaryAgent.model || "openai/gpt-4o-mini",
          messages: finalMessages as any,
        }),
      });

      if (finalRes.ok) {
        const finalData = await finalRes.json();
        finalResponse = finalData.choices[0]?.message?.content || finalResponse;
      }
    }
  }

  return finalResponse;
}

export async function POST(req: NextRequest) {
  try {
    const { input, tools, agents, conversationId, agentToolConfig } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    if (!agentToolConfig) {
      return NextResponse.json(
        { error: "Agent tool configuration is required" },
        { status: 400 }
      );
    }

    // Execute the agent workflow
    const response = await executeAgentWorkflow(agentToolConfig, input);

    return NextResponse.json({
      response,
      conversationId: conversationId || `conv_${Date.now()}`,
    });
  } catch (error: any) {
    console.error("Error in agent chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}