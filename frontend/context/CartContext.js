import { createContext, useState, useContext, useEffect } from "react";
import toast from 'react-hot-toast';

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
        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart]);

    // Ajouter un produit au panier
    const addToCart = (product) => {
        const existingProduct = cart.find((p) => p._id === product._id);
        
        if (existingProduct) {
            const newQuantity = existingProduct.quantity + 1;
            setCart(prevCart => 
                prevCart.map(p => 
                    p._id === product._id 
                        ? { ...p, quantity: newQuantity } 
                        : p
                )
            );
            // Notification après la mise à jour
            setTimeout(() => {
                toast.success(`Quantité mise à jour (${newQuantity})`);
            }, 0);
        } else {
            setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
            // Notification après la mise à jour
            setTimeout(() => {
                toast.success('Produit ajouté au panier !');
            }, 0);
        }
    };

    // Supprimer un produit du panier
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(p => p._id !== productId));
        setTimeout(() => {
            toast.success('Produit retiré du panier');
        }, 0);
    };

    // Modifier la quantité d'un produit
    const updateQuantity = (productId, quantity) => {
        setCart(prevCart =>
            prevCart.map(p =>
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