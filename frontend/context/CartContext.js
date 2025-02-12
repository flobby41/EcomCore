import { createContext, useState, useContext, useEffect } from "react";
import toast from 'react-hot-toast';

// Création du contexte
const CartContext = createContext();

// Hook personnalisé pour accéder au contexte plus facilement
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
      throw new Error("useCart() doit être utilisé à l'intérieur de <CartProvider>");
  }
  return context;
};
// Provider du panier
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Charger le panier depuis localStorage au démarrage
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        fetchCart(); // Charge le panier dès le démarrage

    }, []);

    // Sauvegarder le panier dans localStorage à chaque changement
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart]);

      const fetchCart = async () => {
          const token = localStorage.getItem("token");
          if (!token) return; // Pas d'utilisateur connecté, on ne fait rien
  
          try {
              const response = await fetch("http://localhost:5001/api/cart/", {
                  method: "GET",
                  headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                  }
              });
  
              if (!response.ok) {
                  throw new Error("Erreur lors de la récupération du panier");
              }
  
              const data = await response.json();
              if (data.items) {
                  setCart(data.items); // ✅ Remplace le panier local par celui du backend
                  localStorage.setItem("cart", JSON.stringify(data.items)); // Sauvegarde en local
              }
          } catch (error) {
              console.error("Erreur de récupération du panier:", error);
          }
      };
     
    // Ajouter un produit au panier
    const addToCart = async (product) => {
      const token = localStorage.getItem("token");
      let updatedCart = [];
  
      const existingProduct = cart.find((p) => p._id === product._id);
      if (existingProduct) {
          updatedCart = cart.map(p =>
              p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
          );
      } else {
          updatedCart = [...cart, { ...product, quantity: 1 }];
      }
  
      setCart(updatedCart);
  
      // Envoyer la mise à jour au backend si connecté
      if (token) {
          try {
              await fetch("http://localhost:5001/api/cart/add", {
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
          } catch (error) {
              console.error("Erreur lors de l'ajout au panier:", error);
          }
      }
  };

    // Supprimer un produit du panier
    const removeFromCart = async (productId) => {
      setCart(prevCart => prevCart.filter(p => p._id !== productId));
  
      const token = localStorage.getItem("token");
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
              console.error("Erreur lors de la suppression du produit:", error);
          }
      }
  };

    // Modifier la quantité d'un produit
    const updateQuantity = async (productId, quantity) => {
      setCart(prevCart =>
          prevCart.map(p =>
              p._id === productId ? { ...p, quantity } : p
          )
      );
  
      const token = localStorage.getItem("token");
      if (token) {
          try {
              await fetch("http://localhost:5001/api/cart/add", {
                  method: "POST",
                  headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ productId, quantity })
              });
          } catch (error) {
              console.error("Erreur lors de la mise à jour du panier:", error);
          }
      }
  };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart"); // Supprime aussi du localStorage
    };

    return (
      <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        fetchCart // 🔥 Rendre accessible `fetchCart()`
    }}>
            {children}
        </CartContext.Provider>
    );
};