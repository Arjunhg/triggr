import { Dispatch, SetStateAction } from "react";
import { Id } from "@/convex/_generated/dataModel";

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

export type AgentDetails = {
  _id: Id<"AgentTable">;
  agentId: string;
  name: string;
  config?: any;
  nodes?: any;
  edges?: any;
  published: boolean;
  userId: Id<"UserTable">;
  agentToolConfig?: any;
  _creationTime?: number;
}