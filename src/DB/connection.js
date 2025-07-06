import mongoose from "mongoose";
import { config } from 'dotenv'
import path from 'path'
config({path: path.resolve('./src/config/.env')})

export const dbConnection = async (req,res,next) => {
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Conection Done 👉".black.bgBrightBlue); 
  })
  .catch((err) => {
    console.error("Error connecting to database:".red, err);
})
}