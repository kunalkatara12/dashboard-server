import { model, Schema } from "mongoose";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
const { sign } = jwt;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken:{
        type:String,
    }
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await hash(user.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return await compare(password, this.password);
};

userSchema.methods.createAccessToken = async function () {
  const payload = {
    _id: this._id,
    email: this.email,
    name: this.name,
  };
  return await sign(payload, process.env.ACCESS_TOKEN_SECRET.toString(), {
    expiresIn: process.env.ACCESS_TOKEN_LIFE,
  });
};
userSchema.methods.createRefreshToken = async function () {
  const payload = {
    _id: this._id,
  };
  return await sign(payload, process.env.REFRESH_TOKEN_SECRET.toString(), {
    expiresIn: process.env.REFRESH_TOKEN_LIFE,
  });
};
export const User = model("User", userSchema);
