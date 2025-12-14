import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { flowConfig } = await req.json();

        if (!flowConfig) {
            return NextResponse.json(
                { error: "Flow configuration is required" },
                { status: 400 }
            );
        }

        const prompt = `You are an expert JavaScript developer. Convert the following AI agent workflow configuration into clean, executable JavaScript code.

The workflow represents an AI agent system with nodes and edges. Generate code that:
1. Uses async/await patterns
2. Handles API calls with fetch
3. Implements conditional logic (if/else nodes)
4. Implements loops (while nodes)
5. Handles user approval prompts
6. Is well-commented and production-ready

WORKFLOW CONFIGURATION:
${JSON.stringify(flowConfig, null, 2)}

IMPORTANT RULES:
- Generate ONLY JavaScript code, no markdown formatting
- Use modern ES6+ syntax
- Create a main async function called 'runWorkflow' that executes the entire flow
- For API nodes, use the fetch API with proper error handling
- For Agent nodes, create placeholder functions that can be replaced with actual AI calls
- For UserApproval nodes, use a simple prompt/confirm pattern
- Export the runWorkflow function
- Include helpful comments explaining each step
- Handle authentication based on authType (bearer, query, header, or none)

Generate the complete JavaScript code:`;

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "system",
                    content: "You are a code generator. Output only valid JavaScript code without any markdown formatting, code blocks, or explanations. The code should be directly executable."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 4000
        });

        let generatedCode = completion.choices[0]?.message?.content || "";

        // Clean up any markdown formatting that might have slipped through
        generatedCode = generatedCode
            .replace(/^```javascript\n?/i, '')
            .replace(/^```js\n?/i, '')
            .replace(/^```\n?/, '')
            .replace(/\n?```$/g, '')
            .trim();

        return NextResponse.json({ code: generatedCode });

    } catch (error) {
        console.error("Error generating code:", error);
        return NextResponse.json(
            { error: "Failed to generate code" },
            { status: 500 }
        );
    }
}
