import { UserDetailContextType } from "@/lib/types";
import { createContext, useContext } from "react";

export const UserDetailContext = createContext<UserDetailContextType | undefined>(undefined);

export function useUserDetail(){
    const context = useContext(UserDetailContext);
    if(!context){
        throw new Error("useUserDetail must be used within a UserDetailProvider");
    }
    return context;
}