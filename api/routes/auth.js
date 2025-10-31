// api/routes/auth.js (Exemplo de rota/controller)
const express = require('express');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User'); // Ajuste o caminho conforme sua estrutura

const router = express.Router();

// Chave secreta para assinar o JWT (MUITO IMPORTANTE: Mova isso para uma variável de ambiente em produção!)
const JWT_SECRET = 'SEGREDO_SUPER_SEGURO_MUDE_ISTO'; 

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuário no MongoDB
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // 2. Comparar Senha (Substitua pela comparação BCrypt em produção)
        // Para o mock, faremos comparação de texto simples (DEV/MOCK ONLY!)
        if (user.password !== password) { 
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // 3. Gerar o JWT (Token)
        const token = jwt.sign(
            { id: user.id, role: user.role }, // Payload: O que será armazenado no token
            JWT_SECRET,
            { expiresIn: '1h' } // Expirar em 1 hora
        );

        // 4. Retornar o Token e os dados do Usuário (sem a senha!)
        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("Erro durante o login:", error);
        res.status(500).json({ message: 'Erro interno do servidor durante o login.' });
    }
});

module.exports = router;