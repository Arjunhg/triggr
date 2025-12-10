'use client';

import { motion } from "framer-motion";
import { 
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



export default function CreateAgentSection() {

    const [openDialog, setOpenDialog] =  useState(false);

    return(
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="inline-block ml-2"
                        >
                            <Sparkles className="w-6 h-6 text-primary inline" />
                        </motion.span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Your automation workflows are running smoothly
                    </p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button 
                                className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                                onClick={() => setOpenDialog(true)}
                            >
                                <Plus className="w-4 h-4" />
                                    New Workflow
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enter Your Agent Name</DialogTitle>
                                <DialogDescription>
                                    <Input placeholder="Agent Name"/>
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose>
                                    <Button variant={'ghost'} className="cursor-pointer">Cancel</Button>
                                </DialogClose>
                                <Button variant={'default'} className="cursor-pointer">Create</Button>
                            </DialogFooter>
                        </DialogContent>    
                    </Dialog>
                </motion.div>
            </motion.div>

           
        </motion.div>
    )
}