const mongoose=require("mongoose");
require('dotenv').config();
const password=process.env.DB_PASS;
const connectDB=async()=>{
try{
        const conn=await mongoose.connect("mongodb+srv://mr_ayan:"+password+"@projectcluster.t3vfk.mongodb.net/MeetingScheduler",{
            // useNewUrlParser: true,
          
    });
    console.log("MongoDB connected:"+conn.connection.host)
    }
    catch(error){
        console.log(error)
    }
}
module.exports=connectDB;