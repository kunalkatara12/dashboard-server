import { User } from "../models/User.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
const { verify } = jwt;
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(400).json({
        status: false,
        data: {},
        message:
          "Please login to access this resource in verifyJWT.middlewares.js",
      });
    }
    const decodedToken = verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(400).json({
        status: false,
        data: {},
        message: "No User Found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      data: { error },
      message: "Internal Server Error",
    });
  }
});
