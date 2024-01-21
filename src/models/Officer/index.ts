import mongoose, { Document, Schema } from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: Boolean,
      default: false,
    },
    imageURL: {
      type: String,
      required: true,
      default:
        "https://cdn.discordapp.com/attachments/1056871696449151047/1198341911929421964/Rectangle_5.png?ex=65be8ddf&is=65ac18df&hm=9ab1b6d193277cbeb200ee19d1340a8095debb4abd60b36efc52fc10345282ea&",
    },
  },
  {
    timestamps: true,
  }
);

const Officer = mongoose.model<IOfficer>("Officer", officerSchema);

export default Officer;

export interface IOfficer extends Document {
  name: string;
  number: number;
}
