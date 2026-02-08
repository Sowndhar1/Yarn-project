
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const mapping = {
    "Cotton & Fancy Yarn": [
        "Cotton yarn",
        "Open-end yarn",
        "Ring-spun yarn",
        "Viscose/Modal/Bamboo yarn",
        "Dyed cones",
        "Melange yarn",
        "Fancy yarns (chenille/slub/boucle/eyelash)"
    ],
    "Polyester Yarn": [
        "Polyester (POY/FDY/DTY)",
        "Cotton-Polyester blends"
    ],
    "Lycra & Core Lycra Yarn": [
        "Spandex/Lycra yarn",
        "Elastics & trims"
    ],
    "Filament Yarn": [
        "Sewing thread",
        "Embroidery thread"
    ]
};

const updateCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        for (const [newCategory, oldCategories] of Object.entries(mapping)) {
            const result = await Product.updateMany(
                {
                    brand: 'Shivam Yarn Agencies',
                    category: { $in: oldCategories }
                },
                { $set: { category: newCategory } },
                { runValidators: false }
            );
            console.log(`Updated to "${newCategory}": ${result.modifiedCount} products`);
        }

        // Handle "High Bulk Yarn" if any matches found ? 
        // I don't have explicit high bulk in my seed list, but maybe user wants acrylics there?
        // I'll leave others as is for now.

        console.log("Category update complete");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateCategories();
