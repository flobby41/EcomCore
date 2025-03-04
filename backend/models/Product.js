const mongoose = require("mongoose");
const slugify = require("slugify"); // Vous devrez installer ce package: npm install slugify

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // URL de l'image du produit
    category: {
        type: String,
        required: true,
        enum: [
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
        ]
    },
    stock: { type: Number, required: true, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Middleware pre-save pour générer automatiquement le slug
productSchema.pre('save', function(next) {
    // Si le nom a été modifié ou si le slug n'existe pas encore
    if (this.isModified('name') || !this.slug) {
        // Générer un slug à partir du nom
        this.slug = slugify(this.name, {
            lower: true,      // Convertir en minuscules
            strict: true,     // Supprimer les caractères spéciaux
            trim: true        // Supprimer les espaces au début et à la fin
        });
        
        // Ajouter un identifiant unique pour éviter les doublons
        // Utiliser les 6 premiers caractères de l'ID MongoDB
        if (this._id) {
            this.slug += `-${this._id.toString().substring(0, 6)}`;
        }
    }
    next();
});

module.exports = mongoose.model("Product", productSchema);