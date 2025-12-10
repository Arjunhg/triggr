import { Dispatch, SetStateAction } from "react";

export type UserDetails = {
  _id?: string;
  _creationTime?: number;
  name: string;
  email: string;
  token?: number;
}

export type UserDetailContextType = {
  userDetails: UserDetails | undefined;
  setUserDetails: Dispatch<SetStateAction<UserDetails | undefined>>;
}