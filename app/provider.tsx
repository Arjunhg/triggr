'use client';
import { UserDetailContext } from '@/context/UserDetailsContext';
import { api } from '@/convex/_generated/api';
import { UserDetails } from '@/lib/types';
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
    
    return (
        <UserDetailContext.Provider value={{userDetails, setUserDetails}}>
        <div>
            {children}
        </div>
        </UserDetailContext.Provider>
    )
}