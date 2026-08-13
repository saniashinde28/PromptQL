const swaggerJsdoc=require("swagger-jsdoc");

const options={
    definition:{
        openapi:"3.0.0",

        info:{
            title:"PromptQL API",
            version:"1.0.0",
            description:"Natural Language Query Gateway API"
        }
    },
    apis:["./server.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports=swaggerSpec;