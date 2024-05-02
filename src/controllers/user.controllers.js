import { ManageUser } from "../models/manageUser.models.js";
import { Role } from "../models/role.models.js";
import { User } from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const generateTokens = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    const accessToken = await user.createAccessToken();
    const refreshToken = await user.createRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
};
const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  withCredentials: true,
};
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // checking password

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Password must be atleast 6 characters",
      });
    }
    // checking email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Invalid email",
      });
    }
    // checking if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User with this email already exists",
      });
    }
    // creating user
    const user = await User.create({
      name,
      email,
      password,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not created",
      });
    }
    // generating tokens
    const { accessToken, refreshToken } = await generateTokens(user._id);
    // created user
    const createdUser = await User.findById({ _id: user._id }).select(
      "-password -refreshToken"
    );
    // sending response
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json({
        success: true,
        data: { user: createdUser },
        message: "User created successfully",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
// {
//     "email":"test@gmail.com",
//     "name":"Test",
//     "password":"123456",
//     "confirmPassword":"123456"
// }
const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // checking email
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not registered",
      });
    }
    const checkPassword = await user.matchPassword(password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Incorrect Password",
      });
    }
    const { accessToken, refreshToken } = await generateTokens(user._id);
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
        },
        message: "User logged in successfully",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
// {
//     "email":"test@gmail.com",
//     "password":"123456",
// }
const logoutUser = asyncHandler(async (req, res, next) => {
  try {
    // const { refreshToken } = req.cookies;
    // if (!refreshToken) {
    //   return res.status(400).json({
    //     success: false,
    //     data: {},
    //     message: "User not logged in",
    //   });
    // }
    // const user = await User.findOne({ refreshToken });

    // if (!user) {
    //   return res.status(400).json({
    //     success: false,
    //     data: {},
    //     message: "User not found",
    //   });
    // }
    // user.refreshToken = "";
    // await user.save({
    //   validateBeforeSave: false,
    // });
    const { _id } = req.user._id;
    await User.findByIdAndUpdate(
      _id,
      {
        unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res.status(200).json({
      success: true,
      data: {},
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});

const checkAuthStatus = asyncHandler(async (req, res, next) => {
  try {
    const { _id } = req.user._id;
    const user = await User.findById(_id).select("-password -refreshToken");
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: { user },
      message: "User authenticated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});

const addManageUser = asyncHandler(async (req, res, next) => {
  try {
    const { firstName, lastName, age, role } = req.body;
    const { _id } = req.user._id;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    const manageUser = await ManageUser.create({
      firstName,
      lastName,
      age,
      role,
    });
    if (!manageUser) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Manage User not created",
      });
    }
    user.manageUsers.push(manageUser._id);
    await user.save({
      validateBeforeSave: false,
    });
    return res.status(200).json({
      success: true,
      data: { manageUser },
      message: "Manage User created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
const updateManageUser = asyncHandler(async (req, res, next) => {
  try {
    const { firstName, lastName, age, role, manageUserId } = req.body;
    const { _id } = req.user._id;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    await ManageUser.findByIdAndUpdate(
      {
        _id: manageUserId,
      },
      {
        firstName,
        lastName,
        age,
        role,
      }
    ).then((oldManageUser) => {
      if (!oldManageUser) {
        return res.status(400).json({
          success: false,
          data: {},
          message: "Manage User not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: { oldManageUser },
        message: "Manage User updated successfully",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
const getManageUsers = asyncHandler(async (req, res, next) => {
  try {
    const { _id } = req.user._id;
    const user = await User.findById(_id).populate("manageUsers");
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: { manageUsers: user.manageUsers },
      message: "Manage Users fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
const deleteManageUser = asyncHandler(async (req, res, next) => {
  try {
    const { manageUserId } = req.body;
    const { _id } = req.user._id;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    await ManageUser.findByIdAndDelete({ _id: manageUserId }).then(
      (manageUser) => {
        if (!manageUser) {
          return res.status(400).json({
            success: false,
            data: {},
            message: "Manage User not found",
          });
        }
        return res.status(200).json({
          success: true,
          data: {},
          message: "Manage User deleted successfully",
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});

const getAllRoles = asyncHandler(async (req, res, next) => {
  try {
    const { _id } = req.user._id;
    const user = await User.findById(_id).populate("manageRoles");
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Roles not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: { roles: user.manageRoles },
      message: "Roles fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
const addRole = asyncHandler(async (req, res, next) => {
  try {
    const { roleName, permissions } = req.body;
    const { _id } = req.user._id;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    const roleExists = await Role.findOne({ name: roleName });
    if (roleExists) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Role already exists",
      });
    }
    const role = await Role.create({
      name: roleName,
      permissions,
    });
    if (!role) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Role not created",
      });
    }
    user.manageRoles.push(role._id);
    await user.save({
      validateBeforeSave: false,
    });
    return res.status(200).json({
      success: true,
      data: { role },
      message: "Role created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
const getRole = asyncHandler(async (req, res, next) => {
  try {
    const { manageUserId } = req.body;
    const { _id } = req.user._id;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "User not found",
      });
    }
    const manageUser = await ManageUser.findById(manageUserId);
    if (!manageUser) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Manage User not found",
      });
    }
    const role = await Role.findById(manageUser.role);
    if (!role) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Role not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: { role },
      message: "Role fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      data: { error },
      message: "Internal server error",
    });
  }
});
export {
  registerUser,
  loginUser,
  logoutUser,
  checkAuthStatus,
  addManageUser,
  getManageUsers,
  updateManageUser,
  deleteManageUser,
  addRole,
  getAllRoles,
  getRole,
};
