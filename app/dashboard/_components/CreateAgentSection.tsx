'use client';

import { motion } from "framer-motion";
import { 
    Loader2Icon,
  Plus, 
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/variants";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from 'uuid';
import { useUserDetail } from "@/context/UserDetailsContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateAgentSection() {

    const [openDialog, setOpenDialog] =  useState(false);

    const CreateAgentMutation = useMutation(api.agent.CreateAgent);

    const [agentName, setAgentName] = useState<string>('');
    const [loader, setLoader] = useState<boolean>(false);
    const { userDetails } = useUserDetail();
    const router = useRouter();

    const handleCreateAgent = async () => {

        if(!userDetails?._id){
            toast.error("User not found. Please login again.");
            return;
        }

        const trimmedName = agentName.trim();
        if(trimmedName.length < 3 || trimmedName.length > 25){
            toast.error("Agent name must be between 3 and 25 characters.");
            return;
        }
        setLoader(true);

        try{
            const agentId = uuidv4();

            await CreateAgentMutation({
                name: agentName,
                agentId: agentId,
                userId: userDetails._id
            });

            toast.success("Agent created successfully!");
            setAgentName('');
            setOpenDialog(false);
            router.push(`/agent-builder/${agentId}`);
        }catch(err){
            console.error("Error creating agent:", err);
            toast.error("Failed to create agent. Please try again.");
        }finally{
            setLoader(false);
        }
    }


    return(
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center max-w-lg mx-auto"
        >
            {/* Icon with glow */}
            <motion.div 
                variants={itemVariants}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
                <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <Sparkles className="w-10 h-10 text-primary" />
                </div>
            </motion.div>

            {/* Heading */}
            <motion.h1 
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            >
                Create Your AI Workflow
            </motion.h1>

            {/* Description */}
            <motion.p 
                variants={itemVariants}
                className="text-muted-foreground text-lg mb-8 leading-relaxed"
            >
                Build powerful automation workflows with AI agents. 
                Connect APIs, process data, and automate tasks - all with a visual builder.
            </motion.p>

            {/* Create Button */}
            <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
            >
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button 
                            size="lg"
                            className="gap-2 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer"
                            onClick={() => setOpenDialog(true)}
                        >
                            <Plus className="w-5 h-5" />
                            New Workflow
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enter Your Agent Name</DialogTitle>
                            <DialogDescription>
                                <Input 
                                    placeholder="Agent Name" 
                                    value={agentName}
                                    onChange={(event) => setAgentName(event.target.value)}
                                />
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose disabled={loader}>
                                <Button variant={'ghost'} className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button variant={'default'} onClick={handleCreateAgent} disabled={loader || !agentName.trim()} className="cursor-pointer">
                                {loader ? (
                                    <>
                                        <Loader2Icon className="animate-spin mr-2"/>
                                        Creating...
                                    </>
                                ) : (
                                    "Create Agent"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>    
                </Dialog>
            </motion.div>

            {/* Subtle hint */}
            <motion.p 
                variants={itemVariants}
                className="text-sm text-muted-foreground/60 mt-6"
            >
                Your workflows will appear in AI Agents once created
            </motion.p>
        </motion.div>
    )
}