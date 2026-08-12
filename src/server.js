const express=require('express');
const pool=require('./db');
require('dotenv').config();

const app=express();
const PORT=process.env.PORT;
app.use(express.json());

app.get("/health",(req,res)=>{
    res.send("Working!");
});

app.get("/api/users",async(req,res)=>{
    try{
        const result=await pool.query("Select * from users where city='Mumbai'");
        console.log(result.rows);
    }
    catch(err){
        console.log(err);

    }
});

app.listen(PORT,()=>{
    console.log(`Server is running on port , ${PORT}`);
});
