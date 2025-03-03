// backend/utils/seeder.js

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './backend/.env' });

// Import des modèles
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');

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

    // Créer les items avec les informations complètes du produit
    const items = randomProducts.map(p => ({
      productId: p._id,
      product: {
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category
      },
      quantity: faker.number.int({ min: 1, max: 3 }),
      price: p.price
    }));

    // Calculer le montant total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Générer une adresse de livraison
    const shippingAddress = {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country()
    };

    orders.push({
      userId: randomUser._id, // Utiliser l'ID réel de l'utilisateur
      email: randomUser.email,
      items: items,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      status: faker.helpers.arrayElement(['pending', 'paid', 'processing', 'cancelled', 'shipped', 'delivered']),
      stripeSessionId: faker.string.uuid(),
      isGuestOrder: false
    });
  }
  return orders;
};

// Fonction principale de seed
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Garder la suppression des données existantes
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    // Générer et insérer les nouveaux produits
    const products = generateProducts(20); // ou le nombre que vous souhaitez
    const savedProducts = await Product.insertMany(products);
    
    // Générer et insérer les utilisateurs
    const users = await generateUsers();
    const savedUsers = await User.insertMany(users);
    
    // Générer et insérer les commandes avec les utilisateurs insérés
    const orders = await generateOrders(savedUsers, savedProducts);
    const savedOrders = await Order.insertMany(orders);

    // Générer des avis pour chaque produit
    console.log('Creating reviews...');
    const reviews = [];
    
    for (const product of savedProducts) {
      // Générer entre 5 et 15 avis par produit
      const numberOfReviews = Math.floor(Math.random() * 10) + 5;
      
      for (let i = 0; i < numberOfReviews; i++) {
        const review = {
          userId: faker.helpers.arrayElement(savedUsers)._id,
          productId: product._id,
          rating: faker.number.int({ min: 3, max: 5 }), // Tendance positive
          comment: faker.lorem.paragraph(),
          variant: faker.helpers.arrayElement(['Black', 'White', 'Complete set', '2pcs set']),
          verifiedPurchase: faker.datatype.boolean({ probability: 0.9 }), // 90% de chances d'être vérifié
          helpfulCount: faker.number.int({ min: 0, max: 50 }),
          createdAt: faker.date.past({ years: 1 }) // Date dans la dernière année
        };
        reviews.push(review);
      }
    }

    const savedReviews = await Review.insertMany(reviews);
    console.log(`✅ Created ${savedReviews.length} reviews`);

    console.log('✅ Database seeding completed successfully!');
    console.log('Utilisateur test ajouté : Email -> test@example.com | Password -> Test@1234');
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
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
