'use client';

import { Button } from "@/components/ui/button";
import { AgentDetails } from "@/lib/types";
import { ArrowLeft, Code2, Loader2, Play, Rocket, Save, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/lib/variants";

type HeaderProps = {
    agentDetail?: AgentDetails;
    onSave?: () => void;
    isSaving?: boolean;
}

export default function Header({ agentDetail, onSave, isSaving }: HeaderProps) {
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
                        >
                            <Code2 className="h-4 w-4" />
                            <span className="hidden md:inline">Code</span>
                        </Button>
                    </motion.div>

                    {/* Preview Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                        >
                            <Play className="h-4 w-4" />
                            <span className="hidden md:inline">Preview</span>
                        </Button>
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

                    {/* Publish Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                            size="sm"
                            className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                        >
                            <Rocket className="h-4 w-4" />
                            <span className="hidden md:inline">Publish</span>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Subtle gradient line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </motion.header>
    );
}