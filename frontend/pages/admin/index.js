"use client"

import { useState, useEffect } from "react"
import { BarChart3, ShoppingCart, Users, Package, Sun, Moon, Menu, X } from "lucide-react"
import AdminLayout from './layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) throw new Error("Erreur lors du chargement des données")
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Error:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  if (loading) return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <p>Chargement...</p>
      </div>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData?.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">{dashboardData?.revenueIncrease} from last month</p>
            </CardContent>
          </Card>
          {/* Repeat similar Card components for New Customers, Sales, and Active Now, using data from dashboardData */}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Orders</h2>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="text-left font-bold">
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData?.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4">{order.product}</td>
                    <td className="px-6 py-4">${order.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

