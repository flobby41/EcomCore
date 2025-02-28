import { useState } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function GuestCheckout() {
    const router = useRouter();
    const { cart, clearCart } = useCart();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5001/api/checkout/create-guest-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: cart,
                    email: email,
                    success_url: `${window.location.origin}/success?guest=true&session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${window.location.origin}/cart`,
                }),
            });

            if (!response.ok) {
                throw new Error('Error creating order');
            }

            const data = await response.json();
            
            // Rediriger vers Stripe
            if (data.url) {
                clearCart();
                window.location.href = data.url;
            }

        } catch (error) {
            toast.error("Error processing order");
            console.error('Error:', error);
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
            <h1 className="text-2xl font-bold mb-4">Guest Checkout</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    {cart.map((item) => (
                        <div key={item._id} className="flex justify-between items-center mb-2">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t mt-4 pt-4">
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
} 