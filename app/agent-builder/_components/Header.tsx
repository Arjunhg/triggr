'use client';

import { Button } from "@/components/ui/button";
import { AgentDetails, NodeType, EdgeType } from "@/lib/types";
import { ArrowLeft, Code2, Copy, Check, Globe, Globe2, Loader2, Play, Save, Sparkles, Download } from "lucide-react";
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
    const [isPublishing, setIsPublishing] = useState(false);
    const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    
    const publishAgent = useMutation(api.agent.PublishAgent);
    
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
                            Generated Code
                        </DialogTitle>
                        <DialogDescription>
                            JavaScript code generated from your workflow configuration
                        </DialogDescription>
                    </DialogHeader>

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
                                    {isCopied ? (
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {isCopied ? "Copied!" : "Copy"}
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
                            <ScrollArea className="h-[400px] rounded-lg border border-border/50 bg-muted/30">
                                <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
                                    <code>{generatedCode}</code>
                                </pre>
                            </ScrollArea>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </motion.header>
    );
}