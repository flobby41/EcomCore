import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from 'react-hot-toast';

export default function Returns() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { orderId } = router.query;

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
                    console.log("Orders retrieved:", ordersData);
                    
                    // Si un orderId est spécifié dans l'URL, filtrer pour n'afficher que cette commande
                    const filteredOrders = orderId 
                        ? ordersData.filter(order => order._id === orderId)
                        : ordersData;
                    
                    console.log("Filtered orders:", filteredOrders);
                    setOrders(filteredOrders);
                } else {
                    toast.error("Failed to load orders");
                }
            } catch (error) {
                console.error("Error loading orders:", error);
                toast.error("An error occurred while loading your orders");
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, [orderId, router]);

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
                    
                    {orders && orders.length > 0 ? (
                        <div className="space-y-8">
                            <p className="text-gray-600">
                                Select the order containing the item you wish to return.
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
                                            {order.items && order.items.map((item, index) => (
                                                <div key={item.productId || index} className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                                        {item.product && item.product.image && (
                                                            <img 
                                                                src={item.product.image} 
                                                                alt={item.product?.name || "Product"} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h3 className="font-medium">
                                                            {item.product?.name || "Product unavailable"}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            Quantity: {item.quantity} × ${item.price?.toFixed(2) || "N/A"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="flex items-center">
                                                            <input 
                                                                type="checkbox" 
                                                                className="form-checkbox h-5 w-5 text-blue-600"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Return</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Reason for return
                                            </label>
                                            <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <option value="">Select a reason</option>
                                                <option value="damaged">Item arrived damaged</option>
                                                <option value="defective">Item is defective</option>
                                                <option value="wrong">Wrong item received</option>
                                                <option value="notAsDescribed">Item not as described</option>
                                                <option value="other">Other reason</option>
                                            </select>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Additional comments
                                            </label>
                                            <textarea 
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                rows="3"
                                                placeholder="Please provide any additional details about your return request"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end">
                                            <button 
                                                onClick={() => handleReturnRequest(order._id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                                            >
                                                Submit Return Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-xl text-gray-600 mb-4">You don't have any orders</p>
                            <p className="text-gray-500">No orders were found in your account</p>
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
