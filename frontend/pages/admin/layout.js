import { useState } from "react";
import { BarChart3, ShoppingCart, Users, Package, Sun, Moon, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminLayout({ children }) {
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark");
    };

    const handleLogout = () => {
        router.push('/admin/login?logout=true');
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Products', href: '/admin/products', icon: Package },
    ];

    return (
        <div className={`flex h-screen bg-gray-100 ${darkMode ? "dark" : ""}`}>
            {/* Sidebar */}
            <div className={`
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex items-center justify-between h-16 px-6 bg-gray-900 dark:bg-gray-700">
                    <span className="text-xl font-semibold text-white">Admin Panel</span>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-6 w-6 text-white" />
                    </Button>
                </div>
                <nav className="mt-6">
                    {navigation.map((item) => {
                        const isActive = router.pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className={`flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 text-blue-700' : ''}`}>
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Admin Panel</h1>
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}