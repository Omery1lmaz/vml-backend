import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IAddress } from "../Address";

const userSchema = new mongoose.Schema(
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
    number: {
      type: String,
      required: false,
      unique: false,
      default: "",
    },
    accountType: {
      type: String,
      enum: ["google", "email"],
      required: true,
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.accountType === "email";
      },
    },
    address: {
      required: false,
      type: mongoose.Types.ObjectId,
      ref: "Address",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (this: any, next: any) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;

export interface IUser extends Document {
  name: string;
  email: string;
  number?: string;
  accountType: "google" | "email";
  password?: string;
  address?: Schema.Types.ObjectId | IAddress;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  number?: string;
  accountType: "google" | "email";
  password?: string;
  address?: Schema.Types.ObjectId | IAddress;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
