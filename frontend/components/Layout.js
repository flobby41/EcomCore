import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Navbar from './Navbar';
import Footer from './Footer';
import Head from 'next/head';

export default function Layout({ children, title = "E-Commerce Store" }) {
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Effect to handle dark mode initialization
    useEffect(() => {
        setMounted(true);
        // Check if user has a preference stored
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        // Check if user prefers dark mode at OS level
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial state based on saved preference or OS preference
        const initialDarkMode = savedDarkMode !== null ? savedDarkMode : prefersDarkMode;
        setDarkMode(initialDarkMode);
        
        // Apply dark mode class if needed
        if (initialDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', newDarkMode.toString());
        
        // Toggle class on html element
        if (newDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Render toggle button only after component is mounted to avoid hydration mismatch
    const renderThemeToggle = () => {
        if (!mounted) return null;
        
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-md rounded-full p-2"
                aria-label="Toggle dark mode"
            >
                {darkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                    <Moon className="h-5 w-5 text-blue-700" />
                )}
            </Button>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            <Head>
                <title>{title}</title>
                <meta name="description" content="Your premier e-commerce destination for quality products" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <Navbar />
            
            <main className="flex-grow">
                {children}
            </main>
            
            <Footer />
            
            {renderThemeToggle()}
        </div>
    );
} 