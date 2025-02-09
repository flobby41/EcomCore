const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        console.log("🔑 Headers reçus:", req.headers);
        
        const authHeader = req.headers.authorization;
        console.log("🔑 Auth Header reçu:", authHeader);

        if (!authHeader) {
            console.log("❌ Pas d'en-tête d'autorisation");
            return res.status(401).json({ message: "Pas de token fourni" });
        }

        // Vérifier et extraire le token
        const token = authHeader.replace('Bearer ', '');
        console.log("🔑 Token extrait:", token.substring(0, 20) + "...");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token décodé:", decoded);

        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Erreur d'authentification:", error);
        res.status(401).json({ message: "Token invalide", error: error.message });
    }
};

module.exports = authMiddleware;