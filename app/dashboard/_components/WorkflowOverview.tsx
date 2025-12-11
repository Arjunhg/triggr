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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickActions from "./quickactions/QuickActions";

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
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
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
                        
                        <motion.div variants={containerVariants} className="space-y-3">
                            {recentWorkflows.map((workflow) => (
                                <motion.div
                                    key={workflow.name}
                                    variants={itemVariants}
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
                        </motion.div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <QuickActions/>
                
            </div>
        </motion.div>
    )
}