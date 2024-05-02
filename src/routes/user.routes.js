import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  checkAuthStatus,
  addManageUser,
  getManageUsers,
  updateManageUser,
  deleteManageUser,
  addRole,
  getAllRoles,
  getRole,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middlewares.js";

const userRouter = Router();
userRouter.post("/signup", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/check-auth", verifyJWT, checkAuthStatus);
userRouter.post("/logout",verifyJWT, logoutUser);
userRouter.get("/get-manage-users",verifyJWT, getManageUsers);
userRouter.post("/add-manage-user",verifyJWT, addManageUser);
userRouter.post("/update-manage-user",verifyJWT, updateManageUser);
userRouter.post("/delete-manage-user",verifyJWT, deleteManageUser);
userRouter.post("/add-role",verifyJWT, addRole);
userRouter.get("/get-all-roles",verifyJWT, getAllRoles);
userRouter.get("/get-role",verifyJWT, getRole);
export default userRouter;
