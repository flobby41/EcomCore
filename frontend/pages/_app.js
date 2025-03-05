import { CartProvider } from "../context/CartContext";
import { useEffect, useState } from 'react';


import { WishlistProvider } from "../context/WishlistContext";
import Layout from '../components/Layout';

import Navbar from "../components/Navbar";
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";





function MyApp({ Component, pageProps }) {
   // État pour suivre si le composant est monté côté client
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
       // Marquer le composant comme monté
       setMounted(true);
       
       // Vérifier le thème stocké ou la préférence système
       const storedTheme = localStorage.getItem('theme');
       const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
       
       // Appliquer le thème approprié
       if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
           document.documentElement.classList.add('dark');
       } else {
           document.documentElement.classList.remove('dark');
       }
   }, []);

   // Fonction pour basculer le mode sombre
   const toggleDarkMode = () => {
       if (document.documentElement.classList.contains('dark')) {
           document.documentElement.classList.remove('dark');
           localStorage.setItem('theme', 'light');
       } else {
           document.documentElement.classList.add('dark');
           localStorage.setItem('theme', 'dark');
       }
   };

   // Déterminer si le mode sombre est actif
   const isDarkMode = mounted ? document.documentElement.classList.contains('dark') : false;

    return (
            <WishlistProvider>
                <CartProvider>
                    <Layout darkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                    <Component {...pageProps} />
                    <Toaster />
                    </Layout>
                </CartProvider>
            </WishlistProvider>
    );
}

export default MyApp;

