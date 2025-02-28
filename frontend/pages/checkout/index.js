import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Checkout() {
    const router = useRouter();
    const { cart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Check if cart is empty
        if (cart.length === 0) {
            router.push('/cart');
            return;
        }
    }, [cart]);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log("🔑 Token:", token);
            console.log("🛒 Cart data:", cart);

            const response = await fetch("http://localhost:5001/api/checkout/create-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart,
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
            toast.error(error.message || "Error processing order");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <p>Your cart is empty</p>
                <Link href="/products" className="text-blue-500 hover:underline">
                    Back to products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Complete your order</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Products summary */}
                <div className="md:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={item._id} className="flex items-center justify-between border p-4 rounded">
                            <div className="flex items-center space-x-4">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-gray-600">${item.price} x {item.quantity}</p>
                                </div>
                            </div>
                            <div className="font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary and payment */}
                <div className="bg-gray-50 p-4 rounded h-fit">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span>Total</span>
                            <span className="font-bold">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
} 