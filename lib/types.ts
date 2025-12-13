import { Dispatch, SetStateAction } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Node, Edge } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";

export type UserDetails = {
  _id?: Id<"UserTable">;
  _creationTime?: number;
  name: string;
  email: string;
  token?: number;
}

export type UserDetailContextType = {
  userDetails: UserDetails | undefined;
  setUserDetails: Dispatch<SetStateAction<UserDetails | undefined>>;
}

type MeasuredType = {
  height?: number;
  width?: number;    
}
type PositionType = {
  x: number;
  y: number;
}
export type NodeDataType = {
  bgColor?: string;
  id?: string;
  label?: string;
  type?: string;
  [key: string]: unknown;
}

export type NodeType = Node<NodeDataType>;

export type EdgeType = Edge & {
  animated?: boolean;
  style?: Record<string, unknown>;
  markerEnd?: unknown;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  data?: unknown;
};

export type AgentDetails = {
  _id: Id<"AgentTable">;
  agentId: string;
  name: string;
  config?: any;
  nodes?: NodeType[];
  edges?: EdgeType[];
  published: boolean;
  userId: Id<"UserTable">;
  agentToolConfig?: any;
  _creationTime?: number;
}

export type AgentContextType = {
  addedNodes: NodeType[];
  setAddedNodes: Dispatch<SetStateAction<NodeType[]>>;
  addedEdges: EdgeType[];
  setAddedEdges: Dispatch<SetStateAction<EdgeType[]>>;
  selectedNode: NodeType | null;
  setSelectedNode: Dispatch<SetStateAction<NodeType | null>>;
}

type LabelNodeData = { label: string };
export type LabelNode = Node<LabelNodeData, 'text'>;

export type AgentToolType = {
  name: string;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
  iconColor: string;
  id: string;
  type: string;
}

// ============================================
// Node Settings Types
// ============================================

// Agent Node Settings
export type AgentNodeSettings = {
  name: string;
  instruction: string;
  includeHistory: boolean;
  model: string;
  output: 'Text' | 'Json';
  schema: string;
}

// End Node Settings
export type EndNodeSettings = {
  schema: string;
}

// IfElse Node Settings
export type IfElseNodeSettings = {
  ifCondition: string;
}

// While Node Settings
export type WhileNodeSettings = {
  whileCondition: string;
}

// User Approval Node Settings
export type UserApprovalNodeSettings = {
  name: string;
  message: string;
}

// API Node Settings
export type ApiNodeSettings = {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: string;
  body: string;
}

// Union type for all settings
export type NodeSettings = 
  | AgentNodeSettings 
  | EndNodeSettings 
  | IfElseNodeSettings 
  | WhileNodeSettings 
  | UserApprovalNodeSettings 
  | ApiNodeSettings;

// ============================================
// Node Data Types (with settings)
// ============================================

// Base node data shared by all nodes
type BaseNodeData = {
  id: string;
  label: string;
  bgColor: string;
  type?: string;
}

// Specific node data types
export type AgentNodeData = BaseNodeData & {
  settings?: AgentNodeSettings;
}

export type EndNodeData = BaseNodeData & {
  settings?: EndNodeSettings;
}

export type IfElseNodeData = BaseNodeData & {
  settings?: IfElseNodeSettings;
}

export type WhileNodeData = BaseNodeData & {
  settings?: WhileNodeSettings;
}

export type UserApprovalNodeData = BaseNodeData & {
  settings?: UserApprovalNodeSettings;
}

export type ApiNodeData = BaseNodeData & {
  settings?: ApiNodeSettings;
}

// ============================================
// Full Node Types (for React Flow)
// ============================================

export type AgentNode = Node<AgentNodeData, 'AgentNode'>;
export type EndNode = Node<EndNodeData, 'EndNode'>;
export type IfElseNode = Node<IfElseNodeData, 'IfElseNode'>;
export type WhileNode = Node<WhileNodeData, 'WhileNode'>;
export type UserApprovalNode = Node<UserApprovalNodeData, 'UserApprovalNode'>;
export type ApiNode = Node<ApiNodeData, 'ApiNode'>;

// Props types for settings components
export type AgentSettingsProps = {
  selectedNode: AgentNode;
  updateFormData: (data: AgentNodeSettings) => void;
}

export type EndSettingsProps = {
  selectedNode: EndNode;
  updateFormData: (data: EndNodeSettings) => void;
}

export type IfElseSettingsProps = {
  selectedNode: IfElseNode;
  updateFormData: (data: IfElseNodeSettings) => void;
}

export type WhileSettingsProps = {
  selectedNode: WhileNode;
  updateFormData: (data: WhileNodeSettings) => void;
}

export type UserApprovalSettingsProps = {
  selectedNode: UserApprovalNode;
  updateFormData: (data: UserApprovalNodeSettings) => void;
}

export type ApiSettingsProps = {
  selectedNode: ApiNode;
  updateFormData: (data: ApiNodeSettings) => void;
}