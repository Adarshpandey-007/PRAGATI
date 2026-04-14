const jwt = require("jsonwebtoken");

const EXPIRES_IN = "12h";

function signToken(user, secret) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      studentId: user.studentId,
      teacherId: user.teacherId,
      schoolId: user.schoolId,
      email: user.email,
    },
    secret,
    { expiresIn: EXPIRES_IN }
  );
}

function requireAuth(secret) {
  return (req, res, next) => {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = {
  signToken,
  requireAuth,
  EXPIRES_IN,
};
