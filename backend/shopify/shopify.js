import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "demo-shop.myshopify.com";
const ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "demo-access-token";

const SHOPIFY_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

export async function fetchShopify(query) {
  const response = await fetch(SHOPIFY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  return response.json();
}

// Récupérer tous les produits
export async function getAllProducts() {
  const query = `
    query {
      products(first: 10) {
        edges {
          node {
            id
            title
            description
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  
  try {
    const response = await fetchShopify(query);
    if (!response.data) {
      console.error('Shopify response error:', response);
      return [];
    }
    return response.data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      description: node.description,
      image: node.images.edges[0]?.node.url,
      price: node.variants.edges[0]?.node.price.amount,
    }));
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return [];
  }
}