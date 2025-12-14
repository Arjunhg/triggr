import { NextRequest, NextResponse } from "next/server";

const KESTRA_BASE_URL = process.env.KESTRA_URL || "http://localhost:8080";
const KESTRA_USERNAME = process.env.KESTRA_USERNAME || "admin@kestra.io";
const KESTRA_PASSWORD = process.env.KESTRA_PASSWORD || "kestra";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const executionId = searchParams.get('executionId');
        
        if (!executionId) {
            return NextResponse.json(
                { error: "executionId is required" },
                { status: 400 }
            );
        }

        // Prepare headers with authentication
        const headers: Record<string, string> = {};
        
        if (KESTRA_USERNAME && KESTRA_PASSWORD) {
            const credentials = Buffer.from(`${KESTRA_USERNAME}:${KESTRA_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
        }
        
        const response = await fetch(
            `${KESTRA_BASE_URL}/api/v1/main/executions/${executionId}`,
            { 
                method: "GET",
                headers: headers
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Kestra status error:", errorText);
            return NextResponse.json(
                { 
                    error: "Failed to get execution status",
                    details: errorText 
                },
                { status: response.status }
            );
        }
        
        const result = await response.json();
        
        // Extract relevant status information
        const taskRuns = result.taskRunList || [];
        const tasks = taskRuns.map((task: { 
            taskId: string; 
            state: { current: string }; 
            outputs?: Record<string, unknown> 
        }) => ({
            taskId: task.taskId,
            state: task.state?.current,
            outputs: task.outputs
        }));
        
        return NextResponse.json({
            executionId: result.id,
            state: result.state?.current || 'UNKNOWN',
            namespace: result.namespace,
            flowId: result.flowId,
            startDate: result.state?.startDate,
            endDate: result.state?.endDate,
            duration: result.state?.duration,
            tasks,
            outputs: result.outputs
        });
        
    } catch (error) {
        console.error("Error getting execution status:", error);
        
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
            { error: "Failed to get execution status" },
            { status: 500 }
        );
    }
}
