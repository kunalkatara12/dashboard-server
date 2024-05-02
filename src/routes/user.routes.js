import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  checkAuthStatus,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middlewares.js";

const userRouter = Router();
userRouter.post("/signup", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/check-auth", verifyJWT, checkAuthStatus);
userRouter.post("/logout",verifyJWT, logoutUser);
export default userRouter;
