import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        router.push(`/products?category=${encodeURIComponent(categoryName)}`);
    };

    // Catégories prédéfinies au cas où l'API ne renvoie pas de données
    const defaultCategories = [
        { name: "Men's Clothing", count: 0, image: null },
        { name: "Women's Clothing", count: 0, image: null },
        { name: "Accessories", count: 0, image: null },
        { name: "Shoes", count: 0, image: null },
        { name: "Jewelry", count: 0, image: null },
        { name: "Electronics", count: 0, image: null }
    ];

    const displayCategories = categories.length > 0 ? categories : defaultCategories;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Shop by Category</h1>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayCategories.map((category, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleCategoryClick(category.name)}
                            >
                                <div className="h-48 bg-gray-200 relative">
                                    {category.image ? (
                                        <div className="h-full w-full relative">
                                            <img 
                                                src={category.image} 
                                                alt={category.name}
                                                className="object-cover w-full h-full"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                                                <h2 className="text-white text-xl font-semibold p-4">{category.name}</h2>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gray-300">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                                                <h2 className="text-white text-xl font-semibold p-4">{category.name}</h2>
                                            </div>
                                            <span className="text-4xl">{category.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-600">
                                        Explore our {category.name.toLowerCase()} collection
                                        {category.count > 0 && ` (${category.count} products)`}
                                    </p>
                                    <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium">
                                        Shop Now →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-12 bg-blue-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Trending Collections</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-medium text-lg mb-2">Summer Essentials</h3>
                            <p className="text-gray-600 mb-3">Beat the heat with our summer collection</p>
                            <Link href="/products?collection=summer" className="text-blue-600 hover:text-blue-800">
                                Explore →
                            </Link>
                        </div>
                        <div className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-medium text-lg mb-2">New Arrivals</h3>
                            <p className="text-gray-600 mb-3">Check out our latest products</p>
                            <Link href="/products?sort=newest" className="text-blue-600 hover:text-blue-800">
                                Explore →
                            </Link>
                        </div>
                        <div className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-medium text-lg mb-2">Best Sellers</h3>
                            <p className="text-gray-600 mb-3">Our most popular items</p>
                            <Link href="/products?sort=popular" className="text-blue-600 hover:text-blue-800">
                                Explore →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 