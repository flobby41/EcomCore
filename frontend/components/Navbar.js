import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { cart, clearCart, loadCart } = useCart();
    const { wishlist, loadWishlist } = useWishlist();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
        };

        checkAuth();
        loadCart();
        loadWishlist(); // Charger la wishlist au démarrage
        
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
        await loadCart(); // ✅ Changé fetchCart en loadCart

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
        clearCart(false); // Passer false pour ne pas afficher le toast
        setIsAuthenticated(false);
        router.push("/login");
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        console.log('tu es connecté ?', isAuthenticated);
        if (isAuthenticated) {
            router.push('/wishlist');
        } else {
            router.push('/login');
        }
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between">
                <Link href="/" className="text-xl font-bold">VogueLine</Link>
                <div className="flex items-center">
                    <Link href="/products" className="mx-4 hover:text-gray-300">Products</Link>
                    
                    {/* Wishlist Icon - Modifié pour utiliser onClick au lieu de href */}
                    <a 
                        href="#" 
                        onClick={handleWishlistClick} 
                        className="mx-4 hover:text-gray-300 relative cursor-pointer"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                            />
                        </svg>
                        {isAuthenticated && wishlist.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {wishlist.length}
                            </span>
                        )}
                    </a>
                    
                    {/* Cart Icon */}
                    <Link href="/cart" className="mx-4 hover:text-gray-300 relative">
                        🛒 Cart
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {cart.reduce((total, item) => total + item.quantity, 0)}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link href="/orders" className="mx-4 hover:text-gray-300">📦 My Orders</Link>
                            <button 
                                onClick={handleLogout} 
                                className="mx-4 bg-red-500 px-4 py-2 rounded hover:bg-red-700 transition"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="mx-4 hover:text-gray-300">Sign In</Link>
                            <Link href="/register" className="mx-4 hover:text-gray-300">Sign Up</Link>
                            {cart.length > 0 && (
                                <Link 
                                    href="/checkout/guest" 
                                    className="mx-4 bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition"
                                >
                                    Guest Checkout
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}