'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/variants'
import { GitBranch, Code2, Save, Info } from 'lucide-react'
import { IfElseSettingsProps, IfElseNodeSettings } from '@/lib/types'

export default function IfElseSettings({ selectedNode, updateFormData }: IfElseSettingsProps) {

  const [formData, setFormData] = useState<IfElseNodeSettings>({ ifCondition: '' })

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
          <div className="absolute inset-0 bg-amber-500/30 blur-md rounded-xl pointer-events-none" />
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
            <GitBranch className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">If / Else Settings</h2>
          <p className="text-xs text-muted-foreground">Create conditional branches</p>
        </div>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

      {/* Info Box */}
      <motion.div 
        variants={itemVariants} 
        className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-4"
      >
        <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          The condition will be evaluated. If true, the "Yes" path executes; otherwise, the "No" path runs.
        </p>
      </motion.div>

      {/* Condition Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-amber-500" />
          If Condition
        </Label>
        <Input
          placeholder='e.g. output.status === "success"'
          value={formData.ifCondition}
          onChange={(e) => setFormData({ ifCondition: e.target.value })}
          className="bg-muted/50 border-border/50 focus:border-amber-500/50 transition-colors font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Use JavaScript expressions to evaluate the condition
        </p>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <Button 
          className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" 
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  )
}