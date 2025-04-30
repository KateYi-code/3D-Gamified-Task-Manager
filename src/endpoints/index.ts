import { APIs } from "./types";
import { shaped } from "@/common/shaped";
import {
  createUser,
  getMe,
  getUserById,
  getUsers,
  userLogin,
  userLogout,
  userRegister,
} from "@/endpoints/users/services/user.service";

export const authEndpoints = shaped<APIs>()({
  getMe,
  userLogout,
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
