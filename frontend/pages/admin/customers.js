import { useState, useEffect } from 'react';
import AdminLayout from './layout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CustomersAdmin() {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/users');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-2xl font-semibold mb-6">Gestion des Clients</h1>
                
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="text-left font-bold">
                                <th className="px-6 py-3">Nom</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Date d'inscription</th>
                                <th className="px-6 py-3">Commandes</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer._id}>
                                    <td className="px-6 py-4">{customer.name}</td>
                                    <td className="px-6 py-4">{customer.email}</td>
                                    <td className="px-6 py-4">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer.orders?.length || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button className="mr-2">
                                            Voir détails
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
} 