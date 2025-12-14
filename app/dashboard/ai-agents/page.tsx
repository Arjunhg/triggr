

'use client'

import { motion } from "framer-motion";
import { Bot, Plus, Sparkles } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/variants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MyAgents from "../_components/quickactions/_components/MyAgents";

export default function AIAgentsPage(){
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-primary/10">
                            <Bot className="w-6 h-6 text-primary" />
                        </span>
                        AI Agents
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="inline-block"
                        >
                            <Sparkles className="w-5 h-5 text-primary" />
                        </motion.span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and monitor all your AI agents in one place
                    </p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/dashboard">
                        <Button 
                            className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                        >
                            <Plus className="w-4 h-4" />
                            New Agent
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Agents Grid */}
            <motion.div variants={itemVariants} className="node-card p-6">
                <MyAgents />
            </motion.div>
        </motion.div>
    )
}