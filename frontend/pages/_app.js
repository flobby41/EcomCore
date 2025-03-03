import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import Navbar from "../components/Navbar";
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
    return (
            <WishlistProvider>
                <CartProvider>
                    
                    <Navbar />
                    <Component {...pageProps} />
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 2000,
                            style: {
                                background: '#333',
                                color: '#fff',
                            },
                        }}
                    />
                </CartProvider>
            </WishlistProvider>
    );
}

export default MyApp;