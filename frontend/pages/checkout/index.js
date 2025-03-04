import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Checkout() {
    const router = useRouter();
    const { cart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        email: '',
        name: '',
        shippingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    // List of available countries for shipping
    const countries = [
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'DE', name: 'Germany' },
        { code: 'IT', name: 'Italy' },
        { code: 'ES', name: 'Spain' }
    ];

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Load logged-in user information
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await fetch('http://localhost:5001/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        email: data.email || '',
                        name: data.name || '',
                        shippingAddress: {
                            street: data.shippingAddress?.street || '',
                            city: data.shippingAddress?.city || '',
                            state: data.shippingAddress?.state || '',
                            zipCode: data.shippingAddress?.zipCode || '',
                            country: data.shippingAddress?.country || ''
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Check if cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            router.push('/cart');
        }
    }, [cart, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setUserData({
                ...userData,
                [parent]: {
                    ...userData[parent],
                    [child]: value
                }
            });
        } else {
            setUserData({
                ...userData,
                [name]: value
            });
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log("🔑 Token:", token);
            console.log("🛒 Cart data:", cart);
            console.log("👤 User data:", userData);

            const response = await fetch("http://localhost:5001/api/checkout/create-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart,
                    shippingAddress: userData.shippingAddress,
                    success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${window.location.origin}/cart`,
                }),
            });

            console.log("📡 Response status:", response.status);
            const data = await response.json();
            console.log("📦 Response data:", data);

            if (!response.ok) {
                throw new Error(data.message || 'Error creating order');
            }
            
            if (data.url) {
                clearCart();
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("❌ Detailed error:", error);
            toast.error(error.message || "Error processing your order");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to your cart before proceeding to checkout.</p>
                    <Link href="/products" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-gray-50 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
                    <p className="text-gray-600 mt-1">Complete your purchase</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    {/* Shipping form - 2/3 of the screen */}
                    <div className="md:col-span-2 p-6 border-r">
                        <form onSubmit={handleCheckout} className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={userData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={userData.email}
                                            onChange={(e) => setUserData({...userData, email: e.target.value})}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Shipping Address</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.street"
                                            required
                                            value={userData.shippingAddress.street}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="123 Main St"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.city"
                                            required
                                            value={userData.shippingAddress.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="New York"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State / Province
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.state"
                                            required
                                            value={userData.shippingAddress.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="NY"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.zipCode"
                                            required
                                            value={userData.shippingAddress.zipCode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="10001"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Country
                                        </label>
                                        <select
                                            name="shippingAddress.country"
                                            required
                                            value={userData.shippingAddress.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a country</option>
                                            {countries.map(country => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition font-medium ${
                                        loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Proceed to Payment'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order summary - 1/3 of the screen */}
                    <div className="bg-gray-50 p-6">
                        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Order Summary</h2>
                        
                        <div className="space-y-3 mb-6">
                            {cart.map((item) => (
                                <div key={item._id} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700">{item.name}</h3>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">Calculated at next step</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Taxes</span>
                                <span className="font-medium">Calculated at next step</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total</span>
                                <span className="font-medium">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 