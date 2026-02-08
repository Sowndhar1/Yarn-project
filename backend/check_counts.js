import mongoose from 'mongoose';

const uri = "mongodb+srv://YarnBusiness:yarnbusiness@cluster0.b5a3ef6.mongodb.net/yarn-business?retryWrites=true&w=majority";

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Define a loose schema to read all fields
        const productSchema = new mongoose.Schema({}, { strict: false });
        const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

        const total = await Product.countDocuments();
        console.log('Total Products in DB:', total);

        const allProducts = await Product.find({}, '_id name stockKg');
        console.log('All Products:');
        allProducts.forEach(p => console.log(`- ${p._id} | ${p.name} | stockKg: ${p.stockKg}`));

        // Check low stock using NEW logic
        const lowStockKgDocs = await Product.find({
            $expr: { $lte: ["$stockKg", { $ifNull: ["$minStockLevel", 20] }] }
        });
        console.log('Low Stock (StockKg Logic) Count:', lowStockKgDocs.length);
        console.log('Low Stock Docs:');
        lowStockKgDocs.forEach(p => console.log(`- ${p._id} | ${p.name}`));

        // Check old logic
        const lowStockOldDocs = await Product.find({
            $expr: { $lte: ["$stockLevel", "$minStockLevel"] }
        });
        console.log('Low Stock (Old Logic) Count:', lowStockOldDocs.length);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
