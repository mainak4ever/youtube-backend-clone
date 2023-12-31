import dotenv from "dotenv";
dotenv.config({
  path: `./.env`,
});
import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("Error connecting to the database", error);
  });

/*


import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

(async () => {
  try {
    console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error ", (error) => {
      console.log("Error in server: ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error: ", error);
  }
})();
*/
