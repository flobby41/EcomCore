"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, ShoppingCart, Users, Package, 
  TrendingUp, AlertCircle, Calendar, Settings,
  DollarSign, Percent, ArrowUp, ArrowDown
} from "lucide-react"
import AdminLayout from './layout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('week') // 'day', 'week', 'month', 'year'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("🔑 Token:", token);
        
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard?range=${timeRange}`;
        console.log("🌐 URL de l'API:", apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log("📡 Status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Erreur API:", errorData);
          throw new Error(errorData.message || "Erreur lors du chargement des données");
        }

        const data = await response.json();
        console.log("📦 Données reçues:", data);
        setDashboardData(data);
      } catch (error) {
        console.error("❌ Erreur complète:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (loading) return <AdminLayout><div className="p-8">Chargement...</div></AdminLayout>
  if (error) return <AdminLayout><div className="p-8 text-red-500">Erreur: {error}</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="p-8">
        {/* En-tête du Dashboard */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <div className="flex gap-2">
            <Button 
              variant={timeRange === 'day' ? 'default' : 'outline'}
              onClick={() => setTimeRange('day')}
            >
              Jour
            </Button>
            <Button 
              variant={timeRange === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeRange('week')}
            >
              Semaine
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeRange('month')}
            >
              Mois
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.revenue.total}€</div>
              <div className="flex items-center text-xs">
                {dashboardData?.revenue.trend > 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={dashboardData?.revenue.trend > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(dashboardData?.revenue.trend)}%
                </span>
                <span className="text-muted-foreground ml-1">vs période précédente</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.orders.total}</div>
              <div className="flex items-center text-xs">
                {dashboardData?.orders.trend > 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={dashboardData?.orders.trend > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(dashboardData?.orders.trend)}%
                </span>
                <span className="text-muted-foreground ml-1">vs période précédente</span>
              </div>
            </CardContent>
          </Card>

          {/* Cartes similaires pour Nouveaux Clients et Panier Moyen */}
        </div>

        {/* Graphiques */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventes sur la période</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData?.salesChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-4">ID</th>
                      <th className="pb-4">Client</th>
                      <th className="pb-4">Montant</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recentOrders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="py-4">{order.id}</td>
                        <td className="py-4">{order.customer}</td>
                        <td className="py-4">{order.amount}€</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes et Notifications */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Alertes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.alerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg flex items-center gap-3 ${
                    alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                    alert.type === 'error' ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    <AlertCircle className="h-5 w-5" />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

