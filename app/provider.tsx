'use client';
import { AgentContext } from '@/context/AgentContext';
import { UserDetailContext } from '@/context/UserDetailsContext';
import { api } from '@/convex/_generated/api';
import { EdgeType, NodeType, UserDetails } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useEffect, useState } from 'react'

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const { user } = useUser();
    const createUser = useMutation(api.user.createNewUser);
    const [userDetails, setUserDetails] = useState<UserDetails | undefined>(undefined);

    useEffect(() =>{
        if(!user) return;
        async function createAndGetUser(){
            try{
                const result = await createUser({
                    name: user?.fullName ?? 'No Name',
                    email: user?.primaryEmailAddress?.emailAddress ?? 'No Email'
                });
                setUserDetails(result);
            }catch(err){
                console.error("Error creating or fetching user:", err);
            }
        }
        createAndGetUser();
    }, [user, createUser]);

     // AgentSpecific
    const [addedNodes, setAddedNodes] = useState<NodeType[]>([]);

    const [addedEdges, setAddedEdges] = useState<EdgeType[]>([]);

    const [selectedNode,setSelectedNode]=useState<any>()
    
    return (
        <UserDetailContext.Provider value={{userDetails, setUserDetails}}>
            <AgentContext.Provider value={{addedNodes, setAddedNodes, addedEdges, setAddedEdges, selectedNode, setSelectedNode}}>
                <div>
                    {children}
                </div>
            </AgentContext.Provider>
        </UserDetailContext.Provider>
    )
}