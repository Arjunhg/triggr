'use client';

import { LabelNode } from "@/lib/types";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { GitBranch, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function IfElseNode({ data }: NodeProps<LabelNode>) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative"
        >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-yellow-500/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            
            {/* Main Card */}
            <div className="relative bg-background/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-3 px-4 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-300">
                
                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                
                <div className="flex gap-3 items-center min-h-[48px]">
                    {/* Icon Container */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/30 blur-md rounded-xl" />
                        <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                            <GitBranch className="h-4 w-4 text-amber-500" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <h2 className="font-semibold text-foreground text-sm">{data?.label ?? "If / Else"}</h2>
                            <Zap className="h-3 w-3 text-amber-500/70" />
                        </div>
                        <p className="text-xs text-muted-foreground">Logic Branch</p>
                    </div>
                    
                    {/* Branch labels */}
                    <div className="flex flex-col gap-2 ml-4 text-xs">
                        <span className="text-emerald-500 font-medium">True ●</span>
                        <span className="text-rose-500 font-medium">False ●</span>
                    </div>
                </div>
                
                {/* Target Handle (Left) */}
                <Handle 
                    type="target" 
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background"
                />
                
                {/* Source Handle - True (Right Top) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="if"
                    style={{ top: "35%" }}
                    className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
                />
                
                {/* Source Handle - False (Right Bottom) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="else"
                    style={{ top: "65%" }}
                    className="!w-3 !h-3 !bg-rose-500 !border-2 !border-background"
                />
            </div>
        </motion.div>
    );
}
