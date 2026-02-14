import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    tenantId: { type: String, required: true, index: true },
    id: { type: String, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, enum: ['operador', 'admin'], default: 'operador' },
    plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
    
    emailVerified: { type: Boolean, default: false },
    emailToken: String,
    emailTokenExpires: Date, 
    
    // ✅ NOVOS CAMPOS PARA REDEFINIÇÃO DE SENHA
    resetPasswordToken: String,
    resetPasswordExpires: Date, // Validade do token
    
    profileImage: {
      data: Buffer,
      contentType: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
    phone: String,
    cpf: String,
    address: { street: String, city: String, state: String, zipCode: String },
    farm: { name: String, size: Number, location: String },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);