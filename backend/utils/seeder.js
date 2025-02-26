// backend/utils/seeder.js

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Import des modèles
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error(err));

// Fonction pour générer des produits
const generateProducts = (count = 20) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price(),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 100 }),
      image: faker.image.url(),
      slug: faker.helpers.slugify(faker.commerce.productName()),
    });
  }
  return products;
};

// Fonction pour générer des utilisateurs
const generateUsers = (count = 10) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      password: faker.internet.password(),
    });
  }
  return users;
};

// Fonction pour générer des commandes
const generateOrders = (users, products, count = 15) => {
  const orders = [];
  for (let i = 0; i < count; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProducts = faker.helpers.shuffle(products).slice(0, faker.number.int({ min: 1, max: 5 }));

    const total = randomProducts.reduce((sum, product) => sum + parseFloat(product.price), 0);

    orders.push({
      user: randomUser._id,
      email: randomUser.email,
      products: randomProducts.map(p => ({ product: p._id, quantity: faker.number.int({ min: 1, max: 3 }) })),
      total,
      status: faker.helpers.arrayElement(['pending', 'shipped', 'delivered', 'cancelled']),
      stripeSessionId: faker.string.uuid(),
    });
  }
  return orders;
};

// Fonction principale de seed
const seedDatabase = async () => {
  try {
    // Nettoyage des collections
    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    // Génération et insertion des données
    const products = await Product.insertMany(generateProducts());
    const users = await User.insertMany(generateUsers());
    const orders = await Order.insertMany(generateOrders(users, products));

    console.log('Database successfully seeded');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
