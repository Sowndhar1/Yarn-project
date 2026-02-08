
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const updateImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const products = await Product.find({ brand: 'Shivam Yarn Agencies' });
        console.log(`Found ${products.length} products.`);

        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            const imageUrl = `https://loremflickr.com/600/400/yarn,textile?lock=${i + 100}`;

            // Bypass validation to avoid Enum errors since Schema was reverted
            await Product.updateOne(
                { _id: p._id },
                { $set: { thumbnail: imageUrl, images: [imageUrl] } },
                { runValidators: false }
            );
            console.log(`Updated images for: ${p.name}`);
        }

        console.log("Image update complete");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateImages();
