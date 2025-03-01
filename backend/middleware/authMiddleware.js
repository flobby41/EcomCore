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

        const token = authHeader.split(" ")[1];
        console.log("🔑 Token extrait:", token.substring(0, 20) + "...");

        // ✅ Vérifier d'abord si c'est un token admin
        try {
            console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);
            const adminDecoded = jwt.verify(token, process.env.JWT_SECRET);
            if (adminDecoded.isAdmin === true) {
                console.log("✅ Token admin vérifié avec succès");
                req.user = {
                    id: adminDecoded.userId || adminDecoded.id,
                    email: adminDecoded.email,
                    name: adminDecoded.name,
                    isAdmin: true
                };
                return next();
            }
        } catch (adminError) {
            console.log("👤 Pas un token admin, vérification du token utilisateur");
        }

        // Si ce n'est pas un token admin, vérifier le token utilisateur normal
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token décodé:", decoded);

        if (!decoded.userId && !decoded.id) {
            console.log("❌ Token décodé mais sans ID:", decoded);
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        // Uniformiser l'accès à l'ID utilisateur et inclure le nom s'il existe
        req.user = { 
            id: decoded.userId || decoded.id, 
            email: decoded.email,
            name: decoded.name || decoded.username || null
        };

        console.log("👤 Utilisateur authentifié:", req.user);
        next();
    } catch (error) {
        console.error("❌ Erreur d'authentification:", error);
        res.status(401).json({ message: "Token invalide", error: error.message });
    }
};

module.exports = authMiddleware;