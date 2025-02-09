import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SuccessPage() {
    const router = useRouter();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        // Attendre que le router soit prêt
        if (!router.isReady) return;

        const sessionId = router.query.session_id;
        console.log("🔍 Session ID from URL:", sessionId);

        if (!sessionId) {
            console.log("❌ Pas de session_id dans l'URL");
            return;
        }

        const verifyPayment = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/orders/verify-payment?session_id=${sessionId}`, {
                    headers: {
                        'Authorization': token
                    }
                });

                console.log("📡 Réponse status:", response.status);
                const data = await response.json();
                console.log("📦 Données reçues:", data);

                setStatus(data.status === 'paid' ? 'success' : 'pending');
            } catch (error) {
                console.error("❌ Erreur:", error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [router.isReady, router.query]); // Ajout de router.isReady dans les dépendances

    return (
        <div className="container mx-auto p-6 text-center">
            {status === 'loading' && (
                <div>
                    <h2 className="text-xl mb-4">Vérification du paiement...</h2>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            )}

            {status === 'success' && (
                <div>
                    <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Paiement réussi !</h1>
                    <p className="mb-6">Votre commande a été confirmée.</p>
                    <Link href="/orders" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                        Voir mes commandes
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h1>
                    <p className="mb-4">La vérification du paiement a échoué.</p>
                    <Link href="/cart" className="text-blue-500 hover:underline">
                        Retourner au panier
                    </Link>
                </div>
            )}
        </div>
    );
} 