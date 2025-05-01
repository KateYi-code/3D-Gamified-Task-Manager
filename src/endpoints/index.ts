import { APIs } from "./types";
import { shaped } from "@/common/shaped";
import {
  addFollowing,
  createUser,
  getMe,
  getMyFollowers,
  getMyFollowings,
  getUserById,
  getUsers,
  userLogin,
  userLogout,
  userRegister,
} from "@/endpoints/users/services/user.service";

export const authEndpoints = shaped<APIs>()({
  getMe,
  userLogout,
  addFollowing,
  getMyFollowings,
  getMyFollowers,
});

export const unauthEndpoints = shaped<APIs>()({
  getUsers,
  getUserById,
  createUser,
  userLogin,
  userRegister,
});

export const endpoints = shaped<APIs>()({
  ...authEndpoints,
  ...unauthEndpoints,
});

export type EndpointKey = keyof typeof endpoints;
export type Endpoints = typeof endpoints;
export type ReturnOfEndpoint<K extends EndpointKey> = Awaited<ReturnType<Endpoints[K]>>;
