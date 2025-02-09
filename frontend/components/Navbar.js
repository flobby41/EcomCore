import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // ✅ Vérifier le token à chaque changement de page
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token); // Convertit en booléen
        };

        checkAuth(); // Vérification au chargement

        // 🔥 Écoute chaque changement d'URL et met à jour `isAuthenticated`
        router.events?.on("routeChangeComplete", checkAuth);

        return () => {
            router.events?.off("routeChangeComplete", checkAuth);
        };
    }, [router.events]);

    const handleLogout = () => {
        localStorage.removeItem("token"); // ✅ Supprime le token
        setIsAuthenticated(false);
        router.push("/login"); // ✅ Redirige vers la page de connexion
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between">
                <Link href="/" className="text-xl font-bold">VogueLine</Link>
                <div>
                    <Link href="/products" className="mx-4">Produits</Link>
                    <Link href="/cart" className="mx-4">🛒 Panier</Link>

                    {isAuthenticated ? (
                        <>
                            <Link href="/orders" className="mx-4">📦 Mes Commandes</Link>
                            <button 
                                onClick={handleLogout} 
                                className="mx-4 bg-red-500 px-4 py-2 rounded hover:bg-red-700 transition"
                            >
                                Se Déconnecter
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="mx-4">Se Connecter</Link>
                            <Link href="/register" className="mx-4">S'inscrire</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}