import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from 'react-hot-toast';

export default function Returns() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            
            if (!token) {
                router.push("/login");
                return;
            }
            
            try {
                const response = await fetch("http://localhost:5001/api/orders", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const ordersData = await response.json();
                    // Filtrer pour n'obtenir que les commandes des 30 derniers jours
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    
                    const recentOrders = ordersData.filter(order => 
                        new Date(order.createdAt) > thirtyDaysAgo
                    );
                    
                    setOrders(recentOrders);
                } else {
                    toast.error("Failed to load orders");
                }
            } catch (error) {
                toast.error("An error occurred while loading your orders");
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, []);

    const handleReturnRequest = (orderId) => {
        toast.success(`Return request initiated for order #${orderId}. Check your email for return instructions.`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-2xl font-semibold">Loading your orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Return an Item</h1>
                    
                    {orders.length > 0 ? (
                        <div className="space-y-8">
                            <p className="text-gray-600">
                                Select the order containing the item you wish to return. Only orders from the last 30 days are eligible for returns.
                            </p>
                            
                            {orders.map(order => (
                                <div key={order._id} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium">Order #</span> {order._id.substring(0, 8)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="space-y-4">
                                            {order.items.map(item => (
                                                <div key={item._id} className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                                                    <div className="flex-grow">
                                                        <h3 className="font-medium">{item.product.name}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            Quantity: {item.quantity} × ${item.product.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-4 flex justify-end">
                                            <button 
                                                onClick={() => handleReturnRequest(order._id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                                            >
                                                Request Return
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-xl text-gray-600 mb-4">You don't have any eligible orders for return</p>
                            <p className="text-gray-500">Only orders from the last 30 days are eligible for returns</p>
                            <button 
                                onClick={() => router.push('/products')}
                                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
