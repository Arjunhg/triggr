import { NextRequest, NextResponse } from "next/server";

const KESTRA_BASE_URL = process.env.KESTRA_URL || "http://localhost:8080";
const KESTRA_USERNAME = process.env.KESTRA_USERNAME || "admin@kestra.io";
const KESTRA_PASSWORD = process.env.KESTRA_PASSWORD || "kestra";

export async function POST(req: NextRequest) {
    try {
        const { yaml } = await req.json();

        if (!yaml) {
            return NextResponse.json(
                { error: "YAML content is required" },
                { status: 400 }
            );
        }

        // Log the YAML for debugging
        console.log("--- Generated Kestra YAML ---");
        console.log(yaml);
        console.log("----------------------------");

        const headers: Record<string, string> = {
            "Content-Type": "application/x-yaml",
        };

        // Add Basic Authentication if credentials are provided
        if (KESTRA_USERNAME && KESTRA_PASSWORD) {
            const credentials = Buffer.from(`${KESTRA_USERNAME}:${KESTRA_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
        }

        console.log("--- Generated Kestra YAML ---");
        console.log(yaml); // <--- Add this line to see the YAML being sent
        console.log("----------------------------");

        // Send the YAML to Kestra API to create/update the flow
        const response = await fetch(`${KESTRA_BASE_URL}/api/v1/main/flows`, {
            method: "POST",
            headers: headers, // Use the updated headers object
            body: yaml,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Kestra API error:", response.status, errorText);
            return NextResponse.json(
                {
                    error: "Failed to deploy flow to Kestra",
                    details: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            flowId: result.id,
            namespace: result.namespace,
            revision: result.revision,
            message: `Flow "${result.id}" deployed successfully to namespace "${result.namespace}" (revision ${result.revision})`
        });

    } catch (error) {
        console.error("Error deploying to Kestra:", error);
        if (error instanceof Error && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    error: "Cannot connect to Kestra",
                    details: "Make sure Kestra is running at " + KESTRA_BASE_URL
                },
                { status: 503 }
            );
        }
        return NextResponse.json(
            { error: "Failed to deploy flow to Kestra" },
            { status: 500 }
        );
    }
}
