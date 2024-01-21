import moongose from "mongoose";

const connectDB = async () => {
  const connectionParams: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    await moongose.connect(
      "mongodb+srv://vmlsoftwarecomp:VDgaHt0QJCwWzJX4@cluster0.lc5jirw.mongodb.net/?retryWrites=true&w=majority",
      connectionParams
    );
    console.log("Connected to MongoDB");
  } catch (err) {
    process.exit(1);
  }
};

export default connectDB;
