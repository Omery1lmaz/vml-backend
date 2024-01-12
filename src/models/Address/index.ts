import mongoose, { Document } from "mongoose";

interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  apartment?: string;
}

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  apartment: {
    type: String,
    // This field is optional
  },
});

const Address = mongoose.model<IAddress>("Address", addressSchema);

export default Address;

export { IAddress };
