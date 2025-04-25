import { APIs } from "../types";
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

export const userEndpoints = shaped<APIs>()({
  "unauth/user/list": getUsers,
  "unauth/user/get": getUserById,
  "unauth/user/create": createUser,
  "auth/user/me": getMe,
  "unauth/user/login": userLogin,
  "unauth/user/logout": userLogout,
  "unauth/user/register": userRegister,
});
