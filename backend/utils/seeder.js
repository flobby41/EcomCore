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
    // Nettoyage des collections
    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    // Génération et insertion dans l'ordre
    const products = await Product.insertMany(generateProducts());
    
    // Générer et insérer les utilisateurs
    const users = await generateUsers();
    const insertedUsers = await User.insertMany(users);
    
    // Générer et insérer les commandes avec les utilisateurs insérés
    const orders = await generateOrders(insertedUsers, products);
    await Order.insertMany(orders);

    console.log('Database successfully seeded');
    console.log('Utilisateur test ajouté : Email -> john@example.com | Password -> Test@1234');
    console.log('📢 Voici quelques utilisateurs générés avec leurs mots de passe en clair :');
    users.slice(0, 5).forEach(user => {
      console.log(`📧 Email: ${user.email} | 🔑 Password: ${user.rawPassword}`);
    });


    // Vérification de tous les utilisateurs après insertion
    const allUsers = await User.find();
    console.log('Vérification des utilisateurs en base de données :');
    allUsers.slice(0, 5).forEach(user => {
      console.log(`Email: ${user.email} | Password Hash: ${user.password}`);
    });
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
