const {sign,verify} = require("jsonwebtoken");

const createTokens = (user) => {
    const accessToken = sign({username: user.userName, id: user.userId},
        "jwtsecretplschange"
        );
    return accessToken
};



module.exports = {createTokens};