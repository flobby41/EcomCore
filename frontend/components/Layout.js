import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Navbar from './Navbar';
import Footer from './Footer';
import Head from 'next/head';

export default function Layout({ children, title = "E-Commerce Store", darkMode, toggleDarkMode }) {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Head>
                <title>{title}</title>
                <meta name="description" content="Your premier e-commerce destination for quality products" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <Navbar />
            
            <main className="flex-grow pt-16">
                {children}
            </main>
            
            <Footer />
            
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleDarkMode}
                    className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? (
                        <Sun className="h-5 w-5 text-yellow-500" />
                    ) : (
                        <Moon className="h-5 w-5 text-gray-700" />
                    )}
                </button>
            </div>
        </div>
    );
} 