'use client';

import { LabelNode } from "@/lib/types";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { RefreshCw, Repeat } from "lucide-react";
import { motion } from "framer-motion";

export default function WhileNode({ data }: NodeProps<LabelNode>) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative"
        >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-cyan-500/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            
            {/* Main Card */}
            <div className="relative bg-background/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-3 px-4 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
                
                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                
                <div className="flex gap-3 items-center">
                    {/* Icon Container with animation */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-xl" />
                        <motion.div 
                            className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                        </motion.div>
                    </div>
                    
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <h2 className="font-semibold text-foreground text-sm">{data?.label ?? "While Loop"}</h2>
                            <Repeat className="h-3 w-3 text-blue-500/70" />
                        </div>
                        <p className="text-xs text-muted-foreground">Repeat Until</p>
                    </div>
                </div>
                
                {/* Target Handle (Left) */}
                <Handle 
                    type="target" 
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background"
                />
                
                {/* Source Handle (Right) */}
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background"
                />
            </div>
        </motion.div>
    );
}
