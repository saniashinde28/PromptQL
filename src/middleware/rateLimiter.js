const rateLimit=require("express-rate-limit");

const queryLimiter=rateLimit({
    windowMs:60*1000,
    max:100,
    message: {
        success: false,
        error: "Too many requests. Please try again later."
    }
});

module.exports = {queryLimiter}