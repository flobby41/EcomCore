import { createContext, useState, useContext, useEffect } from "react";

// Création du contexte
const CartContext = createContext();

// Hook personnalisé pour accéder au contexte plus facilement
export const useCart = () => useContext(CartContext);

// Provider du panier
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Charger le panier depuis localStorage au démarrage
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Sauvegarder le panier dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Ajouter un produit au panier
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((p) => p._id === product._id);
            if (existingProduct) {
                return prevCart.map((p) =>
                    p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Supprimer un produit du panier
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((p) => p._id !== productId));
    };

    // Modifier la quantité d'un produit
    const updateQuantity = (productId, quantity) => {
        setCart((prevCart) =>
            prevCart.map((p) =>
                p._id === productId ? { ...p, quantity } : p
            )
        );
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};