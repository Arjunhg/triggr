'use client'

import { itemVariants } from "@/lib/variants"
import { motion } from "framer-motion"
import { Activity, ArrowRight, Bot, GitBranch, Zap } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import MyAgents from "./_components/MyAgents"


export default function QuickActions(){
    const [openMyAgents, setOpenMyAgents] = useState(false);

    const quickActions = [
        { label: 'My Agents', icon: Bot, color: 'text-primary', onClick: () => setOpenMyAgents(true) },
        { label: 'Import Workflow', icon: GitBranch, color: 'text-accent', onClick: () => {} },
        { label: 'Templates', icon: Activity, color: 'text-emerald-500', onClick: () => {} },
    ];

    return(
        <motion.div variants={itemVariants}>
            <div className="node-card p-6 h-full">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                     Quick Actions
                </h2>
                        
                <div className="space-y-3">
                    {quickActions.map((action) => (
                        <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={action.onClick}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all text-left group cursor-pointer"
                        >
                            <span className={`p-2 rounded-lg bg-background ${action.color}`}>
                                <action.icon className="w-4 h-4" />
                            </span>
                            <span className="font-medium group-hover:text-primary transition-colors">
                                {action.label}
                            </span>
                            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </motion.button>
                    ))}
                </div>

                {/* My Agents Dialog */}
                <Dialog open={openMyAgents} onOpenChange={setOpenMyAgents}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <span className="p-2 rounded-lg bg-primary/10">
                                    <Bot className="w-5 h-5 text-primary" />
                                </span>
                                My Agents
                            </DialogTitle>
                        </DialogHeader>
                        <MyAgents />
                    </DialogContent>
                </Dialog>

                {/* Automation Tip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5"
                >
                    <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-medium">Pro tip:</span> Connect your first 
                        AI agent to automate repetitive tasks and save hours every week.
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}