'use client';
import Header from "../_components/Header";
import '@xyflow/react/dist/style.css';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, MiniMap, Controls, OnNodesChange, OnEdgesChange, OnConnect, BackgroundVariant, Panel, OnNodeDrag, Node, Edge } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState } from "react";
import StartNode from "../_customNodes/StartNode";
import AgentNode from "../_customNodes/AgentNode";
import AgentToolsPanel from "../_components/AgentToolsPanel";
import EndNode from "../_customNodes/EndNode";
import IfElseNode from "../_customNodes/IfElseNode";
import WhileNode from "../_customNodes/WhileNode";
import UserApprovalNode from "../_customNodes/UserApprovalNode";
import ApiNode from "../_customNodes/ApiNode";
import { useAgentContext } from "@/context/AgentContext";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { AgentDetails, EdgeType, NodeType } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { useUserDetail } from "@/context/UserDetailsContext";

// const initialNodes: Node[] = [
//   { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' }, type: 'StartNode' },
//   { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' }, type: 'AgentNode' },
// ];
// const initialEdges: Edge[] = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

const createDefaultNodes = (): NodeType[] => [
    {
        id: 'start',
        position: { x: 0, y: 0 },
        data: { 
            label: 'Start',
            id: 'start',
            type: 'StartNode',
            bgColor: '#ffffff'
        },
        type: 'StartNode'
    }
];

const createDefaultEdges = (): EdgeType[] => [];

const EDGE_STYLE = { strokeWidth: 2, stroke: 'var(--connector-active)' };

const normalizeEdge = (edge: EdgeType): EdgeType => ({
    ...edge,
    type: edge.type ?? 'smoothstep',
    animated: edge.animated ?? true,
    style: { ...(edge.style ?? {}), ...EDGE_STYLE }
});

export default function AgentBuilder(){

    const [nodes, setNodes] = useState<NodeType[]>([]);
    const [edges, setEdges] = useState<EdgeType[]>([]);
    const [flowHydrated, setFlowHydrated] = useState(false);

    const { addedNodes, setAddedNodes, addedEdges, setAddedEdges } = useAgentContext();
    const { userDetails } = useUserDetail();

    // Database Persistence Logic Here
    const [agentDetails, setAgentDetails] = useState<AgentDetails>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { agentId } = useParams();
    const convex = useConvex();

    const updateAgentDetail = useMutation(api.agent.UpdateAgentWorkflow);

    const getAgentDetails = async() => {
        if(!agentId || typeof agentId !== 'string'){
            toast.error("No Agent ID provided");
            return;
        }
        try {
            setIsLoading(true);

            const result = await convex.query(api.agent.GetAgentById, {
                agentId: agentId as string
            });

            if (!result) {
                toast.error("Agent not found");
                return;
            }

            setAgentDetails(result as AgentDetails);

        } catch (error) {
            console.error("Error fetching agent details:", error);
            toast.error("Error fetching agent details");
        } finally {
            setIsLoading(false);
        }
    }
    const getUserId = async() => {
        try{
            const result = await convex.query(api.user.getUserById, {
                userId: userDetails?._id!!
            });
            return result;
        }catch(error){
            console.error("Error fetching user details:", error);
            toast.error("Error fetching user details");
        }
    }

    const handleSaveWorkflow = async () => {
        if(!agentId || typeof agentId !== 'string'){
            toast.error("Cannot save workflow without a valid agent");
            return;
        }
        const userId = await getUserId();
        try {
            await updateAgentDetail({
                agentId: agentId as string,
                nodes: addedNodes,
                edges: addedEdges,
                userId: userId?._id!!
            });
            toast.success("Workflow saved successfully");
        } catch (error) {
            console.error("Error saving workflow:", error);
            toast.error("Failed to save workflow");
        }
    };
    // 

    const hydrateFlow = useCallback((nodesPayload?: NodeType[], edgesPayload?: EdgeType[]) => {
        const safeNodes = nodesPayload && nodesPayload.length > 0 ? nodesPayload : createDefaultNodes();
        const safeEdges = (edgesPayload ?? createDefaultEdges()).map(normalizeEdge);
        setNodes(safeNodes);
        setEdges(safeEdges);
        setAddedNodes(safeNodes);
        setAddedEdges(safeEdges);
    }, [setAddedNodes, setAddedEdges]);

    useEffect(() => {
        if(!agentId){
            setIsLoading(false);
            setFlowHydrated(false);
            return;
        }
        setFlowHydrated(false);
        getAgentDetails();
    }, [agentId])

    useEffect(() => {
        if (isLoading || flowHydrated) return;
        hydrateFlow(agentDetails?.nodes, agentDetails?.edges);
        setFlowHydrated(true);
    }, [agentDetails, flowHydrated, hydrateFlow, isLoading]);

    useEffect(() => {
        if(!flowHydrated) return;
        setNodes(addedNodes);
    }, [addedNodes, flowHydrated]);

    useEffect(() => {
        if(!flowHydrated) return;
        setEdges(addedEdges);
    }, [addedEdges, flowHydrated]);

    // keep context edges in sync after local updates (avoids setState during render warnings)
    useEffect(() => {
        if(!flowHydrated) return;
        setAddedEdges(edges);
    }, [edges, flowHydrated, setAddedEdges]);

    /* Passing this directly in react flow causes many render because on each movement it gets triggered. A better approach is we can use onNodeDragStop to update the context once dragging is done. We can use this for real time collaboration as it's changing the context along with local state. But even with that it's important to use throttle or debounce to avoid excessive updates.
        const onNodesChange: OnNodesChange = useCallback(
            (changes) => setNodes((nodesSnapshot) => {
            const update = applyNodeChanges(changes, nodesSnapshot);
            setAddedNodes(update);
            return update;
            }),
            [setAddedNodes],
        );
    */
   // keep local nodes updated fast for UI responsiveness
    const onNodesChange: OnNodesChange = useCallback(
        (changes) =>
            setNodes((nodesSnapshot) => {
                return applyNodeChanges(changes, nodesSnapshot as Node[]) as NodeType[];
        }),
    []
);

    // persist to context only when user finishes dragging
    const onNodeDragStop: OnNodeDrag = useCallback(
        () => {
            setAddedNodes(nodes);
        },
        [nodes, setAddedNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => {
            const update = applyEdgeChanges(changes, edgesSnapshot as Edge[]) as EdgeType[];
            const normalized = update.map(normalizeEdge);
            setAddedEdges(normalized);
            return normalized;
        }),
        [setAddedEdges],
    );
    
     const onConnect: OnConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => {
            const update = addEdge(
                {
                    ...params,
                    animated: true,
                    type: 'smoothstep',
                    style: EDGE_STYLE
                },
                edgesSnapshot as Edge[]
            ) as EdgeType[];
            const normalized = update.map(normalizeEdge);
            setAddedEdges(normalized);
            return normalized;
        }),
        [setAddedEdges],
    );

    const nodeTypes = useMemo(() => ({
        StartNode,
        AgentNode,
        EndNode,
        IfElseNode,
        WhileNode,
        UserApprovalNode,
        ApiNode
    }), []);

    const isGraphLoading = isLoading || !flowHydrated;

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await handleSaveWorkflow();
        setIsSaving(false);
    };


    return(
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <Header agentDetail={agentDetails} onSave={handleSave} isSaving={isSaving}/>

            <div className="flex-1 relative">
            {isGraphLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background">
                    {/* Animated loading state */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                        <div className="relative p-6 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-xl">
                            <Spinner className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-foreground">Loading Workflow</h3>
                        <p className="text-sm text-muted-foreground mt-1">Preparing your agent canvas...</p>
                    </div>
                </div>
            ) : (
                <ReactFlow
                    nodes={nodes as Node[]}
                    edges={edges as Edge[]}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDragStop={onNodeDragStop}
                    fitView
                    nodeTypes={nodeTypes}
                    className="bg-background"
                    proOptions={{ hideAttribution: true }}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: true,
                        style: EDGE_STYLE
                    }}
                >
                    <MiniMap 
                        className="!bg-background/80 !backdrop-blur-xl !border !border-border/50 !rounded-xl !shadow-lg"
                        maskColor="hsl(var(--muted) / 0.5)"
                        nodeColor="hsl(var(--primary))"
                    />
                    <Controls 
                        className="!bg-background/80 !backdrop-blur-xl !border !border-border/50 !rounded-xl !shadow-lg !overflow-hidden"
                    />
                    <Background 
                        variant={BackgroundVariant.Dots} 
                        gap={20} 
                        size={1}
                        color="hsl(var(--muted-foreground) / 0.3)"
                    />
                    <Panel position="top-left" className="!m-4">
                        <AgentToolsPanel/>
                    </Panel>
                    <Panel position="top-right" className="!m-4">
                        <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-xl">
                            <h3 className="font-semibold text-foreground text-sm mb-2">Node Settings</h3>
                            <p className="text-xs text-muted-foreground">Select a node to configure</p>
                        </div>
                    </Panel>
                </ReactFlow>
            )}
            </div>
        </div>
    )
}