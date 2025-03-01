import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem("token");
               
                if (!token) {
                    console.log("❌ Pas de token");
                    router.push('/login');
                    return;
                }

                // ✅ Décodage du token pour obtenir l'userId
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserId(tokenData.id);
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
                    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
                }

                const data = await response.json();
                console.log("📦 Données reçues:", data);
                
                setOrders(data);
                setLoading(false);

            } catch (error) {
                console.error("❌ Erreur:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Mes Commandes</h1>
                
                {loading && (
                    <div className="text-center">Chargement...</div>
                )}

                {error && (
                    <div className="text-red-500 mb-4">Erreur: {error}</div>
                )}

                {!loading && !error && (
                    <>
                        <div className="mb-4">
                            <p>ID Utilisateur: {userId}</p>
                            <p>Nombre de commandes: {orders.length}</p>
                        </div>

                        {orders.length === 0 ? (
                            <div className="text-gray-500">Aucune commande trouvée</div>
                        ) : (
                            <div className="grid gap-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="border rounded-lg p-4 shadow">
                                        <p className="font-semibold">Commande #{order._id}</p>
                                        <p>Total: {order.totalAmount}€</p>
                                        <p>Status: {order.status}</p>
                                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                        <details className="mt-2">
                                            <summary className="cursor-pointer">Détails des produits</summary>
                                            <ul className="mt-2 pl-4">
                                                {order.items.map((item, index) => (
                                                    <li key={index}>
                                                        {item.productId} - Quantité: {item.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
    );
}