import mongoose from 'mongoose';

const staffProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        department: String,
        assignedHub: String,
        accessLevel: Number,
    },
    { timestamps: true }
);

export default mongoose.model('StaffProfile', staffProfileSchema);
