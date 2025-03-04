import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function SuccessPage() {
    const router = useRouter();
    const [status, setStatus] = useState('loading');
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        if (!router.isReady) return;

        const sessionId = router.query.session_id;
        const isGuest = router.asPath.includes('guest=true');
        
        console.log("🔍 Full URL:", router.asPath);
        console.log("🔍 Session ID from URL:", sessionId);
        console.log("👤 Guest checkout:", isGuest);

        if (!sessionId) {
            console.log("❌ No session_id in URL");
            setStatus('error');
            return;
        }

        const verifyPayment = async () => {
            try {
                // Build URL based on user type
                const baseUrl = 'http://localhost:5001/api/orders';
                const url = isGuest 
                    ? `${baseUrl}/verify-guest-payment?session_id=${sessionId}`
                    : `${baseUrl}/verify-payment?session_id=${sessionId}`;

                console.log("🌐 Verification URL:", url);

                const token = localStorage.getItem('token');
                const headers = token 
                    ? { 'Authorization': `Bearer ${token}` }
                    : {};

                console.log("🔑 Headers sent:", headers);

                const response = await fetch(url, { headers });

                console.log("📡 Response status:", response.status);
                const data = await response.json();
                console.log("📦 Data received:", data);

                if (response.ok) {
                    setStatus(data.status === 'paid' ? 'success' : 'pending');
                    setOrderDetails(data.order || null);
                } else {
                    console.error("❌ Server error:", data.message);
                    setStatus('error');
                }
            } catch (error) {
                console.error("❌ Error:", error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [router.isReady, router.query]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-xl rounded-lg overflow-hidden"
                >
                    {status === 'loading' && (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
                            <h2 className="text-xl font-medium text-gray-700 mb-2">Verifying Your Payment</h2>
                            <p className="text-gray-500">Please wait while we confirm your order...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                >
                                    <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                                <p className="text-lg text-gray-600">Thank you for your order</p>
                            </div>
                            
                            {orderDetails && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="border-t border-gray-200 pt-6 mt-6"
                                >
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
                                    
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Order Number:</span>
                                            <span className="font-medium">{orderDetails._id}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium">
                                                {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total:</span>
                                            <span className="font-medium">${orderDetails.totalAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                    </div>
                                    
                                    {orderDetails.items && orderDetails.items.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3">Items</h3>
                                            <div className="space-y-3">
                                                {orderDetails.items.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            {item.product?.image && (
                                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                                                                    <img 
                                                                        src={item.product.image} 
                                                                        alt={item.product.name} 
                                                                        className="h-full w-full object-cover object-center"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-800">
                                                                    {item.product?.name || 'Product'}
                                                                </h4>
                                                                <p className="text-sm text-gray-500">
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-800">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {orderDetails.shippingAddress && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-800 mb-3">Shipping Address</h3>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-gray-700">
                                                    {orderDetails.shippingAddress.street}<br />
                                                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}<br />
                                                    {orderDetails.shippingAddress.country}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4"
                            >
                                <Link href="/products" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    Continue Shopping
                                </Link>
                                {!router.asPath.includes('guest=true') && (
                                    <Link href="/account/orders" className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                        View My Orders
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    )}

                    {status === 'pending' && (
                        <div className="p-8 text-center">
                            <ClockIcon className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Pending</h1>
                            <p className="text-lg text-gray-600 mb-6">
                                Your payment is being processed. We'll notify you once it's confirmed.
                            </p>
                            <div className="mt-8">
                                <Link href="/products" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-8 text-center">
                            <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Something Went Wrong</h1>
                            <p className="text-lg text-gray-600 mb-6">
                                We couldn't verify your payment. Please contact our customer support.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <Link href="/products" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Back to Products
                                </Link>
                                <Link href="/contact" className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Order confirmation email notice */}
                {status === 'success' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-center text-gray-500"
                    >
                        <p>A confirmation email has been sent to your email address.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
} 