import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
    return (
        <CartProvider>
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
            <Navbar />
            <Component {...pageProps} />
        </CartProvider>
    );
}

export default MyApp;