import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const CreateAgent = mutation({
    args: {
        name: v.string(),
        agentId: v.string(),
        userId: v.id('UserTable'),
    },
    handler: async(ctx, args) => {
        // First check if an agent with the same agentId already exists
        const existingAgent = await ctx.db
            .query('AgentTable')
            .withIndex('byAgentId', (q) => q.eq('agentId', args.agentId))
            .first();

        if(existingAgent){
            throw new Error("Agent with the same agentId already exists.");
        }

        // If not, create a new agent
        const result = await ctx.db.insert('AgentTable', {
            name: args.name,
            agentId: args.agentId,
            published: false,
            userId: args.userId
        });
        return result;
    }
})

export const GetUserAgents = query({
    args: {
        userId: v.id('UserTable')
    },
    handler: async(ctx, args) => {
        const result = await ctx.db
            .query('AgentTable')
            .withIndex('byUser', (q) => q.eq('userId', args.userId))
            .order('desc')
            .collect();
        return result;
    }
})

export const GetAgentById = query({
    args: {
        agentId: v.string()
    },
    handler: async(ctx, args) => {
        const result = await ctx.db
            .query('AgentTable')
            .withIndex('byAgentId', (q) => q.eq('agentId', args.agentId))
            .first();

        return result;
    }
})

export const UpdateAgentWorkflow = mutation({
    args: {
        agentId: v.string(),
        nodes: v.any(),
        edges: v.any()
    },
    handler: async(ctx, args) => {
        const existingAgent = await ctx.db
            .query('AgentTable')
            .withIndex('byAgentId', (q) => q.eq('agentId', args.agentId))
            .first();

        if(!existingAgent){
            throw new Error("Agent not found.");
        }

        const updatedAgent = await ctx.db.patch(existingAgent._id, {
            nodes: args.nodes,
            edges: args.edges
        });

        return updatedAgent;
    }
})