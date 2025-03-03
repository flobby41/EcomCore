import { useState, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Link from "next/link";
import { useRouter } from 'next/router';

export default function Wishlist() {
    const { wishlist, removeFromWishlist, loadWishlist, isLoading } = useWishlist();
    const { addToCart } = useCart();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Vérifier l'authentification
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        
        if (!token) {
            router.push('/login');
            return;
        }
        
        // Charger la wishlist si l'utilisateur est authentifié
        loadWishlist();
    }, []);

    const handleRemoveFromWishlist = async (productId) => {
        await removeFromWishlist(productId);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    if (!isAuthenticated) {
        return null; // Ne rien afficher pendant la redirection
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-xl">Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
            
            {wishlist.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600 mb-6">Your wishlist is empty</p>
                    <Link 
                        href="/products" 
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition"
                    >
                        Discover our products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <div key={product._id} className="border rounded-lg overflow-hidden shadow-lg relative">
                            <button 
                                onClick={() => handleRemoveFromWishlist(product._id)}
                                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md cursor-pointer"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-6 w-6 text-orange-500 fill-orange-500"
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
                            </button>
                            <Link href={`/products/${product._id}`} passHref>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                            </Link>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                                <p className="text-gray-800 font-bold mb-4">${product.price}</p>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 