export default function handler(req, res) {
  // This is where you would typically fetch data from a database
  const dashboardData = {
    totalRevenue: 45231.89,
    revenueIncrease: "+20.1%",
    newCustomers: 2350,
    customerIncrease: "+180.1%",
    totalSales: 12234,
    salesIncrease: "+19%",
    activeNow: 573,
    activeIncrease: "+201",
    recentOrders: [
      { id: "#12345", customer: "John Doe", product: "Product A", amount: 99.99, status: "Completed" },
      { id: "#12346", customer: "Jane Smith", product: "Product B", amount: 149.99, status: "Pending" },
      { id: "#12347", customer: "Bob Johnson", product: "Product C", amount: 199.99, status: "Cancelled" },
    ],
  }
  res.status(200).json(dashboardData)
}

