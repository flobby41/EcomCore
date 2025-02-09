import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar"; // Assure-toi que le chemin est correct
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
    return (
        <CartProvider>
            <>
                <Navbar /> {/* La Navbar sera affichée sur toutes les pages */}
                <Component {...pageProps} />
            </>
        </CartProvider>
    );
}