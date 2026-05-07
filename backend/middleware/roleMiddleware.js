/**
 * roleMiddleware("admin") — only allows users whose JWT role matches.
 * Must be used AFTER authMiddleware.
 */
const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated." });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Access forbidden: insufficient privileges." });
  }
  next();
};

module.exports = roleMiddleware;
