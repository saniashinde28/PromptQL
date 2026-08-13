function authenticateAPIkey(req,res,next){
    const apikey=req.headers["x-api-key"];

    if(!apikey || apikey!=process.env.API_KEY){
        return res.status(401).json({
            success: false,
            error: "Invalid API key"
        });
    }
    next();
}

module.exports = {authenticateAPIkey}