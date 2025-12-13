'use client';

import { useAgentContext } from "@/context/AgentContext";
import { AgentToolType, NodeType } from "@/lib/types";
import { Bot, CircleOff, GitBranch, RefreshCw, ShieldCheck, Webhook, Wand2, PanelLeftClose, PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { itemVariants } from "@/lib/variants";
import { useState } from "react";

const AgentTools = [
  {
    name: 'Agent',
    icon: Bot,
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
    id: 'agent',
    type: 'AgentNode',
  },
  {
    name: 'End',
    icon: CircleOff,
    gradient: 'from-rose-500/20 to-rose-600/10',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-500',
    id: 'end',
    type: 'EndNode',
  },
  {
    name: 'If/Else',
    icon: GitBranch,
    gradient: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    id: 'ifElse',
    type: 'IfElseNode',
  },
  {
    name: 'While Loop',
    icon: RefreshCw,
    gradient: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-500',
    id: 'while',
    type: 'WhileNode',
  },
  {
    name: 'User Approval',
    icon: ShieldCheck,
    gradient: 'from-violet-500/20 to-violet-600/10',
    borderColor: 'border-violet-500/30',
    iconColor: 'text-violet-500',
    id: 'approval',
    type: 'UserApprovalNode',
  },
  {
    name: 'API Call',
    icon: Webhook,
    gradient: 'from-cyan-500/20 to-cyan-600/10',
    borderColor: 'border-cyan-500/30',
    iconColor: 'text-cyan-500',
    id: 'api',
    type: 'ApiNode',
  },
];

export default function AgentToolsPanel() {
    const { setAddedNodes, addedNodes} = useAgentContext();
    const [isOpen, setIsOpen] = useState(true);

    const onAgentToolClick = (tool: AgentToolType) => {
        const nodeCount = addedNodes?.length ?? 0;
        const newNode = {
            id: `${tool.id}-${Date.now()}`,
            position: { x: 250 + (nodeCount * 30), y: 150 + (nodeCount * 30) },
            data: { 
                label: tool.name, 
                bgColor: tool.gradient, 
                id: tool.id, 
                type: tool.type 
            },
            type: tool.type,
        };
        setAddedNodes((prevNodes: NodeType[]) => [...prevNodes, newNode]);
    };

    // Panel animation: closes from bottom-right to top-left
    const panelVariants = {
        open: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 25,
                staggerChildren: 0.05,
            }
        },
        closed: {
            opacity: 0,
            scale: 0.3,
            x: -100,
            y: -150,
            transition: {
                type: "spring" as const,
                stiffness: 400,
                damping: 30,
            }
        }
    };

    return (
        <div className="relative">
            {/* Toggle Button - Always visible */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    absolute top-0 left-0 z-10
                    p-2.5 rounded-xl
                    bg-background/80 backdrop-blur-xl
                    border border-border/50
                    shadow-lg
                    hover:bg-muted/50
                    transition-colors duration-200
                    ${isOpen ? 'opacity-70 hover:opacity-100' : ''}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isOpen ? "Close panel" : "Open panel"}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                >
                    {isOpen ? (
                        <PanelLeftClose className="h-4 w-4 text-primary" />
                    ) : (
                        <PanelLeft className="h-4 w-4 text-primary" />
                    )}
                </motion.div>
            </motion.button>

            {/* Panel Content */}
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        variants={panelVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="w-64 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden origin-top-left"
                        style={{ transformOrigin: 'top left' }}
                    >
            {/* Header */}
            <motion.div 
                variants={itemVariants}
                className="p-4 border-b border-border/50"
            >
                <div className="flex items-center justify-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 blur-md rounded-lg" />
                        <div className="relative p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <Wand2 className="h-4 w-4 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Agent Tools</h2>
                        <p className="text-xs text-muted-foreground">Drag to add nodes</p>
                    </div>
                </div>
            </motion.div>

            {/* Tools List */}
            <div className="p-3 space-y-2">
                {AgentTools.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.02, 
                            x: 4,
                            transition: { duration: 0.2 } 
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
                            bg-gradient-to-r ${tool.gradient}
                            border ${tool.borderColor}
                            hover:shadow-lg hover:shadow-${tool.iconColor}/10
                            transition-all duration-300
                        `}
                        onClick={() => onAgentToolClick(tool)}
                    >
                        {/* Icon Container */}
                        <div className={`
                            relative p-2.5 rounded-lg
                            bg-background/50 backdrop-blur-sm
                            border border-white/10
                            group-hover:border-white/20
                            transition-colors
                        `}>
                            <tool.icon className={`h-4 w-4 ${tool.iconColor}`} />
                        </div>

                        {/* Label */}
                        <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">
                                {tool.name}
                            </span>
                        </div>

                        {/* Hover indicator */}
                        <motion.div 
                            initial={{ opacity: 0, x: -5 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span className="text-xs text-muted-foreground">Click to add</span>
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Footer hint */}
            <motion.div 
                variants={itemVariants}
                className="p-3 border-t border-border/50"
            >
                <p className="text-xs text-muted-foreground text-center">
                    Click a tool to add it to the canvas
                </p>
            </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}