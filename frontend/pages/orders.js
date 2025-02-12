import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem("token");
                console.log("🔑 Token récupéré:", token ? "Oui" : "Non");

                if (!token) {
                    console.log("❌ Pas de token");
                    router.push('/login');
                    return;
                }

                console.log("📡 Envoi requête...");
                const response = await fetch("http://localhost:5001/api/orders", {
                    headers: {
                      "Authorization": `Bearer ${token}`, 
                      "Content-Type": "application/json"
                    }
                });

                console.log("📡 Status:", response.status);
                
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
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

    if (error) {
        return <div className="text-red-500">Erreur: {error}</div>;
    }

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (orders.length === 0) {
        return <div>Aucune commande trouvée</div>;
    }

    return (
        <div>
            <h1>Mes Commandes</h1>
            {orders.map((order) => (
                <div key={order._id} className="border p-4 my-2">
                    <p>ID: {order._id}</p>
                    <p>Total: {order.totalAmount}€</p>
                    <p>Status: {order.status}</p>
                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}