'use client';

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/variants'
import { Globe, Sparkles, Link2, Send, FileJson, Braces, Save, Key, Shield } from 'lucide-react'
import { ApiSettingsProps, ApiNodeSettings, ApiAuthType } from '@/lib/types';

const httpMethods: ApiNodeSettings['method'][] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const methodColors: Record<ApiNodeSettings['method'], string> = {
  GET: 'text-green-500',
  POST: 'text-blue-500',
  PUT: 'text-amber-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-red-500',
}

const authTypes: { value: ApiAuthType; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No authentication' },
  { value: 'bearer', label: 'Bearer Token', description: 'Authorization: Bearer <key>' },
  { value: 'query', label: 'Query Parameter', description: 'Append key to URL (?key=...)' },
  { value: 'header', label: 'Custom Header', description: 'Custom header name (X-API-Key, etc.)' },
]

const ApiAgentSettings: React.FC<ApiSettingsProps> = ({ selectedNode, updateFormData }) => {
  const [formData, setFormData] = useState<ApiNodeSettings>({
    name: '',
    endpoint: '',
    method: 'GET',
    headers: '',
    body: '',
    authType: 'none',
    apiKey: '',
    apiKeyName: 'key',
  })

  useEffect(() => {
    if (selectedNode?.data?.settings) {
      setFormData((prev) => ({
        ...prev,
        ...selectedNode.data.settings,
      }))
    }
  }, [selectedNode])

  const handleChange = <K extends keyof ApiNodeSettings>(key: K, value: ApiNodeSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
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
          <div className="absolute inset-0 bg-cyan-500/30 blur-md rounded-xl pointer-events-none" />
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30">
            <Globe className="h-5 w-5 text-cyan-500" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">API Settings</h2>
          <p className="text-xs text-muted-foreground">Configure external API calls</p>
        </div>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

      {/* Name Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          Step Name
        </Label>
        <Input
          placeholder='Enter step name...'
          value={formData.name}
          onChange={(event) => handleChange('name', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-cyan-500/50 transition-colors"
        />
      </motion.div>

      {/* Endpoint Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 text-cyan-500" />
          Endpoint URL
        </Label>
        <Input
          placeholder='https://api.example.com/v1/resource'
          value={formData.endpoint}
          onChange={(event) => handleChange('endpoint', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-cyan-500/50 transition-colors font-mono text-sm"
        />
      </motion.div>

      {/* Method Selection */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Send className="h-3.5 w-3.5 text-cyan-500" />
          HTTP Method
        </Label>
        <Select
          value={formData.method}
          onValueChange={(value) => handleChange('method', value as ApiNodeSettings['method'])}
        >
          <SelectTrigger className="bg-muted/50 border-border/50 focus:border-cyan-500/50">
            <SelectValue>
              <span className={methodColors[formData.method]}>{formData.method}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {httpMethods.map((item) => (
              <SelectItem key={item} value={item}>
                <span className={methodColors[item]}>{item}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Authentication Section */}
      <motion.div variants={itemVariants} className="space-y-3 mb-4 p-3 rounded-xl bg-muted/30 border border-border/50">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-cyan-500" />
          Authentication
        </Label>
        
        {/* Auth Type Selection */}
        <Select
          value={formData.authType || 'none'}
          onValueChange={(value) => handleChange('authType', value as ApiAuthType)}
        >
          <SelectTrigger className="bg-muted/50 border-border/50 focus:border-cyan-500/50">
            <SelectValue placeholder="Select auth type" />
          </SelectTrigger>
          <SelectContent>
            {authTypes.map((auth) => (
              <SelectItem key={auth.value} value={auth.value}>
                <div className="flex flex-col">
                  <span>{auth.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {authTypes.find(a => a.value === (formData.authType || 'none'))?.description}
        </p>

        {/* API Key Input - show if auth type is not 'none' */}
        {formData.authType && formData.authType !== 'none' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Key className="h-3 w-3" />
                API Key
              </Label>
              <Input
                type="password"
                placeholder="Enter your API key..."
                value={formData.apiKey || ''}
                onChange={(event) => handleChange('apiKey', event.target.value)}
                className="bg-muted/50 border-border/50 focus:border-cyan-500/50 transition-colors font-mono text-sm"
              />
            </div>

            {/* Key Name - for query param or custom header */}
            {(formData.authType === 'query' || formData.authType === 'header') && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {formData.authType === 'query' ? 'Query Parameter Name' : 'Header Name'}
                </Label>
                <Input
                  placeholder={formData.authType === 'query' ? 'key' : 'X-API-Key'}
                  value={formData.apiKeyName || ''}
                  onChange={(event) => handleChange('apiKeyName', event.target.value)}
                  className="bg-muted/50 border-border/50 focus:border-cyan-500/50 transition-colors text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.authType === 'query' 
                    ? `Will append ?${formData.apiKeyName || 'key'}=<your-key> to URL`
                    : `Will add ${formData.apiKeyName || 'X-API-Key'}: <your-key> header`}
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Headers Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileJson className="h-3.5 w-3.5 text-cyan-500" />
          Additional Headers (JSON)
        </Label>
        <Textarea
          placeholder='{"Content-Type": "application/json"}'
          value={formData.headers}
          onChange={(event) => handleChange('headers', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-cyan-500/50 transition-colors font-mono text-xs min-h-[70px] resize-none"
        />
      </motion.div>

      {/* Body Field */}
      <motion.div variants={itemVariants} className="space-y-2 mb-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Braces className="h-3.5 w-3.5 text-cyan-500" />
          Request Body
        </Label>
        <Textarea
          placeholder='{"key": "value", "data": "{input}"}'
          value={formData.body}
          onChange={(event) => handleChange('body', event.target.value)}
          className="bg-muted/50 border-border/50 focus:border-cyan-500/50 transition-colors font-mono text-xs min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use variables like {'{input}'} or {'{output}'} to pass data
        </p>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <Button 
          className="w-full gap-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" 
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default ApiAgentSettings