import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Link from "next/link";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { addToCart } = useCart();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
    const router = useRouter();
    const { category } = router.query;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const url = category 
                    ? `http://localhost:5001/api/products?category=${encodeURIComponent(category)}`
                    : "http://localhost:5001/api/products";
                
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    console.error("Failed to fetch products");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/products/categories");
                
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                } else {
                    console.error("Failed to fetch categories");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        
        fetchProducts();
        fetchCategories();
    }, [category]);

    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem("token"));
    }, []);

    const handleWishlistClick = async (e, product) => {
        e.preventDefault(); // Empêcher la navigation vers la page produit
        e.stopPropagation(); // Empêcher la propagation de l'événement
        
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Si le produit est déjà dans la wishlist, le supprimer
        if (isInWishlist(product._id)) {
            const success = await removeFromWishlist(product._id);
            // Ne pas afficher de toast ici, car il est déjà affiché dans la fonction removeFromWishlist
        } else {
            // Sinon, l'ajouter
            const success = await addToWishlist(product);
            // Ne pas afficher de toast ici, car il est déjà affiché dans la fonction addToWishlist
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    {category ? `${category} Products` : "All Products"}
                </h1>
                
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar with categories */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Categories</h2>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => router.push('/products')}
                                    className={`block w-full text-left px-3 py-2 rounded ${!category ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                >
                                    All Products
                                </button>
                                
                                {categories.map((cat, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => router.push(`/products?category=${encodeURIComponent(cat.name)}`)}
                                        className={`block w-full text-left px-3 py-2 rounded ${category === cat.name ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                    >
                                        {cat.name} {cat.count > 0 && `(${cat.count})`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Products grid */}
                    <div className="w-full md:w-3/4">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div 
                                        key={product._id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="h-48 bg-gray-200 relative">
                                            {product.image ? (
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-gray-300">
                                                    <span className="text-4xl">{product.name.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                            <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                                                <Link 
                                                    href={`/products/${product._id}`}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-4">No products found</h2>
                                <p className="text-gray-500 mb-6">We couldn't find any products in this category.</p>
                                <button 
                                    onClick={() => router.push('/products')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
                                >
                                    View All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}