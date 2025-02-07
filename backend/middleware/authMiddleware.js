const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Accès refusé, aucun token fourni." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Ajoute l'utilisateur à la requête
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide." });
    }
};

module.exports = authMiddleware;