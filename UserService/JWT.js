const jwt = require('jsonwebtoken');
require('dotenv').config();

const createTokens = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
      { id: user.id, userName: user.userName, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  );
};

const validateToken = (req, res, next) => {
  const token = req.cookies["access-token"];

  if (!token) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  try {
    const validToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = validToken;

    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = { createTokens, validateToken };
