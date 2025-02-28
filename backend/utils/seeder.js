// backend/utils/seeder.js

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './backend/.env' });

// Import des modèles
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error(err));

// Définir les catégories possibles
const categories = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Beauty',
  'Jewelry',
  'Automotive',
  'Office'
];

// Définir les utilisateurs avec leurs mots de passe
const usersList = [
  { name: 'Admin User', email: 'admin@example.com', password: 'admin123', isAdmin: true },
  { name: 'John Doe', email: 'john@example.com', password: 'user123', isAdmin: false },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'user123', isAdmin: false },
  { name: 'Bob Wilson', email: 'bob@example.com', password: 'user123', isAdmin: false },
  { name: 'Alice Brown', email: 'alice@example.com', password: 'user123', isAdmin: false }
];

// Fonction pour générer des produits
const generateProducts = (count) => {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const product = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      image: faker.image.url(),
      stock: faker.number.int({ min: 0, max: 100 }),
      // Ajouter une catégorie aléatoire
      category: faker.helpers.arrayElement(categories),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    };
    products.push(product);
  }
  
  return products;
};

// Fonction pour générer des utilisateurs avec hachage du mot de passe
const generateUsers = async (count = 10) => {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const password = faker.internet.password(); // Générer un mot de passe aléatoire
      const hashedPassword = await bcrypt.hash(password, 10); // Assurer le hachage
      console.log(`User ${i + 1} - Email: ${faker.internet.email()} | Password: ${password} | Hashed: ${hashedPassword}`);
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        password: hashedPassword,
        rawPassword: password, // Ajout temporaire pour debug
      });
    } catch (err) {
      console.error(`Erreur lors du hachage du mot de passe pour l'utilisateur ${i + 1}:`, err);
    }
  }

  // Ajout d'un utilisateur test avec un mot de passe haché
const testUserPassword = "Test@1234";
const hashedTestPassword = await bcrypt.hash(testUserPassword, 10);

console.log(`Test User - Email: test@example.com | Password: ${testUserPassword} | Hashed: ${hashedTestPassword}`);

users.push({
    name: "Test User",
    email: "test@example.com",
    password: hashedTestPassword, // 🔥 Stocke le mot de passe haché
    address: "123 Main Street",
    city: "Test City",
    country: "Test Country",
    rawPassword: testUserPassword, // Debug seulement
});
  return users;
};

// Fonction pour générer des commandes
const generateOrders = async (users, products, count = 15) => {
  const orders = [];
  
  // Récupérer les vrais utilisateurs de la base de données
  const dbUsers = await User.find({});
  
  for (let i = 0; i < count; i++) {
    // Utiliser les utilisateurs de la base de données
    const randomUser = dbUsers[Math.floor(Math.random() * dbUsers.length)];
    const randomProducts = faker.helpers.shuffle(products).slice(0, faker.number.int({ min: 1, max: 5 }));

    console.log(`Création commande pour user:`, {
      id: randomUser._id,
      email: randomUser.email
    });

    orders.push({
      userId: randomUser._id, // Utiliser l'ID réel de l'utilisateur
      email: randomUser.email,
      items: randomProducts.map(p => ({
        productId: p._id,
        quantity: faker.number.int({ min: 1, max: 3 }),
        price: p.price
      })),
      totalAmount: randomProducts.reduce((sum, p) => sum + parseFloat(p.price), 0),
      status: faker.helpers.arrayElement(['pending', 'paid', 'cancelled', 'shipped', 'delivered']),
      stripeSessionId: faker.string.uuid(),
    });
  }
  return orders;
};

// Fonction principale de seed
const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Supprimer les données existantes
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});

    // 1. Créer les produits
    const products = Array(20).fill().map(() => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      image: faker.image.url(),
      stock: faker.number.int({ min: 0, max: 100 }),
      category: faker.helpers.arrayElement(categories),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }));

    const savedProducts = await Product.insertMany(products);
    console.log('✅ Products seeded');

    // 2. Créer les utilisateurs avec logs
    const users = usersList.map(user => ({
      ...user,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }));

    console.log('\n👥 User Credentials:');
    users.forEach(user => {
      console.log(`\n${user.isAdmin ? '👑 Admin' : '👤 User'}:`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
    });
    console.log('\n');

    const savedUsers = await User.insertMany(users);
    console.log('✅ Users seeded');

    // 3. Créer les commandes
    const orders = Array(15).fill().map(() => {
      const numItems = faker.number.int({ min: 1, max: 4 });
      const selectedProducts = faker.helpers.arrayElements(savedProducts, numItems);
      const user = faker.helpers.arrayElement(savedUsers);
      
      return {
        userId: user._id,
        email: user.email,
        items: selectedProducts.map(product => ({
          productId: product._id,
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: product.price
        })),
        status: faker.helpers.arrayElement(['pending', 'paid', 'cancelled', 'delivered']),
        stripeSessionId: faker.string.uuid(),
        isGuestOrder: false,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };
    });

    await Order.insertMany(orders);
    console.log('✅ Orders seeded');

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
