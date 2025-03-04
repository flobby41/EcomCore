import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { cart, clearCart, loadCart } = useCart();
    const { wishlist, loadWishlist, clearWishlist } = useWishlist();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    
    // Nouveaux états pour la recherche
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const wasAuthenticated = isAuthenticated;
            const isNowAuthenticated = !!token;
            
            setIsAuthenticated(isNowAuthenticated);
            
            // Si l'utilisateur vient de se connecter, charger la wishlist
            if (!wasAuthenticated && isNowAuthenticated) {
                await loadWishlist();
            }
        };

        checkAuth();
        
        // Vérifier l'authentification à chaque changement de route
        router.events?.on("routeChangeComplete", checkAuth);

        return () => {
            router.events?.off("routeChangeComplete", checkAuth);
        };
    }, [router.events, isAuthenticated]);

    // Charger la wishlist et le panier au démarrage
    useEffect(() => {
        const loadData = async () => {
            if (isAuthenticated) {
                await Promise.all([loadCart(), loadWishlist()]);
            }
        };
        
        loadData();
    }, [isAuthenticated]);

    // 🔥 Fusionner le panier local avec le backend après connexion
    const handleLogin = async (token) => {
        if (!token) return;

        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        
        // Charger à la fois le panier et la wishlist après connexion
        await Promise.all([loadCart(), loadWishlist()]);

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
        clearWishlist(); // Vider la wishlist lors de la déconnexion
        setIsAuthenticated(false);
        router.push("/");
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

    // Fonction pour gérer la recherche
    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setShowSearchResults(false);
        }
    };

    // Fonction pour la recherche en temps réel
    const handleSearchInputChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length >= 2) {
            try {
                const response = await fetch(`http://localhost:5001/api/products/search?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.slice(0, 5)); // Limiter à 5 résultats
                    setShowSearchResults(true);
                }
            } catch (error) {
                console.error("Erreur lors de la recherche:", error);
            }
        } else {
            setShowSearchResults(false);
        }
    };

    // Fermer les résultats de recherche quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">VogueLine</Link>
                
                {/* Barre de recherche */}
                <div className="relative mx-4 flex-grow max-w-md" ref={searchRef}>
                    <form onSubmit={handleSearch} className="flex">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-4 py-2 rounded-l-md text-gray-800 focus:outline-none"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />
                        <button 
                            type="submit" 
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-r-md"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
                            </svg>
                        </button>
                    </form>
                    
                    {/* Résultats de recherche */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-96 overflow-y-auto">
                            {searchResults.map((product) => (
                                <Link 
                                    href={`/products/${product._id}`} 
                                    key={product._id}
                                    className="block p-2 hover:bg-gray-100 border-b border-gray-200 text-gray-800"
                                    onClick={() => setShowSearchResults(false)}
                                >
                                    <div className="flex items-center">
                                        {product.image && (
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="w-10 h-10 object-cover mr-2"
                                            />
                                        )}
                                        <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-gray-600">{product.price} €</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex items-center">
                    {/* Navigation Links */}
                    <Link href="/products" className="mx-4 hover:text-gray-300">Products</Link>
                    <Link href="/categories" className="mx-4 hover:text-gray-300">Categories</Link>
                    
                    {/* Profile Icon */}
                    <div className="relative mx-4">
                        <button 
                            className="hover:text-gray-300 focus:outline-none"
                            onMouseEnter={() => setShowProfileMenu(true)}
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                                />
                            </svg>
                        </button>
                        
                        {showProfileMenu && (
                            <div 
                                ref={profileMenuRef}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                                onMouseLeave={() => setShowProfileMenu(false)}
                            >
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b">
                                            Your account
                                        </div>
                                        <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Your account
                                        </Link>
                                        <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Orders
                                        </Link>
                                        <Link href="/returns" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Return an item
                                        </Link>
                                        <Link href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Help & FAQ
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-gray-100 border-t"
                                        >
                                            Sign out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b">
                                            Sign in
                                        </div>
                                        <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Sign in
                                        </Link>
                                        <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Register
                                        </Link>
                                        <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Your account
                                        </Link>
                                        <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Orders
                                        </Link>
                                        <Link href="/returns" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Return an item
                                        </Link>
                                        <Link href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Help & FAQ
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Wishlist Icon */}
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
                        🛒 
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {cart.reduce((total, item) => total + item.quantity, 0)}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}