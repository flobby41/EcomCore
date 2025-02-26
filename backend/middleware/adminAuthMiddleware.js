const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès non autorisé" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        req.admin = decoded; // ✅ Ajoute l'admin à la requête
        next(); // 🔥 Passe à la route suivante
    } catch (error) {
        console.error("❌ Erreur de vérification du token admin:", error);
        res.status(403).json({ message: "Token invalide" });
    }
};