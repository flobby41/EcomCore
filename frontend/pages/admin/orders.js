import { useState, useEffect } from 'react';
import AdminLayout from './layout';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/router";


export default function OrdersAdmin() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    

   
    useEffect(() => {

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const adminToken = localStorage.getItem('adminToken'); // ou depuis un cookie si nécessaire

            const response = await fetch('http://localhost:5001/api/admin/orders', {
              headers: {
                  'Authorization': `Bearer ${adminToken}`, // ✅ Ajout du token ici
                  'Content-Type': 'application/json'
              }
          });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des commandes');
            }
            const data = await response.json();
            setOrders(data);
            setLoading(false);
            console.log('orders ici ', data)

    } catch (error) {
      console.error("❌ Erreur:", error);
      setError(error.message);
      setLoading(false);
        } 
    };
    fetchOrders();
  }, [router]);


    if (loading) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-6 py-8">
                    <p>Loading orders...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-6 py-8">
                    <p className="text-red-500">Erreur: {error}</p>
                </div>
            </AdminLayout>
        );
    }
    return (
        <AdminLayout>
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-2xl font-semibold mb-6">Order Management</h1>
                
                {orders.length === 0 ? (
                    <p>No orders found</p>
                ) : (
                    <Card className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead>
                                <tr className="text-left font-bold">
                                    <th className="px-6 py-3 border-b">Order ID</th>
                                    <th className="px-6 py-3 border-b">Customer</th>
                                    <th className="px-6 py-3 border-b">Total</th>
                                    <th className="px-6 py-3 border-b">Status</th>
                                    <th className="px-6 py-3 border-b">Date</th>
                                    <th className="px-6 py-3 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{order._id}</td>
                                        <td className="px-6 py-4">{order.email}</td>
                                        <td className="px-6 py-4">
                                            {order.items?.reduce((total, item) => 
                                                total + (item.price * item.quantity), 0
                                            ).toFixed(2)}€
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-sm ${
                                                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button className="mr-2">
                                                Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
} 