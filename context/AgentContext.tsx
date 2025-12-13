import { AgentContextType } from "@/lib/types";
import { createContext, useContext } from "react";


export const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function useAgentContext() {
	const context = useContext(AgentContext);
	if (!context) {
		throw new Error("useAgentContext must be used within an AgentContextProvider");
	}
	return context;
}