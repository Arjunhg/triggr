'use client';

import { LabelNode } from "@/lib/types";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { ShieldCheck, User } from "lucide-react";
import { motion } from "framer-motion";

export default function UserApprovalNode({ data }: NodeProps<LabelNode>) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative"
        >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-fuchsia-500/30 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            
            {/* Main Card */}
            <div className="relative bg-background/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-3 px-4 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300">
                
                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                
                <div className="flex gap-3 items-center">
                    {/* Icon Container */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-violet-500/30 blur-md rounded-xl" />
                        <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30">
                            <ShieldCheck className="h-4 w-4 text-violet-500" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <h2 className="font-semibold text-foreground text-sm">{data?.label ?? "Approval"}</h2>
                            <User className="h-3 w-3 text-violet-500/70" />
                        </div>
                        <p className="text-xs text-muted-foreground">Human Review</p>
                    </div>
                </div>
                
                {/* Target Handle (Left) */}
                <Handle 
                    type="target" 
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-violet-500 !border-2 !border-background"
                />
                
                {/* Source Handle (Right) */}
                <Handle 
                    type="source" 
                    position={Position.Right}
                    className="!w-3 !h-3 !bg-violet-500 !border-2 !border-background"
                />
            </div>
        </motion.div>
    );
}
