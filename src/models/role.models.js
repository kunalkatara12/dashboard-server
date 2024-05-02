import { model, Schema } from "mongoose";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    permissions: Array,
  },
  {
    timestamps: true,
  }
);


export const Role = model("Role", roleSchema);