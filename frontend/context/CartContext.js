import { createContext, useState, useContext, useEffect } from "react";
import toast from 'react-hot-toast';
import Link from 'next/link';

// Création du contexte
const CartContext = createContext();

// Hook personnalisé pour accéder au contexte plus facilement
export const useCart = () => useContext(CartContext);

// Provider du panier
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const loadCart = async () => {
        const token = localStorage.getItem("token");
        console.log("🔄 Début du chargement du panier, token présent:", !!token);
        
        if (token) {
            try {
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                };
                
                console.log("📤 Envoi de la requête au panier...");
                const response = await fetch("http://localhost:5001/api/cart", {
                    headers
                });
                
                console.log("📥 Réponse reçue, statut:", response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("🔑 Données reçues du panier:", data);
                    
                    if (data && data.items && Array.isArray(data.items)) {
                        console.log("🔑 Items du panier:", data.items);
                        const transformedItems = data.items.map(item => {
                            // Vérifier si productId est un objet (après population) ou juste un ID
                            const isPopulated = typeof item.productId === 'object' && item.productId !== null;
                            
                            return {
                                _id: isPopulated ? item.productId._id : item.productId,
                                name: isPopulated ? item.productId.name : item.productName,
                                price: item.price,
                                quantity: item.quantity,
                                image: isPopulated && item.productId.image ? item.productId.image : '/placeholder-image.jpg'
                            };
                        });
                        setCart(transformedItems);
                    } else {
                        console.warn("⚠️ Format de données inattendu:", data);
                        setCart([]);
                    }
                } else {
                    console.error("❌ Erreur API:", response.status);
                    // Si erreur 401 (non autorisé) ou 404 (non trouvé), vider le panier
                    if (response.status === 401 || response.status === 404) {
                        setCart([]);
                    }
                }
            } catch (error) {
                console.error("❌ Exception lors du chargement du panier:", error);
                // Ne pas modifier l'état du panier en cas d'erreur réseau
            }
        } else {
            // Pour les invités, charger depuis localStorage
            const savedCart = localStorage.getItem("cart");
            console.log("�� Panier local trouvé:", !!savedCart);
            
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    if (Array.isArray(parsedCart)) {
                        setCart(parsedCart);
                        console.log("�� Panier local chargé, items:", parsedCart.length);
                    } else {
                        console.warn("⚠️ Format de panier local invalide");
                        localStorage.removeItem("cart");
                        setCart([]);
                    }
                } catch (e) {
                    console.error("❌ Erreur lors du parsing du panier local:", e);
                    localStorage.removeItem("cart");
                    setCart([]);
                }
            } else {
                setCart([]);
            }
        }
        console.log("✅ Fin de loadCart");
    };

    // Charger le panier au démarrage et quand le token change
    useEffect(() => {
        loadCart();
    }, []);

    // Sauvegarder le panier dans localStorage à chaque changement
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart]);

    const addToCart = async (product) => {
        const token = localStorage.getItem("token");
        
        if (token) {
            try {
                const response = await fetch("http://localhost:5001/api/cart/add", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: product._id,
                        quantity: 1,
                        price: product.price
                    })
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de l'ajout au panier");
                }

                // Recharger tout le panier depuis le backend
                const cartResponse = await fetch("http://localhost:5001/api/cart/", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (cartResponse.ok) {
                    const data = await cartResponse.json();
                    const transformedItems = data.items.map(item => {
                        // Vérifier si productId est un objet (après population) ou juste un ID
                        const isPopulated = typeof item.productId === 'object' && item.productId !== null;
                        
                        return {
                            _id: isPopulated ? item.productId._id : item.productId,
                            name: isPopulated ? item.productId.name : item.productName,
                            price: item.price,
                            quantity: item.quantity,
                            image: isPopulated && item.productId.image ? item.productId.image : '/placeholder-image.jpg'
                        };
                    });
                    setCart(transformedItems);
                }

                toast.success(<div>
                  Product added to cart! <Link href="/cart" className="font-bold text-blue-500 underline">View Cart</Link>
              </div>);
            } catch (error) {
                console.error("Erreur:", error);
                toast.error("Erreur de synchronisation avec le serveur");
            }
        } else {
            // Gestion du panier local pour les invités
            setCart(prevCart => {
                const existingProduct = prevCart.find(p => p._id === product._id);
                if (existingProduct) {
                    return prevCart.map(p =>
                        p._id === product._id
                            ? { ...p, quantity: p.quantity + 1 }
                            : p
                    );
                }
                return [...prevCart, { ...product, quantity: 1 }];
            });
            toast.success(<div>
              Product added to cart! <Link href="/cart" className="font-bold text-blue-500 underline">View Cart</Link>
          </div>);
        }
    };

    // Supprimer un produit du panier
    const removeFromCart = async (productId) => {
        const token = localStorage.getItem("token");
        
        // Mise à jour locale
        setCart(prevCart => {
            const updatedCart = prevCart.filter(p => p._id !== productId);
            
            // Pour les invités, mettre à jour localStorage immédiatement
            if (!token) {
                if (updatedCart.length === 0) {
                    localStorage.removeItem("cart"); // Supprimer complètement si vide
                } else {
                    localStorage.setItem("cart", JSON.stringify(updatedCart));
                }
            }
            
            return updatedCart;
        });
        
        toast.success('Product removed from cart');

        // Synchronisation avec le backend
        if (token) {
            try {
                await fetch("http://localhost:5001/api/cart/remove", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ productId })
                });
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                toast.error("Erreur de synchronisation avec le serveur");
                // Recharger le panier en cas d'erreur
                await loadCart();
            }
        }
    };

    // Modifier la quantité d'un produit
    const updateQuantity = async (productId, quantity) => {
        const token = localStorage.getItem("token");
        
        // Mise à jour locale
        setCart(prevCart =>
            prevCart.map(p =>
                p._id === productId ? { ...p, quantity } : p
            )
        );
        toast.success('Quantity updated');

        // Synchronisation avec le backend
        if (token) {
            try {
                // ✅ Nouvelle route pour mettre à jour la quantité directement
                const response = await fetch("http://localhost:5001/api/cart/update-quantity", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                        productId, 
                        quantity, // Envoyer la nouvelle quantité directement
                        type: "set" // Indique qu'on veut définir la quantité, pas l'ajouter
                    })
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de la mise à jour de la quantité");
                }

                // Recharger le panier pour s'assurer de la synchronisation
                await loadCart();
            } catch (error) {
                console.error("Erreur de mise à jour:", error);
                toast.error("Erreur de synchronisation avec le serveur");
                await loadCart(); // Recharger en cas d'erreur
            }
        }
    };

    const clearCart = async (showToast = true) => {
        const token = localStorage.getItem("token");
        
        // Mise à jour locale
        setCart([]);
        
        // Toujours supprimer du localStorage, qu'il y ait un token ou non
        localStorage.removeItem("cart");
        
        if (showToast) {
            toast.success('Cart emptied');
        }

        // Synchronisation avec le backend
        if (token) {
            try {
                const response = await fetch("http://localhost:5001/api/cart/clear", {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Erreur lors du vidage du panier");
                }
            } catch (error) {
                console.error("Erreur lors du vidage du panier:", error);
                if (showToast) {
                    toast.error("Erreur de synchronisation avec le serveur");
                }
                await loadCart();
            }
        }
    };

    const mergeLocalCart = async () => {
        const token = localStorage.getItem("token");
        const savedCart = localStorage.getItem("cart");
        
        if (!token || !savedCart) return;
        
        try {
            // Récupérer le panier local
            const localCart = JSON.parse(savedCart);
            
            if (!Array.isArray(localCart) || localCart.length === 0) {
                localStorage.removeItem("cart");
                return;
            }
            
            console.log("🔄 Fusion du panier local avec le panier utilisateur...");
            
            // Transformer les items du panier local au format attendu par l'API
            const itemsToMerge = localCart.map(item => ({
                productId: item._id,
                quantity: item.quantity,
                price: item.price
            }));
            
            // Appeler l'API pour fusionner les paniers
            const response = await fetch("http://localhost:5001/api/cart/merge", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ items: itemsToMerge })
            });
            
            if (response.ok) {
                console.log("✅ Fusion du panier réussie");
                // Supprimer le panier local après fusion réussie
                localStorage.removeItem("cart");
                // Recharger le panier depuis le serveur
                await loadCart();
                toast.success('Your cart has been updated');
            } else {
                console.error("❌ Erreur lors de la fusion du panier:", await response.text());
            }
        } catch (error) {
            console.error("❌ Exception lors de la fusion du panier:", error);
        }
    };

    return (
      <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        loadCart,
        mergeLocalCart
    }}>
            {children}
        </CartContext.Provider>
    );
};