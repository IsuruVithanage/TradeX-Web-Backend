const jwt = require('jsonwebtoken');
const path = require("path");
require('dotenv').config({path: path.join(__dirname, '...', '.env')});


module.exports = function (params) {
    return function (req, res, next) {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            res.status(403).send({ message: 'No token provided!' });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded.roles || !decoded.roles.includes(params.requiredRole)) {
                res.status(403).send({ message: `Require ${params.requiredRole} Role!` });
                return;
            }
            next();
        } catch (err) {
            res.status(401).send({ message: 'Unauthorized!' });
        }
    };
};