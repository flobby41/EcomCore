import { createContext, useState, useContext, useEffect } from "react";
import toast from 'react-hot-toast';

// Création du contexte
const CartContext = createContext();

// Hook personnalisé pour accéder au contexte plus facilement
export const useCart = () => useContext(CartContext);

// Provider du panier
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const loadCart = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await fetch("http://localhost:5001/api/cart", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const transformedItems = data.items.map(item => ({
                        _id: item.productId._id,
                        name: item.productId.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.productId.image
                    }));
                    setCart(transformedItems);
                }
            } catch (error) {
                console.error("Erreur lors du chargement du panier:", error);
            }
        } else {
            // Charger le panier local pour les invités
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        }
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
                    const transformedItems = data.items.map(item => ({
                        _id: item.productId._id,
                        name: item.productId.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.productId.image
                    }));
                    setCart(transformedItems);
                }

                toast.success('Produit ajouté au panier !');
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
            toast.success('Produit ajouté au panier !');
        }
    };

    // Supprimer un produit du panier
    const removeFromCart = async (productId) => {
        const token = localStorage.getItem("token");
        
        // Mise à jour locale
        setCart(prevCart => prevCart.filter(p => p._id !== productId));
        toast.success('Produit retiré du panier');

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
        toast.success('Quantité mise à jour');

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
        localStorage.removeItem("cart");
        if (showToast) {
            toast.success('Panier vidé');
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

    return (
      <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        loadCart
    }}>
            {children}
        </CartContext.Provider>
    );
};