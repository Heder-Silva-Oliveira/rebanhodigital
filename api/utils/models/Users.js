// api/models/User.js (Exemplo Mongoose Schema)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Usando 'id' conforme discutido
    id: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Em produção, isso seria hashed
    name: { type: String, required: true },
    role: { type: String, default: 'operador' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updatedAt' } });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);