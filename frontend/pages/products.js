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
          <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row gap-6">
                  {/* Sidebar with categories */}
                  <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-sm">
                      <h2 className="text-xl font-semibold mb-4">Categories</h2>
                      <ul className="space-y-2">
                          <li>
                              <Link 
                                  href="/products"
                                  className={`block px-3 py-2 rounded-md ${!category ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                              >
                                  All Products
                              </Link>
                          </li>
                          {categories.map((cat, index) => (
                              <li key={index}>
                                  <Link 
                                      href={`/products?category=${encodeURIComponent(cat.name)}`}
                                      className={`block px-3 py-2 rounded-md ${category === cat.name ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                  >
                                      {cat.name} ({cat.count})
                                  </Link>
                              </li>
                          ))}
                      </ul>
                  </div>
                  
                  {/* Main content */}
                  <div className="w-full md:w-3/4">
                      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                          <h1 className="text-2xl font-bold mb-2">
                              {category ? `${category} Products` : 'All Products'}
                          </h1>
                          <p className="text-gray-600">
                              {category 
                                  ? `Browse our selection of ${category.toLowerCase()} products`
                                  : 'Browse all products in our store'
                              }
                          </p>
                      </div>
                      
                      {loading ? (
                          <div className="text-center py-12">
                              <div className="text-xl font-semibold">Loading products...</div>
                          </div>
                      ) : products.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {products.map(product => (
                                  <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                                      <Link href={`/products/${product._id}`} className="block relative">
                                          <div className="relative h-64 w-full overflow-hidden">
                                              <img 
                                                  src={product.image} 
                                                  alt={product.name}
                                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                              />
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
                                          </div>
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                              <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-md mb-2">
                                                  {product.category}
                                              </span>
                                          </div>
                                      </Link>
                                      <div className="p-4">
                                          <h2 className="text-lg font-semibold mb-2 line-clamp-1">{product.name}</h2>
                                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
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