import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        securityLevel: { type: Number, default: 10 },
        managedCollections: [String],
    },
    { timestamps: true }
);

export default mongoose.model('AdminProfile', adminProfileSchema);
