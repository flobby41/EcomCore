import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { cart } = useCart();

    // Calculer le nombre total d'articles
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

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
                    <Link href="/cart" className="mx-4 relative">
                        🛒 Panier
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {itemCount}
                            </span>
                        )}
                    </Link>

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