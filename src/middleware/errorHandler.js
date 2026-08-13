function errorHandler(err,req,res,next){
    console.log(err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal server error"
    });

}

module.exports={errorHandler}