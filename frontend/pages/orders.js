import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem("token");
               
                if (!token) {
                    console.log("❌ No token found");
                    router.push('/login');
                    return;
                }

                // ✅ Décodage du token pour obtenir l'userId
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserId(tokenData.id);
                console.log("👤 tokenData.name:", tokenData.name);
                setUserName(tokenData.name || tokenData.email || "Customer");
                console.log("👤 UserId from token:", tokenData.id);

                const response = await fetch("http://localhost:5001/api/orders", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                console.log("📡 Status:", response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                console.log("📦 Données reçues:", data);
                
                setOrders(data);
                setLoading(false);

            } catch (error) {
                console.error("❌ Error:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    // Fonction utilitaire pour formater le prix de manière sécurisée
    const formatPrice = (price) => {
        return typeof price === 'number' ? `$${price.toFixed(2)}` : 'N/A';
    };

    // Fonction pour obtenir la classe de couleur en fonction du statut
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-indigo-100 text-indigo-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>
            
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">Loading your orders...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">Welcome, {userName}</h2>
                        <p className="text-gray-600">You have {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-gray-500">You haven't placed any orders yet</p>
                            <button 
                                onClick={() => router.push('/products')}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map((order) => (
                                <div key={order._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                                    <div className="bg-gray-50 p-4 border-b">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">Order #{order._id.substring(order._id.length - 8)}</h3>
                                                <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-medium">Order Summary</h4>
                                                <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                            <p className="text-gray-600">Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                        </div>
                                        
                                        <div className="border-t pt-4 mt-4">
                                            <h4 className="font-medium mb-3">Products</h4>
                                            <div className="space-y-4">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex items-center space-x-4">
                                                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                                            {item.product && item.product.image && (
                                                                <img 
                                                                    src={item.product.image} 
                                                                    alt={item.product.name || "Product"} 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <h5 className="font-medium">
                                                                {item.product?.name || "Product unavailable"}
                                                            </h5>
                                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                                {item.product?.description?.substring(0, 60) || "No description available"}
                                                                {item.product?.description?.length > 60 ? "..." : ""}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {item.quantity} × {formatPrice(item.price)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{item.product?.category || ""}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {order.shippingAddress && (
                                            <div className="border-t pt-4 mt-4">
                                                <h4 className="font-medium mb-2">Shipping Address</h4>
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p>{order.shippingAddress.street}</p>
                                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                                    <p>{order.shippingAddress.country}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="border-t pt-4 mt-4 flex justify-between">
                                            <Link 
                                                href={`/orders/${order._id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View Order Details
                                            </Link>
                                            
                                            {['delivered', 'shipped'].includes(order.status) && (
                                                <Link 
                                                    href={`/returns?orderId=${order._id}`}
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    Return Items
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}