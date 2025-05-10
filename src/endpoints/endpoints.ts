import { APIs } from "./types";
import { shaped } from "@/common/shaped";
import {
  addFollowing,
  createUser,
  getMe,
  getUserById,
  getUsers,
  userLogin,
  userLogout,
  userRegister,
  getMyFollowingMoments
} from "@/endpoints/users/services/user.service";
import {
  createMyTarget,
  deleteMyTarget,
  getMyTargetById,
  getMyTargets,
  updateMyTarget,
} from "@/endpoints/targets/services/target.service";
import {
  followUser,
  unfollowUser,
  getMyFollowings,
  getMyFollowers,
  removeMyFollowing,
  getFollowingsNumber,
  getFollowersNumber,
  isFollowing,
  getMyFollowingsNumber,
  getMyFollowersNumber,
  getProfile,
} from "@/endpoints/friends/services/friends.service";
import {
  createMyTask,
  deleteMyTask,
  updateMyTaskTitle,
  updateMyTaskStatus,
  getMyTaskById,
  getTaskById
} from "@/endpoints/task/services/task.service";

export const authEndpoints = shaped<APIs>()({
  getMe,
  userLogout,
  addFollowing,
  getMyFollowings,
  getMyFollowers,
  getMyTargets,
  createMyTarget,
  getMyTargetById,
  updateMyTarget,
  deleteMyTarget,
  followUser,
  unfollowUser,
  removeMyFollowing,
  isFollowing,
  createMyTask,
  deleteMyTask,
  updateMyTaskTitle,
  updateMyTaskStatus,
  getMyTaskById,
  getMyFollowingMoments,
  getTaskById
});

export const unauthEndpoints = shaped<APIs>()({
  getUsers,
  getUserById,
  createUser,
  userLogin,
  userRegister,
  getFollowingsNumber,
  getFollowersNumber,
  getMyFollowingsNumber,
  getMyFollowersNumber,
  getProfile,
});

export const endpoints = shaped<APIs>()({
  ...authEndpoints,
  ...unauthEndpoints,
});

export type EndpointKey = keyof typeof endpoints;
export type Endpoints = typeof endpoints;
export type ReturnOfEndpoint<K extends EndpointKey> = Awaited<ReturnType<Endpoints[K]>>;
