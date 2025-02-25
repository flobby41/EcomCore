import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Layout({ children }) {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <div className={`min-h-screen bg-gray-100 ${darkMode ? "dark" : ""}`}>
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        SkandiWall
                    </h1>
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </div>
            </header>

            <main className="dark:bg-gray-900">
                {children}
            </main>
        </div>
    );
} 