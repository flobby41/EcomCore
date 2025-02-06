import { useCart } from "../context/CartContext";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_xxxx"); // Remplace avec ta clé publique Stripe

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity } = useCart();

    const handleCheckout = async () => {
      const stripe = await stripePromise;
  
      // Simule un email (à remplacer par l'email du user connecté si tu as un système d'auth)
      const customerEmail = "test@example.com";  
  
      const response = await fetch("http://localhost:5001/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart, customerEmail }),
      });
  
      if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur API Checkout :", errorData);
          alert(`Erreur : ${errorData.message}`);
          return;
      }
  
      const session = await response.json();
      console.log("🛒 Session Stripe générée :", session.id);  // DEBUG
      if (session.url) {
        window.location.href = session.url;
    }
  };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">🛒 Mon Panier</h1>
            {cart.length === 0 ? (
                <p className="text-gray-500">
                    Votre panier est vide. <Link href="/products" className="text-blue-500">Voir les produits</Link>
                </p>
            ) : (
                <div>
                    <div className="grid gap-4">
                        {cart.map((item) => (
                            <div key={item._id} className="flex items-center justify-between border p-4 rounded-lg shadow">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                <div className="flex-1 ml-4">
                                    <h2 className="text-lg font-semibold">{item.name}</h2>
                                    <p className="text-gray-500">{item.price} €</p>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                                        className="w-16 border px-2 py-1 text-center"
                                        min="1"
                                    />
                                </div>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-red-500 hover:text-red-700 transition"
                                >
                                    ❌
                                </button>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleCheckout}
                        className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                    >
                        Payer avec Stripe 💳
                    </button>
                </div>
            )}
        </div>
    );
}