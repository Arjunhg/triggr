'use client';

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/variants'
import { Bot, Brain, History, MessageSquare, Save, Sparkles } from 'lucide-react'

type AgentSettingsProps = {
  selectedNode: any
  updateFormData: (data: any) => void
}

export default function AgentSettings({ selectedNode, updateFormData }: AgentSettingsProps) {

  const [formData, setFormData] = useState({
    name: '',
    instruction: '',
    includeHistory: true,
    model: 'gemini-flash-1.5',
    output: 'Text',
    schema: ''
  })

  useEffect(() => {
    if (selectedNode?.data?.settings) {
      setFormData((prev) => ({
        ...prev,
        ...selectedNode.data.settings,
      }))
    }
  }, [selectedNode])

  const handleChange = (key: string, value: any) => {
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
          <div className="absolute inset-0 bg-emerald-500/30 blur-md rounded-xl pointer-events-none" />
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
            <Bot className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Agent Settings</h2>
          <p className="text-xs text-muted-foreground">Configure AI model behavior</p>
        </div>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

      {/* Name Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          Name
        </Label>
        <Input
          placeholder="Enter agent name..."
          value={formData.name}
          onChange={(event) => handleChange('name', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-emerald-500/50 transition-colors"
        />
      </motion.div>

      {/* Instruction Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
          Instruction
        </Label>
        <Textarea
          placeholder="Describe what this agent should do..."
          value={formData.instruction}
          onChange={(event) => handleChange('instruction', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-emerald-500/50 transition-colors min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">Use variables like {'{input}'} to reference context</p>
      </motion.div>

      {/* Include History Toggle */}
      <motion.div 
        variants={itemVariants} 
        className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/50 mb-4"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Include Chat History</Label>
        </div>
        <Switch
          checked={formData.includeHistory}
          onCheckedChange={(checked) => handleChange('includeHistory', checked)}
          className="data-[state=checked]:bg-emerald-500"
        />
      </motion.div>

      {/* Model Selection */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-emerald-500" />
          Model
        </Label>
        <Select
          value={formData.model}
          onValueChange={(value) => handleChange('model', value)}
        >
          <SelectTrigger className="bg-muted/50 border-border/50 focus:border-emerald-500/50">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='gemini-flash-1.5'>Gemini Flash 1.5</SelectItem>
            <SelectItem value='gemini-pro-1.5'>Gemini Pro 1.5</SelectItem>
            <SelectItem value='gemini-pro-2.0'>Gemini Pro 2.0</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Output Format */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium">Output Format</Label>
        <Tabs
          value={formData.output}
          onValueChange={(value) => handleChange('output', value)}
          className="w-full"
        >
          <TabsList className="w-full bg-muted/50 p-1">
            <TabsTrigger value="Text" className="flex-1 data-[state=active]:bg-background">Text</TabsTrigger>
            <TabsTrigger value="Json" className="flex-1 data-[state=active]:bg-background">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="Text" className="mt-2">
            <p className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
              Output will be returned as plain text
            </p>
          </TabsContent>
          <TabsContent value="Json" className="mt-2 space-y-2">
            <Label className="text-xs text-muted-foreground">JSON Schema</Label>
            <Textarea
              placeholder='{"title": "string", "content": "string"}'
              value={formData.schema}
              onChange={(event) => handleChange('schema', event.target.value)}
              className="bg-muted/50 border-border/50 focus:border-emerald-500/50 font-mono text-xs min-h-[60px]"
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <Button 
          className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  )
}
