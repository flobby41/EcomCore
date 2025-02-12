import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SuccessPage() {
    const router = useRouter();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (!router.isReady) return;

        const sessionId = router.query.session_id;
        const isGuest = router.asPath.includes('guest=true');
        
        console.log("🔍 URL complète:", router.asPath);
        console.log("🔍 Session ID from URL:", sessionId);
        console.log("👤 Guest checkout:", isGuest);

        if (!sessionId) {
            console.log("❌ Pas de session_id dans l'URL");
            return;
        }

        const verifyPayment = async () => {
            try {
                // Construire l'URL en fonction du type d'utilisateur
                const baseUrl = 'http://localhost:5001/api/orders';
                const url = isGuest 
                    ? `${baseUrl}/verify-guest-payment?session_id=${sessionId}`
                    : `${baseUrl}/verify-payment?session_id=${sessionId}`;

                console.log("🌐 URL de vérification:", url);

                const token = localStorage.getItem('token');
                const headers = token 
                    ? { 'Authorization': `Bearer ${token}` }
                    : {};

                console.log("🔑 Headers envoyés:", headers);

                const response = await fetch(url, { headers });

                console.log("📡 Réponse status:", response.status);
                const data = await response.json();
                console.log("📦 Données reçues:", data);

                if (response.ok) {
                    setStatus(data.status === 'paid' ? 'success' : 'pending');
                } else {
                    console.error("❌ Erreur serveur:", data.message);
                    setStatus('error');
                }
            } catch (error) {
                console.error("❌ Erreur:", error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [router.isReady, router.query]);

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
                    <Link href="/products" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                        Retour aux produits
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h1>
                    <p className="mb-4">La vérification du paiement a échoué.</p>
                    <Link href="/products" className="text-blue-500 hover:underline">
                        Retour aux produits
                    </Link>
                </div>
            )}
        </div>
    );
} 