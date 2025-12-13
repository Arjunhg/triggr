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
  [key: string]: unknown; // Allow additional properties for React Flow compatibility
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