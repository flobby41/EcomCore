const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: "Access restricted to administrators" });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error("❌ Admin token verification error:", error);
        res.status(403).json({ message: "Invalid token" });
    }
};