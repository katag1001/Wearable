const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(`[auth] ${req.method} ${req.originalUrl} rejected - no token`);
    return res.status(401).json({
      ok: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwt_secret);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.log(`[auth] ${req.method} ${req.originalUrl} rejected -`, err.message);
    return res.status(401).json({
      ok: false,
      message: "Invalid or expired token",
    });
  }
};