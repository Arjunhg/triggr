'use client';

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/variants'
import { Flag, FileJson, Save } from 'lucide-react'
import toast from 'react-hot-toast';

type EndSettingsProps = {
  selectedNode: any
  updateFormData: (data: any) => void
}

export default function EndSettings({ selectedNode, updateFormData }: EndSettingsProps) {
  const [formData, setFormData] = useState({ schema: '' })

  useEffect(() => {
    if (selectedNode?.data?.settings) {
      setFormData(selectedNode.data.settings)
    }
  }, [selectedNode])

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
          <div className="absolute inset-0 bg-rose-500/30 blur-md rounded-xl pointer-events-none" />
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/10 border border-rose-500/30">
            <Flag className="h-5 w-5 text-rose-500" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">End Settings</h2>
          <p className="text-xs text-muted-foreground">Configure final output schema</p>
        </div>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

      {/* Output Schema Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileJson className="h-3.5 w-3.5 text-rose-500" />
          Output Schema
        </Label>
        <Textarea
          placeholder='{"name": "string", "result": "any"}'
          value={formData.schema}
          onChange={(e) => setFormData({ schema: e.target.value })}
          className="bg-muted/50 border-border/50 focus:border-rose-500/50 transition-colors font-mono text-sm min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Define the JSON structure for your workflow output
        </p>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <Button 
          className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20" 
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  )
}
