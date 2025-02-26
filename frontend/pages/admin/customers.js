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

    const handleDelete = async (customerId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            return;
        }

        try {
            const adminToken = Cookies.get('adminToken');
            const response = await fetch(`http://localhost:5001/api/admin/users/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du client');
            }

            setCustomers(customers.filter(customer => customer._id !== customerId));
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.message);
        }
    };

    const handleEdit = async (customerId) => {
        try {
            const customer = customers.find(c => c._id === customerId);
            if (!customer) return;

            const newName = window.prompt('Nouveau nom:', customer.name);
            const newEmail = window.prompt('Nouvel email:', customer.email);

            if (!newName || !newEmail) return;

            const adminToken = Cookies.get('adminToken');
            const response = await fetch(`http://localhost:5001/api/admin/users/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName,
                    email: newEmail
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la modification du client');
            }

            const updatedCustomer = await response.json();
            
            setCustomers(customers.map(c => 
                c._id === customerId ? updatedCustomer : c
            ));
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.message);
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