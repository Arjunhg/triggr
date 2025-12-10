import { UserDetailContextType } from "@/lib/types";
import { createContext } from "react";

export const UserDetailContext = createContext<UserDetailContextType | undefined>(undefined);