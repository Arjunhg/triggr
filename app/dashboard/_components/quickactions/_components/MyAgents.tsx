'use client'

import { useUserDetail } from "@/context/UserDetailsContext"
import { api } from "@/convex/_generated/api";
import { AgentDetails } from "@/lib/types";
import { useQuery } from "convex/react";
import { Bot, GitBranchPlus, Workflow, Clock, Zap } from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/variants";

function AgentSkeleton() {
  return (
    <div className="node-card p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}


export default function MyAgents(){

    const { userDetails } = useUserDetail();

    const agentList = useQuery(
        api.agent.GetUserAgents,
        userDetails?._id ? { userId: userDetails._id } : "skip"
    )

    const isLoading = !userDetails || agentList === undefined;
    const gridStateKey = isLoading ? "loading" : agentList?.length ? "ready" : "empty";

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full py-2"
        >
            {/* Stats Summary */}
            <motion.div 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-6 mb-6 p-4 rounded-lg bg-muted/30 border border-border/50"
            >
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Agents:</span>
                    <span className="font-semibold">{agentList?.length ?? 0}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">Active:</span>
                    <span className="font-semibold text-emerald-500">
                        {agentList?.filter(a => a.published).length ?? 0}
                    </span>
                </div>
            </motion.div>

            <motion.div 
                key={gridStateKey}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >

                {/* Loading State */}
                {isLoading && (
                    <>
                        <AgentSkeleton />
                        <AgentSkeleton />
                        <AgentSkeleton />
                    </>
                )}

                {/* Empty State */}
                {agentList?.length === 0 && (
                    <motion.div 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="col-span-full flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                            <Workflow className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">No agents yet</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            Create your first AI agent to start automating your workflows
                        </p>
                    </motion.div>
                )}

                {/* Render Agents */}
                {agentList?.map((agent: AgentDetails) => (
                    <motion.div
                        key={agent._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                        <Link
                            href={`/agent-builder/${agent.agentId}`}
                            className="node-card p-4 block group hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <span className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <GitBranchPlus className="w-5 h-5 text-primary" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                        {agent.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {moment(agent._creationTime).fromNow()}
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    agent.published 
                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                    {agent.published ? 'Active' : 'Draft'}
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}