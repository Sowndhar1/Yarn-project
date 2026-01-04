import { connectDB, closeDB } from '../src/config/db.js';

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        const db = await connectDB();

        // Clear existing data
        await db.collection('users').deleteMany({});
        await db.collection('products').deleteMany({});
        await db.collection('stock').deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Seed users
        const users = [
            {
                name: "Admin User",
                username: "admin",
                email: "admin@yarnbusiness.com",
                password: "admin123",
                role: "admin",
                phone: "9876543210",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                name: "Sales Staff",
                username: "sales1",
                email: "sales@yarnbusiness.com",
                password: "sales123",
                role: "sales_staff",
                phone: "9988776655",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                name: "Inventory Staff",
                username: "inventory1",
                email: "inventory@yarnbusiness.com",
                password: "inventory123",
                role: "inventory_staff",
                phone: "8877665544",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                name: "John Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "customer123",
                role: "customer",
                phone: "7766554433",
                address: "123 Yarn St, Textile City",
                createdAt: new Date().toISOString(),
                isActive: true
            }
        ];

        await db.collection('users').insertMany(users);
        console.log(`✅ Seeded ${users.length} users`);

        // Seed products
        const products = [
            {
                name: "CozySpun 40s",
                count: "40s",
                color: "Natural",
                brand: "CozySpun",
                material: "Combed Cotton",
                pricePerKg: 320,
                hsnCode: "52051290",
                gstRate: 18,
                minStockLevel: 100,
                leadTimeDays: 2,
                description: "Premium combed cotton yarn ideal for fine woven shirtings. Balanced strength and softness.",
                thumbnail: "https://images.unsplash.com/photo-1458053688450-eef25285f6ea?auto=format&fit=crop&w=600&q=80",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                name: "VividTwist 30s",
                count: "30s",
                color: "Pacific Blue",
                brand: "VividTwist",
                material: "Cotton Rich",
                pricePerKg: 275,
                hsnCode: "52051290",
                gstRate: 18,
                minStockLevel: 200,
                leadTimeDays: 1,
                description: "Color-fast dyed yarn for tees and casual knits. Ships same day for confirmed orders.",
                thumbnail: "https://images.unsplash.com/photo-1460144696528-5a514b620b37?auto=format&fit=crop&w=600&q=80",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                name: "MillFlex 24s",
                count: "24s",
                color: "Heather Grey",
                brand: "MillFlex",
                material: "Poly-Cotton",
                pricePerKg: 245,
                hsnCode: "52064210",
                gstRate: 18,
                minStockLevel: 300,
                leadTimeDays: 3,
                description: "High-volume melange yarn engineered for fleece and athleisure programs.",
                thumbnail: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=80",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        const productResult = await db.collection('products').insertMany(products);
        console.log(`✅ Seeded ${products.length} products`);

        // Seed stock
        const productIds = Object.values(productResult.insertedIds);
        const stock = [
            {
                productId: productIds[0].toString(),
                quantity: 850,
                location: "Warehouse A",
                batchNumber: "BATCH-001",
                manufacturedDate: "2024-01-15",
                expiryDate: null,
                lastUpdated: new Date().toISOString()
            },
            {
                productId: productIds[1].toString(),
                quantity: 520,
                location: "Warehouse B",
                batchNumber: "BATCH-002",
                manufacturedDate: "2024-02-01",
                expiryDate: null,
                lastUpdated: new Date().toISOString()
            },
            {
                productId: productIds[2].toString(),
                quantity: 1200,
                location: "Warehouse A",
                batchNumber: "BATCH-003",
                manufacturedDate: "2024-01-20",
                expiryDate: null,
                lastUpdated: new Date().toISOString()
            }
        ];

        await db.collection('stock').insertMany(stock);
        console.log(`✅ Seeded ${stock.length} stock records`);

        console.log('🎉 Database seeding completed successfully!');

        await closeDB();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        await closeDB();
        process.exit(1);
    }
};

seedData();
