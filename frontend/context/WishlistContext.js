import { createContext, useState, useContext, useEffect } from "react";
import toast from 'react-hot-toast';
import { wishlistAddedToast, wishlistRemovedToast, errorToast } from '../utils/toast-utils';



// Création du contexte
const WishlistContext = createContext();

// Hook personnalisé pour accéder au contexte plus facilement
export const useWishlist = () => useContext(WishlistContext);

// Provider de la wishlist
export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadWishlist = async () => {
        const token = localStorage.getItem("token");
        console.log("🔄 Début du chargement de la wishlist, token présent:", !!token);
        
        if (!token) {
            setWishlist([]);
            return;
        }
        
        setIsLoading(true);
        
        try {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };
            
            console.log("📤 Envoi de la requête à la wishlist...");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
                headers
            });
            
            console.log("📥 Réponse reçue, statut:", response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log("🔑 Données reçues de la wishlist:", data);
                
                if (data && data.items && Array.isArray(data.items)) {
                    const transformedItems = data.items.map(item => ({
                        _id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        image: item.productId.image || '/placeholder-image.jpg',
                        category: item.productId.category
                    }));
                    setWishlist(transformedItems);
                } else {
                    console.warn("⚠️ Format de données inattendu:", data);
                    setWishlist([]);
                }
            } else {
                console.error("❌ Erreur API:", response.status);
                if (response.status === 401 || response.status === 404) {
                    setWishlist([]);
                }
            }
        } catch (error) {
            console.error("❌ Exception lors du chargement de la wishlist:", error);
            setWishlist([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Charger la wishlist au démarrage et quand le token change
    useEffect(() => {
        loadWishlist();
    }, []);

    const addToWishlist = async (product) => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            return false; // Indique qu'il faut rediriger vers login
        }
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/add`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productId: product._id })
            });

            if (response.ok) {
                // Ajouter localement pour éviter un rechargement complet
                setWishlist(prev => {
                    if (!prev.some(item => item._id === product._id)) {
                        return [...prev, product];
                    }
                    return prev;
                });
                
                wishlistAddedToast(product.name);
                return true;
            } else {
                errorToast('Failed to add to wishlist');
                return false;
            }
        } catch (error) {
            console.error("Erreur:", error);
            errorToast("Error syncing with server");
            return false;
        }
    };

    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem("token");
        
        if (!token) return false;
        
        try {
            // Trouver le produit avant de le supprimer pour avoir son nom et ses détails
            const productToRemove = wishlist.find(item => item._id === productId);
            const productName = productToRemove ? productToRemove.name : 'Product';
            
            // Garder une copie complète du produit pour l'annulation
            const productCopy = productToRemove ? {...productToRemove} : null;
            
            // Mettre à jour localement d'abord pour une réponse immédiate
            setWishlist(prev => prev.filter(item => item._id !== productId));
            
            // Créer une fonction d'annulation qui fonctionne correctement
            const undoFunction = () => {
                if (productCopy) {
                    // Ajouter localement d'abord pour une réponse immédiate
                    setWishlist(prev => {
                        if (!prev.some(item => item._id === productCopy._id)) {
                            return [...prev, productCopy];
                        }
                        return prev;
                    });
                    
                    // Puis synchroniser avec le serveur
                    if (token) {
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/add`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ productId: productCopy._id })
                        }).catch(error => {
                            console.error("Erreur lors de l'annulation:", error);
                            // En cas d'erreur, recharger la wishlist
                            loadWishlist();
                        });
                    }
                }
            };
            
            // Afficher le toast avec la fonction d'annulation
            wishlistRemovedToast(productName, undoFunction);
            
            // Puis synchroniser avec le serveur
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/remove`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) {
                // En cas d'erreur, restaurer l'état précédent
                if (productCopy) {
                    setWishlist(prev => {
                        if (!prev.some(item => item._id === productCopy._id)) {
                            return [...prev, productCopy];
                        }
                        return prev;
                    });
                }
                errorToast('Failed to remove from wishlist');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("Erreur:", error);
            errorToast("Error syncing with server");
            // Recharger la wishlist en cas d'erreur
            loadWishlist();
            return false;
        }
    };

    const isInWishlist = (productId) => {
        // Si l'utilisateur n'est pas connecté, retourner false
        if (!localStorage.getItem("token")) {
            return false;
        }
        return wishlist.some(item => item._id === productId);
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem("token");
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    return (
        <WishlistContext.Provider value={{ 
            wishlist, 
            addToWishlist, 
            removeFromWishlist, 
            loadWishlist,
            isInWishlist,
            isLoading,
            clearWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
}; 