import { NextRequest, NextResponse } from "next/server";

const KESTRA_BASE_URL = process.env.KESTRA_URL || "http://localhost:8080";
const KESTRA_USERNAME = process.env.KESTRA_USERNAME || "admin@kestra.io"; 
const KESTRA_PASSWORD = process.env.KESTRA_PASSWORD || "kestra";      

export async function POST(req: NextRequest) {
    try {
        const { namespace, flowId, inputs } = await req.json();
        
        if (!namespace || !flowId) {
            return NextResponse.json(
                { error: "Namespace and flowId are required" },
                { status: 400 }
            );
        }
        
        // Build the execution URL
        let executeUrl = `${KESTRA_BASE_URL}/api/v1/main/executions/${namespace}/${flowId}`;
        
        // Prepare the request headers
        const headers: Record<string, string> = {};

        // Add Basic Authentication if credentials are provided
        if (KESTRA_USERNAME && KESTRA_PASSWORD) {
            const credentials = Buffer.from(`${KESTRA_USERNAME}:${KESTRA_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
        }

        // Prepare the request options
        const fetchOptions: RequestInit = {
            method: "POST",
            headers: headers, // Use the updated headers object
        };
        
        // If there are inputs, send them as form data
        if (inputs && Object.keys(inputs).length > 0) {
            const formData = new FormData();
            Object.entries(inputs).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            fetchOptions.body = formData;
        }
        
        const response = await fetch(executeUrl, fetchOptions);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Kestra execution error:", response.status, errorText); // Added status to error log
            return NextResponse.json(
                { 
                    error: "Failed to execute flow",
                    details: errorText 
                },
                { status: response.status }
            );
        }
        
        const result = await response.json();
        
        return NextResponse.json({
            success: true,
            executionId: result.id,
            state: result.state?.current || 'CREATED',
            namespace: result.namespace,
            flowId: result.flowId,
            message: `Execution started with ID: ${result.id}`
        });
        
    } catch (error) {
        console.error("Error executing Kestra flow:", error);
        
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
            { error: "Failed to execute flow" },
            { status: 500 }
        );
    }
}