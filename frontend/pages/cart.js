import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, loadCart } = useCart(); // ✅ Changé fetchCart en loadCart
  const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        loadCart(); // ✅ Changé fetchCart en loadCart
    }, []);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) {
            // Si la quantité est inférieure à 1, supprimer le produit
            removeFromCart(productId);
            return;
        }
        updateQuantity(productId, newQuantity);
    };

    if (cart.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
                <p>Your cart is empty</p>
                <Link href="/products" className="text-blue-500 hover:underline">
                    View our products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Liste des produits */}
                <div className="md:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={item._id} className="flex items-center justify-between border p-4 rounded">
                            <div className="flex items-center space-x-4">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-gray-600">${item.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                        className="px-2 py-1 bg-gray-200 rounded"
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                        className="px-2 py-1 bg-gray-200 rounded"
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Résumé et actions */}
                <div className="bg-gray-50 p-4 rounded h-fit">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span>Total</span>
                            <span className="font-bold">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {isAuthenticated ? (
                        <Link 
                            href="/checkout" 
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded block text-center hover:bg-blue-600 transition"
                        >
                            Proceed to Checkout
                        </Link>
                    ) : (
                        <div className="space-y-2">
                            <Link 
                                href="/login" 
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded block text-center hover:bg-blue-600 transition"
                            >
                                Sign in to Checkout
                            </Link>
                            <Link 
                                href="/checkout/guest" 
                                className="w-full bg-green-500 text-white py-2 px-4 rounded block text-center hover:bg-green-600 transition"
                            >
                                Guest Checkout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}