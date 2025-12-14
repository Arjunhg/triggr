'use client';

import { Button } from "@/components/ui/button";
import { AgentDetails, NodeType, EdgeType } from "@/lib/types";
import { ArrowLeft, Code2, Copy, Check, Loader2, Play, Save, Sparkles, Download, Rocket, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/lib/variants";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HeaderProps = {
    agentDetail?: AgentDetails;
    onSave?: () => void;
    isSaving?: boolean;
    previewHeader?: boolean;
    agentId?: string;
    onAgentUpdate?: () => void;
    nodes?: NodeType[];
    edges?: EdgeType[];
}

export default function Header({ 
    agentDetail, 
    onSave, 
    isSaving, 
    previewHeader = false, 
    agentId, 
    onAgentUpdate,
    nodes,
    edges
}: HeaderProps) {
    // const [isPublishing, setIsPublishing] = useState(false);
    const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    
    // Kestra states
    const [activeTab, setActiveTab] = useState<string>("javascript");
    const [kestraYaml, setKestraYaml] = useState<string>("");
    const [isGeneratingYaml, setIsGeneratingYaml] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [kestraFlowId, setKestraFlowId] = useState<string>("");
    const [kestraNamespace, setKestraNamespace] = useState<string>("");
    const [executionId, setExecutionId] = useState<string>("");
    const [executionStatus, setExecutionStatus] = useState<string>("");
    
    // const publishAgent = useMutation(api.agent.PublishAgent);
    
    const currentAgentId = agentId || agentDetail?.agentId;
    
    const builderPath = currentAgentId
        ? `/agent-builder/${currentAgentId}`
        : undefined;

    const previewPath = currentAgentId
        ? `/agent-builder/${currentAgentId}/preview`
        : undefined;

   

    const handleGenerateCode = async () => {
        if (!nodes || nodes.length === 0) {
            toast.error("No workflow to generate code from");
            return;
        }

        setIsCodeDialogOpen(true);
        setIsGeneratingCode(true);
        setGeneratedCode("");

        try {
            const flowConfig = { nodes, edges };
            
            const response = await fetch("/api/generate-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flowConfig })
            });

            if (!response.ok) {
                throw new Error("Failed to generate code");
            }

            const data = await response.json();
            setGeneratedCode(data.code);
        } catch (error) {
            console.error("Error generating code:", error);
            toast.error("Failed to generate code");
            setGeneratedCode("// Error generating code. Please try again.");
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode);
            setIsCopied(true);
            toast.success("Code copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            toast.error("Failed to copy code");
        }
    };

    const handleDownloadCode = () => {
        const blob = new Blob([generatedCode], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${agentDetail?.name || "workflow"}-agent.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Code downloaded");
    };

    // Kestra Functions
    const handleGenerateYaml = async () => {
        if (!nodes || nodes.length === 0) {
            toast.error("No workflow to generate YAML from");
            return;
        }

        setIsGeneratingYaml(true);
        setKestraYaml("");

        try {
            // Construct the payload exactly as the backend expects
            const payload = { 
                flowConfig: { 
                    nodes, 
                    edges // 'name' is no longer directly in flowConfig, it's passed as agentName
                },
                agentName: agentDetail?.name || "workflow" // Send agentName as a separate top-level property
            };
            
            const response = await fetch("/api/kestra/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload) // Send the constructed payload
            });

            if (!response.ok) {
                throw new Error("Failed to generate Kestra YAML");
            }

            const data = await response.json();
            setKestraYaml(data.yaml);
            setKestraFlowId(data.flowId);
            setKestraNamespace(data.namespace);
        } catch (error) {
            console.error("Error generating Kestra YAML:", error);
            toast.error("Failed to generate Kestra YAML");
            setKestraYaml("# Error generating Kestra YAML. Please try again.");
        } finally {
            setIsGeneratingYaml(false);
        }
    };

    const handleDeployToKestra = async () => {
        if (!kestraYaml) {
            toast.error("No YAML to deploy");
            return;
        }

        setIsDeploying(true);

        try {
            const response = await fetch("/api/kestra/deploy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ yaml: kestraYaml })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to deploy to Kestra");
            }

            const data = await response.json();
            setKestraFlowId(data.flowId);
            setKestraNamespace(data.namespace);
            toast.success(`Flow deployed successfully! Revision: ${data.revision}`);
        } catch (error) {
            console.error("Error deploying to Kestra:", error);
            toast.error(error instanceof Error ? error.message : "Failed to deploy to Kestra");
        } finally {
            setIsDeploying(false);
        }
    };

    const handleExecuteFlow = async () => {
        if (!kestraFlowId || !kestraNamespace) {
            toast.error("Deploy the flow first before executing");
            return;
        }

        setIsExecuting(true);
        setExecutionStatus("");

        try {
            const response = await fetch("/api/kestra/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    namespace: kestraNamespace, 
                    flowId: kestraFlowId 
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to execute flow");
            }

            const data = await response.json();
            setExecutionId(data.executionId);
            setExecutionStatus(data.state);
            toast.success(`Flow execution started! ID: ${data.executionId}`);
            
            // Start polling for status
            pollExecutionStatus(data.executionId);
        } catch (error) {
            console.error("Error executing flow:", error);
            toast.error(error instanceof Error ? error.message : "Failed to execute flow");
        } finally {
            setIsExecuting(false);
        }
    };

    const pollExecutionStatus = async (execId: string) => {
        const poll = async () => {
            try {
                const response = await fetch(`/api/kestra/status?executionId=${execId}`);
                if (response.ok) {
                    const data = await response.json();
                    setExecutionStatus(data.state);
                    
                    // Continue polling if not in terminal state
                    if (!["SUCCESS", "FAILED", "KILLED", "CANCELLED"].includes(data.state)) {
                        setTimeout(poll, 2000);
                    }
                }
            } catch (error) {
                console.error("Error polling status:", error);
            }
        };
        
        poll();
    };

    const handleCopyYaml = async () => {
        try {
            await navigator.clipboard.writeText(kestraYaml);
            setIsCopied(true);
            toast.success("YAML copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            toast.error("Failed to copy YAML");
        }
    };

    const handleDownloadYaml = () => {
        const blob = new Blob([kestraYaml], { type: "text/yaml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${agentDetail?.name || "workflow"}.yml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("YAML downloaded");
    };

    const openKestraUI = () => {
        window.open("http://localhost:8080", "_blank");
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === "kestra" && !kestraYaml && !isGeneratingYaml) {
            handleGenerateYaml();
        }
    };

    return (
        <motion.header
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
        >
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left Section - Back & Title */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-3"
                >
                    <Link href="/dashboard">
                        <motion.div
                            whileHover={{ x: -4 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                        >
                            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </motion.div>
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        {/* Agent Icon with Glow */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
                            <div className="relative p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold tracking-tight truncate max-w-[200px] md:max-w-none">
                                {agentDetail?.name || 'Loading...'}
                            </h1>
                            <span className="text-xs text-muted-foreground">
                                {agentDetail?.published ? (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Published
                                    </span>
                                ) : (
                                    'Draft'
                                )}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Section - Actions */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-2 md:gap-3"
                >
                    {/* Code Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="hidden sm:flex gap-2 text-muted-foreground hover:text-foreground"
                            onClick={handleGenerateCode}
                            disabled={!nodes || nodes.length === 0}
                        >
                            <Code2 className="h-4 w-4" />
                            <span className="hidden md:inline">Code</span>
                        </Button>
                    </motion.div>

                    {/* Preview Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {!previewHeader ? (
                            previewPath ? (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                                    asChild
                                >
                                    <Link href={previewPath}>
                                        <Play className="h-4 w-4" />
                                        <span className="hidden md:inline cursor-pointer">Preview</span>
                                    </Link>
                                </Button>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-2 border-primary/30"
                                    disabled
                                >
                                    <Play className="h-4 w-4" />
                                    <span className="hidden md:inline">Preview</span>
                                </Button>
                            )
                        ) : builderPath ? (
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                asChild
                            >
                                <Link href={builderPath}>
                                    <Play className="h-4 w-4" />
                                    <span className="hidden md:inline">Close Preview</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                disabled
                            >
                                <Play className="h-4 w-4" />
                                <span className="hidden md:inline">Close Preview</span>
                            </Button>
                        )}
                    </motion.div>

                    {/* Save Button */}
                    {onSave && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={onSave}
                                disabled={isSaving}
                                className="gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span className="hidden md:inline">Save</span>
                            </Button>
                        </motion.div>
                    )}

                </motion.div>
            </div>

            {/* Subtle gradient line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {/* Code Generation Dialog */}
            <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="p-2 rounded-lg bg-primary/10">
                                <Code2 className="h-5 w-5 text-primary" />
                            </span>
                            Workflow Export
                        </DialogTitle>
                        <DialogDescription>
                            Export your workflow as JavaScript code or deploy to Kestra
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="javascript" className="gap-2">
                                <Code2 className="h-4 w-4" />
                                JavaScript
                            </TabsTrigger>
                            <TabsTrigger value="kestra" className="gap-2">
                                <Rocket className="h-4 w-4" />
                                Kestra YAML
                            </TabsTrigger>
                        </TabsList>

                        {/* JavaScript Tab */}
                        <TabsContent value="javascript" className="flex-1 flex flex-col mt-4">
                            {isGeneratingCode ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                        <div className="relative p-4 rounded-xl bg-background border border-border/50">
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">Generating Code...</p>
                                        <p className="text-sm text-muted-foreground">Analyzing your workflow and creating JavaScript</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 pb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyCode}
                                            className="gap-2"
                                        >
                                            {isCopied && activeTab === "javascript" ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                            {isCopied && activeTab === "javascript" ? "Copied!" : "Copy"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadCode}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                    <ScrollArea className="h-[350px] rounded-lg border border-border/50 bg-muted/30">
                                        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
                                            <code>{generatedCode}</code>
                                        </pre>
                                    </ScrollArea>
                                </>
                            )}
                        </TabsContent>

                        {/* Kestra Tab */}
                        <TabsContent value="kestra" className="flex-1 flex flex-col mt-4">
                            {isGeneratingYaml ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                        <div className="relative p-4 rounded-xl bg-background border border-border/50">
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">Generating Kestra YAML...</p>
                                        <p className="text-sm text-muted-foreground">Converting your workflow to Kestra format</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 pb-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyYaml}
                                            className="gap-2"
                                        >
                                            {isCopied && activeTab === "kestra" ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                            {isCopied && activeTab === "kestra" ? "Copied!" : "Copy"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                                size="sm"
                                                onClick={handleDownloadYaml}
                                                className="gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={openKestraUI}
                                                className="gap-2"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Open Kestra
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDeployToKestra}
                                                disabled={isDeploying || !kestraYaml}
                                                className="gap-2"
                                            >
                                                {isDeploying ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Rocket className="h-4 w-4" />
                                                )}
                                                Deploy
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleExecuteFlow}
                                                disabled={isExecuting || !kestraFlowId}
                                                className="gap-2"
                                            >
                                                {isExecuting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Play className="h-4 w-4" />
                                                )}
                                                Execute
                                            </Button>
                                    </div>

                                    {/* Info Note */}
                                    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-2">
                                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            Review & edit YAML before deploying. Ensure Kestra is running at localhost:8080 and set <code className="bg-amber-500/20 px-1 rounded">keys mentioned in YAML</code> in Kestra KV Store.
                                        </p>
                                    </div>

                                    {/* Execution Status */}
                                    {executionId && (
                                        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Execution:</span>
                                                <code className="text-xs bg-background px-2 py-1 rounded">{executionId}</code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Status:</span>
                                                <span className={`text-sm font-medium ${
                                                    executionStatus === "SUCCESS" ? "text-emerald-500" :
                                                    executionStatus === "FAILED" ? "text-red-500" :
                                                    executionStatus === "RUNNING" ? "text-blue-500" :
                                                    "text-yellow-500"
                                                }`}>
                                                    {executionStatus}
                                                </span>
                                                {executionStatus === "RUNNING" && (
                                                    <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Editable YAML */}
                                    <textarea
                                        value={kestraYaml}
                                        onChange={(e) => setKestraYaml(e.target.value)}
                                        className="h-[280px] w-full rounded-lg border border-border/50 bg-muted/30 p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        spellCheck={false}
                                    />
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </motion.header>
    );
}