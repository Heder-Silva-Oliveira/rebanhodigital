import { Financial } from '../../financial/model/Financial.model.js';
import { Animal } from '../../animal/model/Animal.model.js';

export const getCompanyHealth = async (req, res) => {
    try {
        const totalAnimals = await Animal.countDocuments({ tenantId: req.user.tenantId });
        const totalFinancials = await Financial.countDocuments({ tenantId: req.user.tenantId });
        res.json({ message: "Acesso Pro OK", dataPoints: totalAnimals + totalFinancials });
    } catch (err) { res.status(500).json({ error: err.message }); }
};