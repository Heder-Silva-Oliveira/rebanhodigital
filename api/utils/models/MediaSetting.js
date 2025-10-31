// api/models/MediaSetting.js
const mongoose = require('mongoose');

const MediaSettingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Ex: 'hero_image', 'logo_url'
    description: { type: String },
    url: { type: String, required: true }, // O URL público da imagem
    metadata: { type: Object },
}, { versionKey: false, timestamps: true });

export default mongoose.models.MediaSetting || mongoose.model('MediaSetting', MediaSettingSchema);