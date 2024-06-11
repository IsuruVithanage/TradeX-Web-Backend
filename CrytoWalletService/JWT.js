const {sign,verify} = require("jsonwebtoken");

const createTokens = (user) => {
    const accessToken = sign({username: user.userName, id: user.userId},
        "jwtsecretplschange"
        );
    return accessToken
};

const validateToken = (req,res,next) => {
   
    const accessToken = req.cookies["access-token"] ;

    if (!accessToken)
     return res.status(400).json({error:"User not Authenticated"});

     try{
        const validToken = verify(accessToken,"jwtsecretplschange")
        // const validToken = true;
        if (validToken){
            req.authenticated = true
            return next()
        }else{
            return res.status(400).json({message:"not valid user"});

        }
        


     } catch(error){
        return res.status(400).json({error:error});

     }
};

module.exports = {createTokens,validateToken};