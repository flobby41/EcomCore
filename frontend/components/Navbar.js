import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { cart, clearCart, addToCart, fetchCart } = useCart(); // ✅ Déplacer useCart ici

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token); // Convertit en booléen
        };

        checkAuth(); // Vérification au chargement
        fetchCart();
        // Écoute chaque changement d'URL et met à jour `isAuthenticated`
        router.events?.on("routeChangeComplete", checkAuth);

        return () => {
            router.events?.off("routeChangeComplete", checkAuth);
        };
    }, [router.events]);

    // 🔥 Fusionner le panier local avec le backend après connexion
    const handleLogin = async (token) => {
        if (!token) return;

        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        console.log("🔄 Rafraîchissement du panier après connexion...");
        await fetchCart(); // ✅ Recharge le panier immédiatement après connexion

        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (localCart.length > 0) {
            try {
                await fetch("http://localhost:5001/api/cart/merge", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ items: localCart })
                });

                localStorage.removeItem("cart"); // ✅ Nettoie le panier local après la fusion
            } catch (error) {
                console.error("Erreur lors de la fusion du panier:", error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        clearCart(); // Vide le panier à la déconnexion
        setIsAuthenticated(false);
        router.push("/login");
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between">
                <Link href="/" className="text-xl font-bold">VogueLine</Link>
                <div>
                    <Link href="/products" className="mx-4">Produits</Link>
                    <Link href="/cart" className="mx-4 relative">
                        🛒 Panier
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {cart.reduce((total, item) => total + item.quantity, 0)}
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
                            {cart.length > 0 && (
                                <Link 
                                    href="/checkout/guest" 
                                    className="mx-4 bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition"
                                >
                                    Commander en tant qu'invité
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}