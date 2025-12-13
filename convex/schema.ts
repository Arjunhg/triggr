import { defineSchema, defineTable } from "convex/server";
import { v } from 'convex/values';

const MeasuredSchema = v.object({
  height: v.optional(v.number()),
  width: v.optional(v.number()),
});

const PositionSchema = v.object({
  x: v.number(),
  y: v.number(),
});

export const NodeSchema = v.object({
  id: v.string(),
  position: PositionSchema,
  data: v.any(),
  type: v.optional(v.string()),
  dragging: v.optional(v.boolean()),
  measured: v.optional(MeasuredSchema),
  selected: v.optional(v.boolean()),
})

export const EdgeSchema = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  type: v.optional(v.string()),
  animated: v.optional(v.boolean()),
  style: v.optional(v.any()),
  markerEnd: v.optional(v.any()),
  sourceHandle: v.optional(v.string()),
  targetHandle: v.optional(v.string()),
  label: v.optional(v.string()),
  data: v.optional(v.any()),
})

export default defineSchema({
  UserTable: defineTable({
    name: v.string(),
    email: v.string(),
    subscription: v.optional(v.string()),
    token: v.optional(v.number())
  }).index("byEmail", ["email"]),


  AgentTable: defineTable({
    agentId: v.string(),
    name: v.string(),
    config: v.optional(v.any()),
    nodes: v.optional(v.array(NodeSchema)),
    edges: v.optional(v.array(EdgeSchema)), 
    published: v.boolean(),
    userId: v.id("UserTable"),
    agentToolConfig: v.optional(v.any())
  })
  .index("byUser", ["userId"])
  .index("byAgentId", ["agentId"]),
})