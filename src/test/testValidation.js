const {validateSqlQuery}=require("../services/validationService");

async function test(){
    const validQuery="SELECT * FROM users";

    const invalidQuery="SELEC * FROM users";

    console.log("Valid query :",await validateSqlQuery(validQuery));

    console.log("Invalid query :",await validateSqlQuery(invalidQuery));



};

test();