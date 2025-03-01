export async function fetchProducts() {
  const useShopify = process.env.NEXT_PUBLIC_USE_SHOPIFY === "true";

  const url = useShopify
    ? "http://localhost:5001/api/shopify/products"  // Shopify
    : "http://localhost:5001/api/products"; // Ton backend custom

  const response = await fetch(url);
  return response.json();
}