'use client';

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/variants'
import { UserCheck, Sparkles, MessageSquare, Save, Info } from 'lucide-react'
import { UserApprovalSettingsProps, UserApprovalNodeSettings } from '@/lib/types'

export default function UserApproval({ selectedNode, updateFormData }: UserApprovalSettingsProps) {

  const [formData, setFormData] = useState<UserApprovalNodeSettings>({ name: '', message: '' })

  useEffect(() => {
    if (selectedNode?.data?.settings) {
      setFormData(selectedNode.data.settings)
    }
  }, [selectedNode])

  const handleChange = <K extends keyof UserApprovalNodeSettings>(key: K, value: UserApprovalNodeSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const onSave = () => {
    try {
      updateFormData(formData)
      toast.success('Settings updated!')
    } catch (error) {
      toast.error('Failed to update settings')
      console.error('Error updating settings:', error)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/30 blur-md rounded-xl pointer-events-none" />
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30">
            <UserCheck className="h-5 w-5 text-violet-500" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">User Approval</h2>
          <p className="text-xs text-muted-foreground">Human-in-the-loop checkpoint</p>
        </div>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

      {/* Info Box */}
      <motion.div 
        variants={itemVariants} 
        className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 mb-4"
      >
        <Info className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Workflow will pause here and wait for human approval before continuing.
        </p>
      </motion.div>

      {/* Name Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          Step Name
        </Label>
        <Input
          placeholder='Enter approval step name...'
          value={formData.name}
          onChange={(event) => handleChange('name', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-violet-500/50 transition-colors"
        />
      </motion.div>

      {/* Message Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-violet-500" />
          Approval Message
        </Label>
        <Textarea
          value={formData.message}
          placeholder='Describe what the user needs to approve...'
          onChange={(event) => handleChange('message', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-violet-500/50 transition-colors min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use variables like {'{output}'} to show context from previous steps
        </p>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <Button 
          className="w-full gap-2 bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/20" 
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  )
}