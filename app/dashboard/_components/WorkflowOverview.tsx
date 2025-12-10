'use client'
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "@/lib/variants";
import { StatusPulse } from "./AutomationBackground";
import { 
  Activity, 
  ArrowRight, 
  Bot, 
  GitBranch, 
  Play, 
  TrendingUp,
  Workflow,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Stats data
const stats = [
  { label: 'Active Workflows', value: '12', icon: Workflow, trend: '+3 this week' },
  { label: 'AI Agents', value: '5', icon: Bot, trend: '2 processing' },
  { label: 'Executions Today', value: '284', icon: Activity, trend: '+18% vs yesterday' },
  { label: 'Time Saved', value: '47h', icon: TrendingUp, trend: 'This month' },
];

// Recent workflows
const recentWorkflows = [
  { name: 'Email Classification', status: 'active', executions: 142, lastRun: '2 min ago' },
  { name: 'Data Sync Pipeline', status: 'processing', executions: 89, lastRun: 'Running...' },
  { name: 'Report Generator', status: 'idle', executions: 53, lastRun: '1 hour ago' },
];


export default function WorkflowOverview() {
    return(
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        variants={itemVariants}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="node-card p-5 relative group"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="p-2 rounded-lg bg-primary/10">
                            <stat.icon className="w-5 h-5 text-primary" />
                            </span>
                            {stat.label === 'AI Agents' && <StatusPulse status="processing" size="md" />}
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-xs text-primary/80 mt-2">{stat.trend}</p>
                        </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Workflows */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <div className="node-card p-6">
                        <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-primary" />
                            Recent Workflows
                        </h2>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            View all <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {recentWorkflows.map((workflow, index) => (
                                <motion.div
                                    key={workflow.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                                >
                                <div className="flex items-center gap-4">
                                    <StatusPulse 
                                        status={workflow.status as 'active' | 'processing' | 'idle'} 
                                        size="md" 
                                    />
                                    <div>
                                        <p className="font-medium group-hover:text-primary transition-colors">
                                            {workflow.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {workflow.executions} executions
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        {workflow.lastRun}
                                    </span>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                    <Play className="w-4 h-4" />
                                    </Button>
                                </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <div className="node-card p-6 h-full">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-accent" />
                            Quick Actions
                        </h2>
                        
                        <div className="space-y-3">
                            {[
                                { label: 'My Agents', icon: Bot, color: 'text-primary' },
                                { label: 'Import Workflow', icon: GitBranch, color: 'text-accent' },
                                { label: 'Templates', icon: Activity, color: 'text-emerald-500' },
                            ].map((action, index) => (
                                <motion.button
                                    key={action.label}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all text-left group"
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
            </div>
        </motion.div>
    )
}