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

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem("token"));
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products${
                selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''
            }`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`);
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    console.error('Categories data is not an array:', data);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
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
        <div className="container mx-auto px-4 py-8">
            {/* Filtres de catégories */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-full ${
                            selectedCategory === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        All
                    </button>
                    {Array.isArray(categories) && categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full ${
                                selectedCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grille de produits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="border rounded-lg overflow-hidden shadow-lg relative group">
                      <button 
                          onClick={(e) => handleWishlistClick(e, product)}
                          className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md cursor-pointer"
                      >
                          <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-6 w-6 transition-colors ${
                                isInWishlist(product._id) 
                                  ? "text-orange-500 fill-orange-500" 
                                  : "text-gray-400 group-hover:text-orange-500"
                              }`}
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                              fill={isInWishlist(product._id) ? "currentColor" : "none"}
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
                              onClick={() => addToCart(product)}
                              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                          >
                              Add to Cart
                          </button>
                      </div>
                  </div>
                ))}
            </div>
        </div>
    );
}