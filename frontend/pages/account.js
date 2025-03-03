import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from 'react-hot-toast';

export default function Account() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            
            if (!token) {
                router.push("/login");
                return;
            }
            
            try {
                const response = await fetch("http://localhost:5001/api/users/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    toast.error("Failed to load account information");
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            } catch (error) {
                toast.error("An error occurred while loading your account");
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-2xl font-semibold">Loading account information...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Account</h1>
                    
                    {user && (
                        <div className="space-y-6">
                            <div className="border-b pb-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="text-lg">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-lg">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Options</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a href="/orders" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition">
                                        <h3 className="font-medium text-lg mb-1">Your Orders</h3>
                                        <p className="text-gray-600">Track, return, or buy things again</p>
                                    </a>
                                    <a href="/returns" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition">
                                        <h3 className="font-medium text-lg mb-1">Returns & Refunds</h3>
                                        <p className="text-gray-600">Return items and get refund status</p>
                                    </a>
                                    <a href="/wishlist" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition">
                                        <h3 className="font-medium text-lg mb-1">Your Wishlist</h3>
                                        <p className="text-gray-600">Items you've saved for later</p>
                                    </a>
                                    <a href="/help" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition">
                                        <h3 className="font-medium text-lg mb-1">Help & FAQ</h3>
                                        <p className="text-gray-600">Get answers to common questions</p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
