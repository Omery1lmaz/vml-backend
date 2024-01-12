import moongose from "mongoose";

const connectDB = async () => {
  const connectionParams: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    await moongose.connect(
      "mongodb+srv://namlimakinadatabase:6tVhSHxwEcqh9dXa@cluster0.bu9tqw4.mongodb.net/?retryWrites=true&w=majority",
      connectionParams
    );
    console.log("Connected to MongoDB");
  } catch (err) {
    process.exit(1);
  }
};

export default connectDB;
