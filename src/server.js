const express=require('express');
const pool=require('./db');
const {getDatabaseSchema}=require("./services/schemaService")
require('dotenv').config();

const app=express();
const PORT=process.env.PORT;
app.use(express.json());

app.get("/health",(req,res)=>{
    res.send("Working!");
});
//get schema
app.get("/api/schema",async(req,res)=>{
    try{
        const schema=await getDatabaseSchema();
        res.send(schema);
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            error:"failed to fetch db schema"
        });
    }
});

//get queried data 
app.get("/api/users",async(req,res)=>{
    try{
        const result=await pool.query("Select * from users where city='Mumbai'");
        console.log(result.rows);
        res.send(result.rows);
    }
    catch(err){
        console.log(err);

    }
});

app.listen(PORT,()=>{
    console.log(`Server is running on port , ${PORT}`);
});
