'use client';

import React, { useState } from 'react'
import AgentSettings from '../_nodeSettings/AgentSettings'
import EndSettings from '../_nodeSettings/EndSettings'
import WhileSettings from '../_nodeSettings/WhileSettings'
import UserApproval from '../_nodeSettings/UserApproval'
import ApiAgentSettings from '../_nodeSettings/ApiSettings'
import IfElseSettings from '../_nodeSettings/IfElseSettings'
import { useAgentContext } from '@/context/AgentContext'
import { motion, AnimatePresence } from 'framer-motion'
import { itemVariants } from '@/lib/variants'
import { Settings2, PanelRightClose, PanelRight } from 'lucide-react'
import { 
  NodeType, 
  NodeSettings,
  AgentNode, 
  EndNode, 
  IfElseNode, 
  WhileNode, 
  UserApprovalNode, 
  ApiNode 
} from '@/lib/types'

export default function PanelSetting() {
  const { selectedNode, setAddedNodes } = useAgentContext();
  const [isOpen, setIsOpen] = useState(true);

  const onUpdateNodeData = (formData: NodeSettings) => {
    if (!selectedNode) return
    
    const newLabel = 'name' in formData ? formData.name : selectedNode.data?.label;
    
    const updatedNode: NodeType = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        label: newLabel ?? selectedNode.data?.label,
        settings: formData,
      },
    }

    setAddedNodes((prevNodes: NodeType[]) =>
      prevNodes.map((node: NodeType) =>
        node.id === selectedNode.id ? updatedNode : node
      )
    )
  }

  // Panel animation: closes from bottom-left to top-right
  const panelVariants = {
    open: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05,
      }
    },
    closed: {
      opacity: 0,
      scale: 0.3,
      x: 100,
      y: -150,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
      }
    }
  };

  let content: React.ReactNode = (
    <motion.div 
      variants={itemVariants}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-muted-foreground/10 blur-xl rounded-full" />
        <div className="relative p-4 rounded-2xl bg-muted/50 border border-border/50">
          <Settings2 className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <p className="text-muted-foreground text-sm">Select a node to configure its settings</p>
    </motion.div>
  )

  switch (selectedNode?.type) {
    case 'AgentNode':
      content = (
        <AgentSettings
          selectedNode={selectedNode as AgentNode}
          updateFormData={onUpdateNodeData}
        />
      )
      break
    case 'EndNode':
      content = (
        <EndSettings
          selectedNode={selectedNode as EndNode}
          updateFormData={onUpdateNodeData}
        />
      )
      break
    case 'IfElseNode':
      content = (
        <IfElseSettings
          selectedNode={selectedNode as IfElseNode}
          updateFormData={onUpdateNodeData}
        />
      )
      break
    case 'WhileNode':
      content = (
        <WhileSettings
          selectedNode={selectedNode as WhileNode}
          updateFormData={onUpdateNodeData}
        />
      )
      break
    case 'UserApprovalNode':
      content = (
        <UserApproval
          selectedNode={selectedNode as UserApprovalNode}
          updateFormData={onUpdateNodeData}
        />
      )
      break
    case 'ApiNode':
      content = (
        <ApiAgentSettings
          selectedNode={selectedNode as ApiNode}
          updateFormData={onUpdateNodeData}
        />
      )
      break
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute top-0 right-0 z-10
          p-2.5 rounded-xl
          bg-background/80 backdrop-blur-xl
          border border-border/50
          shadow-lg
          hover:bg-muted/50
          transition-colors duration-200
          ${isOpen ? 'opacity-70 hover:opacity-100' : ''}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isOpen ? "Close panel" : "Open panel"}
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <PanelRightClose className="h-4 w-4 text-primary" />
          ) : (
            <PanelRight className="h-4 w-4 text-primary" />
          )}
        </motion.div>
      </motion.button>

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="w-[320px] md:w-[350px] bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto origin-top-right"
            style={{ transformOrigin: 'top right' }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


