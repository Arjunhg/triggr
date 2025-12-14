import { NextRequest, NextResponse } from "next/server";
import { NodeType, EdgeType } from "@/lib/types";

interface KestraTask {
    id: string;
    type: string;
    [key: string]: unknown;
}

interface KestraFlow {
    id: string;
    namespace: string;
    description?: string;
    inputs?: Array<{
        id: string;
        type: string;
        defaults?: string;
    }>;
    tasks: KestraTask[];
}

// Helper to sanitize IDs for Kestra (must be alphanumeric with underscores)
function sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// Helper to find connected nodes in execution order
function getExecutionOrder(nodes: NodeType[], edges: EdgeType[]): NodeType[] {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const incomingEdges = new Map<string, string[]>();
    const outgoingEdges = new Map<string, string[]>();
    
    // Build edge maps
    edges.forEach(edge => {
        if (!incomingEdges.has(edge.target)) incomingEdges.set(edge.target, []);
        if (!outgoingEdges.has(edge.source)) outgoingEdges.set(edge.source, []);
        incomingEdges.get(edge.target)!.push(edge.source);
        outgoingEdges.get(edge.source)!.push(edge.target);
    });
    
    // Find start node
    const startNode = nodes.find(n => n.type === 'StartNode' || n.data?.type === 'StartNode');
    if (!startNode) return nodes;
    
    // BFS traversal
    const visited = new Set<string>();
    const result: NodeType[] = [];
    const queue: string[] = [startNode.id];
    
    while (queue.length > 0) {
        const nodeId = queue.shift()!;
        if (visited.has(nodeId)) continue;
        visited.add(nodeId);
        
        const node = nodeMap.get(nodeId);
        if (node) {
            result.push(node);
            const nextNodes = outgoingEdges.get(nodeId) || [];
            nextNodes.forEach(next => {
                if (!visited.has(next)) queue.push(next);
            });
        }
    }
    
    return result;
}

// Helper to determine the AI provider config based on model string
// Since Triggr uses OpenRouter as the central gateway for all AI models,
// we always use OpenAI-compatible provider with OpenRouter base URL
function getProviderConfig(modelString: string): Record<string, unknown> {
    // OpenRouter uses OpenAI-compatible API for all models
    // Models are in format: provider/model (e.g., google/gemini-2.5-flash-lite)
    return {
        type: 'io.kestra.plugin.ai.provider.OpenRouter',
        modelName: modelString || 'openai/gpt-4o-mini',
        apiKey: "{{ kv('OPENROUTER_API_KEY') }}",
        baseUrl: 'https://openrouter.ai/api/v1'
    };
}

// Convert a single node to Kestra task(s)
function nodeToKestraTask(node: NodeType, edges: EdgeType[], allNodes: NodeType[]): KestraTask | KestraTask[] | null {
    const nodeData = node.data || {};
    const nodeType = node.type || nodeData.type;
    const nodeId = sanitizeId(node.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (nodeData as any).settings || {} as Record<string, unknown>;
    
    switch (nodeType) {
        case 'StartNode':
            // Start node becomes a log task
            return {
                id: 'start',
                type: 'io.kestra.plugin.core.log.Log',
                message: 'Workflow started'
            };
            
        case 'EndNode':
            // End node becomes a log task
            return {
                id: 'end',
                type: 'io.kestra.plugin.core.log.Log',
                message: 'Workflow completed successfully'
            };
            
        case 'AgentNode': {
            // Agent node becomes a Chat Completion task
            // Get the actual model from settings
            const modelString = String(settings.model || 'gpt-4o-mini');
            const agentName = String(settings.name || nodeData.label || 'AI Agent');
            const instruction = String(settings.instruction || settings.systemPrompt || 'You are a helpful assistant.');
            
            // Determine provider based on model string
            const providerConfig = getProviderConfig(modelString);
            
            return {
                id: nodeId,
                type: 'io.kestra.plugin.ai.completion.ChatCompletion',
                provider: providerConfig,
                messages: [
                    {
                        type: 'SYSTEM',
                        content: instruction || `You are ${agentName}. Be helpful and concise.`
                    },
                    {
                        type: 'USER',
                        content: '{{ inputs.user_prompt }}'
                    }
                ]
            };
        }
            
        case 'ApiNode': {
            // API node becomes HTTP Request task
            // Check both 'url' and 'endpoint' since workflow may use either
            const endpoint = String(settings.endpoint || settings.url || '');
            const method = String(settings.method || 'GET').toUpperCase();
            const headers: Record<string, string> = {};
            const authType = String(settings.authType || 'none');
            const apiKeyName = String(settings.apiKeyName || 'key');
            const apiNodeName = String(settings.name || nodeData.label || 'API Call');
            
            // Create a sanitized secret name based on the API name
            const secretName = `${sanitizeId(apiNodeName).toUpperCase()}_API_KEY`;
            
            let finalUri = endpoint;
            
            // Handle authentication
            if (authType === 'bearer') {
                headers['Authorization'] = `Bearer {{ kv('${secretName}') }}`;
            } else if (authType === 'header' && apiKeyName) {
                headers[apiKeyName] = `{{ kv('${secretName}') }}`;
            } else if (authType === 'query' && apiKeyName) {
                // Replace the placeholder in the URL or append the key
                if (endpoint.includes(`{${apiKeyName}}`)) {
                    finalUri = endpoint.replace(`{${apiKeyName}}`, `{{ kv('${secretName}') }}`);
                } else if (endpoint.includes('?')) {
                    finalUri = `${endpoint}&${apiKeyName}={{ kv('${secretName}') }}`;
                } else {
                    finalUri = `${endpoint}?${apiKeyName}={{ kv('${secretName}') }}`;
                }
            }
            
            // Parse custom headers
            if (settings.headers) {
                try {
                    const customHeaders = typeof settings.headers === 'string' 
                        ? JSON.parse(settings.headers as string) 
                        : settings.headers;
                    Object.assign(headers, customHeaders as Record<string, string>);
                } catch {
                    // Ignore parsing errors
                }
            }
            
            const httpTask: KestraTask = {
                id: nodeId,
                type: 'io.kestra.plugin.core.http.Request',
                uri: finalUri,
                method: method,
            };
            
            if (Object.keys(headers).length > 0) {
                httpTask.headers = headers;
            }
            
            if (settings.body && method !== 'GET') {
                httpTask.body = settings.body;
                httpTask.contentType = 'application/json';
            }
            
            return httpTask;
        }
            
        case 'IfElseNode': {
            // If/Else node becomes Kestra If task
            const condition = settings.condition || 'true';
            
            // Find then and else branches
            const outEdges = edges.filter(e => e.source === node.id);
            const thenTasks: KestraTask[] = [];
            const elseTasks: KestraTask[] = [];
            
            outEdges.forEach(edge => {
                const targetNode = allNodes.find(n => n.id === edge.target);
                if (targetNode) {
                    const task = nodeToKestraTask(targetNode, edges, allNodes);
                    if (task) {
                        // Simple heuristic: first edge is 'then', second is 'else'
                        if (edge.sourceHandle === 'true' || thenTasks.length === 0) {
                            if (Array.isArray(task)) thenTasks.push(...task);
                            else thenTasks.push(task);
                        } else {
                            if (Array.isArray(task)) elseTasks.push(...task);
                            else elseTasks.push(task);
                        }
                    }
                }
            });
            
            const ifTask: KestraTask = {
                id: nodeId,
                type: 'io.kestra.plugin.core.flow.If',
                condition: `{{ ${condition} }}`,
                then: thenTasks.length > 0 ? thenTasks : [{ 
                    id: `${nodeId}_then_log`, 
                    type: 'io.kestra.plugin.core.log.Log', 
                    message: 'Condition was true' 
                }],
            };
            
            if (elseTasks.length > 0) {
                ifTask.else = elseTasks;
            }
            
            return ifTask;
        }
            
        case 'WhileNode': {
            // While node becomes Kestra WaitFor or ForEach task
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const whileSettings = (nodeData as any).settings || {} as Record<string, unknown>;
            const whileCondition = whileSettings.condition || 'false';
            
            return {
                id: nodeId,
                type: 'io.kestra.plugin.core.flow.WaitFor',
                condition: `{{ ${whileCondition} }}`,
                tasks: [{
                    id: `${nodeId}_loop_task`,
                    type: 'io.kestra.plugin.core.log.Log',
                    message: 'Loop iteration'
                }],
                checkFrequency: {
                    interval: 'PT1S',
                    maxDuration: 'PT60S'
                }
            };
        }
            
        case 'UserApprovalNode': {
            // User approval becomes Pause task
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const approvalSettings = (nodeData as any).settings || {} as Record<string, unknown>;
            const approvalMessage = approvalSettings.message || 'Please approve to continue';
            
            return {
                id: nodeId,
                type: 'io.kestra.plugin.core.flow.Pause',
                onResume: [
                    {
                        id: 'approved',
                        type: 'BOOLEAN',
                        defaults: 'true'
                    },
                    {
                        id: 'reason',
                        type: 'STRING',
                        required: false
                    }
                ],
                tasks: [{
                    id: `${nodeId}_approval_log`,
                    type: 'io.kestra.plugin.core.log.Log',
                    message: approvalMessage
                }]
            };
        }
            
        default:
            // Unknown node type - create a log task
            return {
                id: nodeId,
                type: 'io.kestra.plugin.core.log.Log',
                message: `Executing node: ${nodeData.label || node.id}`
            };
    }
}

export async function POST(req: NextRequest) {
    try {
        const { flowConfig, agentName } = await req.json();
        
        if (!flowConfig || !flowConfig.nodes) {
            return NextResponse.json(
                { error: "Flow configuration with nodes is required" },
                { status: 400 }
            );
        }
        
        const nodes: NodeType[] = flowConfig.nodes;
        const edges: EdgeType[] = flowConfig.edges || [];
        
        // Get nodes in execution order
        const orderedNodes = getExecutionOrder(nodes, edges);
        
        // Convert nodes to Kestra tasks
        const tasks: KestraTask[] = [];
        const processedNodes = new Set<string>();
        
        for (const node of orderedNodes) {
            // Skip if already processed (e.g., as part of If/Else branch)
            if (processedNodes.has(node.id)) continue;
            
            // Skip IfElse target nodes (they'll be processed as part of the If task)
            const isIfElseTarget = edges.some(e => {
                const sourceNode = nodes.find(n => n.id === e.source);
                return e.target === node.id && 
                       (sourceNode?.type === 'IfElseNode' || sourceNode?.data?.type === 'IfElseNode');
            });
            
            if (isIfElseTarget && node.type !== 'EndNode') continue;
            
            const task = nodeToKestraTask(node, edges, nodes);
            if (task) {
                if (Array.isArray(task)) {
                    tasks.push(...task);
                } else {
                    tasks.push(task);
                }
                processedNodes.add(node.id);
            }
        }
        
        // Build the Kestra flow
        const flowId = sanitizeId(agentName || 'triggr_workflow');
        const kestraFlow: KestraFlow = {
            id: flowId,
            namespace: 'triggr.workflows',
            description: `Workflow generated from Triggr: ${agentName || 'Unnamed Workflow'}`,
            inputs: [
                {
                    id: 'user_prompt',
                    type: 'STRING',
                    defaults: 'Hello, how can you help me?'
                }
            ],
            tasks: tasks.length > 0 ? tasks : [{
                id: 'empty_workflow',
                type: 'io.kestra.plugin.core.log.Log',
                message: 'Empty workflow - add nodes to generate tasks'
            }]
        };
        
        // Convert to YAML
        const yaml = generateYaml(kestraFlow);
        
        return NextResponse.json({ 
            yaml,
            flowId,
            namespace: 'triggr.workflows'
        });
        
    } catch (error) {
        console.error("Error generating Kestra YAML:", error);
        return NextResponse.json(
            { error: "Failed to generate Kestra YAML" },
            { status: 500 }
        );
    }
}

// Proper YAML generator with correct indentation
function generateYaml(obj: unknown, indent: number = 0, isArrayItem: boolean = false): string {
    const baseIndent = '  '.repeat(indent);
    const contentIndent = isArrayItem ? '' : baseIndent;
    
    if (obj === null || obj === undefined) {
        return 'null';
    }
    
    if (typeof obj === 'string') {
        // Check if string needs quoting
        if (obj.includes('\n')) {
            const lines = obj.split('\n').map(line => baseIndent + '  ' + line).join('\n');
            return `|\n${lines}`;
        }
        if (obj.includes('{{') || obj.includes(':') || obj.includes('#') || obj.includes('"') || obj.includes("'") || obj.startsWith(' ') || obj.endsWith(' ')) {
            return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        }
        return obj;
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
        return String(obj);
    }
    
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        
        const items: string[] = [];
        for (const item of obj) {
            if (typeof item === 'object' && item !== null) {
                // For object items in array, format each property
                const entries = Object.entries(item as Record<string, unknown>);
                if (entries.length === 0) {
                    items.push(`${baseIndent}- {}`);
                } else {
                    const firstEntry = entries[0];
                    const restEntries = entries.slice(1);
                    
                    // First property goes on same line as dash
                    const firstValue = formatValue(firstEntry[1], indent + 1);
                    let itemStr = `${baseIndent}- ${firstEntry[0]}: ${firstValue}`;
                    
                    // Rest of properties are indented under the dash
                    for (const [key, value] of restEntries) {
                        const formattedValue = formatValue(value, indent + 1);
                        itemStr += `\n${baseIndent}  ${key}: ${formattedValue}`;
                    }
                    
                    items.push(itemStr);
                }
            } else {
                items.push(`${baseIndent}- ${generateYaml(item, indent)}`);
            }
        }
        return items.join('\n');
    }
    
    if (typeof obj === 'object') {
        const entries = Object.entries(obj as Record<string, unknown>);
        if (entries.length === 0) return '{}';
        
        const lines: string[] = [];
        for (const [key, value] of entries) {
            const formattedValue = formatValue(value, indent);
            lines.push(`${contentIndent}${key}: ${formattedValue}`);
        }
        return lines.join('\n');
    }
    
    return String(obj);
}

// Helper to format values properly
function formatValue(value: unknown, indent: number): string {
    const nextIndent = '  '.repeat(indent + 1);
    
    if (value === null || value === undefined) {
        return 'null';
    }
    
    if (typeof value === 'string') {
        if (value.includes('\n')) {
            const lines = value.split('\n').map(line => nextIndent + line).join('\n');
            return `|\n${lines}`;
        }
        if (value.includes('{{') || value.includes(':') || value.includes('#') || value.includes('"') || value.includes("'") || value.startsWith(' ') || value.endsWith(' ')) {
            return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        }
        return value;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    
    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return '\n' + generateYaml(value, indent + 1);
    }
    
    if (typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>);
        if (entries.length === 0) return '{}';
        
        const lines: string[] = [];
        for (const [k, v] of entries) {
            const formattedV = formatValue(v, indent + 1);
            lines.push(`${nextIndent}${k}: ${formattedV}`);
        }
        return '\n' + lines.join('\n');
    }
    
    return String(value);
}
