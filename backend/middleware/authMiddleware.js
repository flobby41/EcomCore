const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        console.log("🔑 Headers reçus:", req.headers);

        const authHeader = req.headers.authorization;
        console.log("🔑 Auth Header reçu:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("❌ Pas de token valide");
            return res.status(401).json({ message: "Token manquant ou invalide" });
        }

        // ✅ Correction : Extraire le token correctement
        const token = authHeader.split(" ")[1];
        console.log("🔑 Token extrait:", token.substring(0, 20) + "...");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token décodé:", decoded);

        if (!decoded.userId) {
            console.log("❌ Token décodé mais sans ID:", decoded);
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        req.user = { id: decoded.userId }; // Uniformiser l'accès à l'ID utilisateur

        next();
    } catch (error) {
        console.error("❌ Erreur d'authentification:", error);
        res.status(401).json({ message: "Token invalide", error: error.message });
    }
};

module.exports = authMiddleware;