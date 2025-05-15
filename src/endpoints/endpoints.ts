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
  getMyFollowingMoments,
  likePost,
  getMyTasks,
  createNewPost,
  getUserPosts,
  getLikeState,
  getPostById,
} from "@/endpoints/users/services/user.service";
import {
  createMyTarget,
  deleteMyTarget,
  getMyTargetById,
  getMyTargets,
  getMyTasksOfWeek,
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
  updateMe,
} from "@/endpoints/friends/services/friends.service";

import {
  savePlanetObject,
  getPlanetObjects,
  deletePlanetObject,
} from "@/endpoints/planet/services/planet.service";

import {
  createMyTask,
  deleteMyTask,
  updateMyTaskTitle,
  updateMyTaskStatus,
  getMyTaskById,
  getTaskById,
  getTaskAndTargetByTaskId,
  UpdateMyTaskAdvanced,
  updateMyTask,
} from "@/endpoints/task/services/task.service";

import { search } from "@/endpoints/search/services/search.service";

export const authEndpoints = shaped<APIs>()({
  getMe,
  userLogout,
  addFollowing,
  getMyFollowings,
  getMyFollowers,
  getMyTargets,
  getMyTasksOfWeek,
  createMyTarget,
  getMyTargetById,
  updateMyTarget,
  deleteMyTarget,
  followUser,
  unfollowUser,
  removeMyFollowing,
  isFollowing,
  savePlanetObject,
  getPlanetObjects,
  deletePlanetObject,
  updateMe,
  createMyTask,
  deleteMyTask,
  updateMyTaskTitle,
  updateMyTaskStatus,
  getMyTaskById,
  getMyFollowingMoments,
  getTaskById,
  likePost,
  getMyTasks,
  createNewPost,
  getLikeState,
  getTaskAndTargetByTaskId,
  UpdateMyTaskAdvanced,
  updateMyTask,
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
  search,
  getUserPosts,
  getPostById,
});

export const endpoints = shaped<APIs>()({
  ...authEndpoints,
  ...unauthEndpoints,
});

export type EndpointKey = keyof typeof endpoints;
export type Endpoints = typeof endpoints;
export type ReturnOfEndpoint<K extends EndpointKey> = Awaited<ReturnType<Endpoints[K]>>;
