import { useState, useEffect } from 'react';
import AdminLayout from './layout';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Cookies from 'js-cookie';

export default function CustomersAdmin() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const adminToken = Cookies.get('adminToken');

            if (!adminToken) {
                throw new Error('Token admin non trouvé');
            }

            const response = await fetch('http://localhost:5001/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des clients');
            }

            const data = await response.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <AdminLayout>
            <div className="container mx-auto px-6 py-8">
                <p>Chargement des clients...</p>
            </div>
        </AdminLayout>
    );

    if (error) return (
        <AdminLayout>
            <div className="container mx-auto px-6 py-8">
                <p className="text-red-500">Erreur: {error}</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-2xl font-semibold mb-6">Gestion des Clients</h1>
                
                {customers.length === 0 ? (
                    <p>Aucun client trouvé</p>
                ) : (
                    <Card className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead>
                                <tr className="text-left font-bold">
                                    <th className="px-6 py-3 border-b">Nom</th>
                                    <th className="px-6 py-3 border-b">Email</th>
                                    <th className="px-6 py-3 border-b">Date d'inscription</th>
                                    <th className="px-6 py-3 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{customer.name}</td>
                                        <td className="px-6 py-4">{customer.email}</td>
                                        <td className="px-6 py-4">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button 
                                                className="mr-2"
                                                onClick={() => handleEdit(customer._id)}
                                            >
                                                Éditer
                                            </Button>
                                            <Button 
                                                className="bg-red-500 hover:bg-red-600"
                                                onClick={() => handleDelete(customer._id)}
                                            >
                                                Supprimer
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