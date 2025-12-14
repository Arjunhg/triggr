"use client";

import React, { useEffect, useState } from "react";
import Header from "../../_components/Header";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentDetails } from "@/lib/types";
import { useParams } from "next/navigation";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import { NodeTypes } from "@/lib/types";
import "@xyflow/react/dist/style.css";
import axios from 'axios';
import ChatUi from "./_components/ChatDesign";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, Workflow, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/variants";

export default function PreviewAgent() {
  const convex = useConvex();
  const { agentId } = useParams();
  const [agentDetail, setAgentDetail] = useState<AgentDetails | null>(null);
  const [flowConfig, setFlowConfig] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const updateAgentToolConfig = useMutation(api.agent.UpdateAgentToolConfig)


  useEffect(() => {
    const load = async () => {
      const result = await convex.query(api.agent.GetAgentById, {
        agentId: agentId as string,
      });
      setAgentDetail(result);
    };
    load();
  }, [convex, agentId]);


  useEffect(() => {
    if (agentDetail) {
      GenerateWorkflow();
    }
  }, [agentDetail])

  const GenerateWorkflow = () => {
    // 🧩 Build Edge Map (for quick lookup)
    const edgeMap = agentDetail?.edges?.reduce((acc: any, edge: any) => {
      if (!acc[edge.source]) acc[edge.source] = [];
      acc[edge.source].push(edge);
      return acc;
    }, {});

    // 🔄 Build Flow Configuration
    const flow = agentDetail?.nodes?.map((node: any) => {
      const connectedEdges = edgeMap[node.id] || [];
      let next: any = null;

      switch (node.type) {
        // 🧭 Conditional branching
        case "IfElseNode": {
          const ifEdge = connectedEdges.find((e: any) => e.sourceHandle === "if");
          const elseEdge = connectedEdges.find((e: any) => e.sourceHandle === "else");

          next = {
            if: ifEdge?.target || null,
            else: elseEdge?.target || null,
          };
          break;
        }

        // 🧠 Agent or AI Node
        case "AgentNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target);
          }
          break;
        }

        // 🔗 API Call Node
        case "ApiNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // ✅ User Approval Node (manual checkpoint)
        case "UserApprovalNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // 🚀 Start Node
        case "StartNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // 🏁 End Node
        case "EndNode": {
          next = null; // No next node
          break;
        }

        // 🔧 Default handling
        default: {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target);
          }
          break;
        }
      }

      return {
        id: node.id,
        type: node.type,
        label: node.data?.label || node.type,
        settings: node.data?.settings || {},
        next,
      };
    });

    // 🎯 Identify Start Node
    const startNode = agentDetail?.nodes?.find((n: any) => n.type === "StartNode");

    // 🧱 Final Config
    const config = {
      startNode: startNode?.id || null,
      flow,
    };

    setFlowConfig(config)

    console.log("✅ Generated Workflow Config:", JSON.stringify(config));
    // setConfig(config);

  }

  const GenerateAgentToolConfig = async () => {
    if (!flowConfig) {
      toast.error("Flow configuration is not ready yet.");
      return;
    }
    if (!agentDetail?._id) {
      toast.error("Agent details missing.");
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post('/api/agent-tool-config', {
        jsonConfig: flowConfig
      });
      console.log("Agent Tool Config Result(From preview page):", result.data);

      await updateAgentToolConfig({
        id: agentDetail?._id as any,
        agentToolConfig: result.data
      });

      const updatedAgent = await convex.query(api.agent.GetAgentById, {
        agentId: agentId as string,
      });
      setAgentDetail(updatedAgent);

      toast.success("Agent tool configuration generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate agent tool config.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      </div>

      <Header
        previewHeader={true}
        agentDetail={agentDetail ?? undefined}
        agentId={agentId as string}
        onAgentUpdate={async () => {
          const result = await convex.query(api.agent.GetAgentById, {
            agentId: agentId as string,
          });
          setAgentDetail(result);
        }}
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 md:p-6"
      >
        {/* Workflow Preview Panel */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-3 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden shadow-xl"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-md rounded-lg pointer-events-none" />
                <div className="relative p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                  <Workflow className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Workflow Preview</h2>
                <p className="text-xs text-muted-foreground">Visual representation of your agent flow</p>
              </div>
            </div>
            {agentDetail?.published && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Published
              </span>
            )}
          </div>

          {/* ReactFlow Canvas */}
          <div className="h-[calc(100vh-220px)] bg-muted/20">
            <ReactFlow
              nodes={agentDetail?.nodes || []}
              edges={agentDetail?.edges || []}
              fitView
              nodeTypes={NodeTypes}
              draggable={false}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={true}
              zoomOnScroll={true}
            >
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={16} 
                size={1} 
                color="hsl(var(--muted-foreground) / 0.2)"
              />
            </ReactFlow>
          </div>
        </motion.div>

        {/* Chat Panel */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden shadow-xl h-[calc(100vh-140px)]"
        >
          {agentDetail?.agentToolConfig ? (
            <ChatUi
              GenerateAgentToolConfig={GenerateAgentToolConfig}
              loading={loading}
              agentDetail={agentDetail}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
              </motion.div>

              <h3 className="text-lg font-semibold text-foreground mb-2">Initialize Agent</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">
                Generate the agent configuration to start chatting with your AI workflow
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={GenerateAgentToolConfig}
                  disabled={loading}
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <RefreshCwIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loading ? "Generating..." : "Initialize Agent"}
                </Button>
              </motion.div>

              <p className="text-[10px] text-muted-foreground mt-4">
                This will analyze your workflow and prepare the AI
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
