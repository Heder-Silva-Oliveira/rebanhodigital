// src/components/EmailVerificationModal.tsx NÂO ESTA EM USO ATUALMENTE
import React, { useState, useEffect, useCallback } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { lumi } from '../lib/lumi';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void; // o pai decide o que fazer após verificar (fechar, logar, etc.)
}

const API_URL = import.meta.env.VITE_API_URL as string;

// Tenta marcar o usuário como verificado no backend em rotas comuns
async function markVerifiedInBackend(email: string): Promise<boolean> {
  if (!API_URL) return false;
  const endpoints = ['/api/verify-email', '/auth/verify-email'];

  for (const path of endpoints) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) return true;
    } catch {
      // tenta a próxima rota
    }
  }
  return false;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerified,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // Normaliza email
  const targetEmail = (email || '').trim().toLowerCase();

  // Gera código de 6 dígitos
  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Envia código (cria registro no Lumi e dispara email)
  const sendVerificationCode = useCallback(async () => {
    if (!targetEmail) {
      toast.error('Email inválido');
      return;
    }

    setIsResending(true);
    try {
      const verificationCode = generateCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const verification = await lumi.entities.email_verifications.create({
        email: targetEmail,
        code: verificationCode,
        verified: false,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        userId: lumi.auth.user?.userId || '',
      });

      setVerificationId(verification._id);
      setCountdown(60);

      await lumi.tools.email.send({
        to: targetEmail,
        subject: 'Código de Verificação - AgroPec Manager',
        fromName: 'AgroPec Manager',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">🐄 AgroPec Manager</h1>
            </div>
            <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Verificação de Email</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Olá! Use o código abaixo para verificar seu email:
              </p>
              <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Seu código de verificação:</p>
                <h1 style="color: #10b981; font-size: 48px; letter-spacing: 8px; margin: 0; font-weight: bold;">${verificationCode}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Este código expira em <strong>15 minutos</strong>.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Se você não solicitou este código, ignore este email.
              </p>
            </div>
          </div>
        `,
      });

      toast.success('Código enviado para seu email!');
    } catch (error) {
      console.error('Erro ao enviar código:', error);
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  }, [targetEmail]);

  // Dispara envio ao abrir
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setVerificationId(null);
      // Envia automaticamente ao abrir
      sendVerificationCode();
    } else {
      setCountdown(0);
    }
  }, [isOpen, sendVerificationCode]);

  // Timer do reenvio
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (code.length !== 6) {
        toast.error('Digite um código válido de 6 dígitos');
        return;
      }

      setIsLoading(true);
      try {
        // Busca o registro mais recente para esse email/código
        const { list } = await lumi.entities.email_verifications.list({
          filter: { email: targetEmail, code, verified: false },
          sort: { createdAt: -1 },
          limit: 1,
        });

        if (!list?.length) {
          toast.error('Código inválido ou já utilizado');
          return;
        }

        const verification = list[0];

        // Validade
        if (new Date(verification.expiresAt) < new Date()) {
          toast.error('Código expirado. Solicite um novo código.');
          return;
        }

        // Marca como verificado no Lumi
        await lumi.entities.email_verifications.update(verification._id, { verified: true });

        // Marca como verificado no backend (para liberar login)
        const backendOk = await markVerifiedInBackend(targetEmail);
        if (!backendOk) {
          // Não bloqueia o fluxo, mas avisa
          toast('Verificado. Caso o login não libere, tente novamente em alguns segundos.', {
            icon: 'ℹ️',
          });
        }

        toast.success('Email verificado com sucesso!');
        onVerified(); // o pai decide fechar/entrar/etc.
      } catch (err) {
        console.error('Erro na verificação:', err);
        toast.error('Erro ao verificar código. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [code, targetEmail, onVerified]
  );

  const handleResend = useCallback(async () => {
    if (countdown > 0) {
      toast.error(`Aguarde ${countdown}s para reenviar`);
      return;
    }
    await sendVerificationCode();
  }, [countdown, sendVerificationCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => {
          if (!isLoading && !isResending) onClose();
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            if (!isLoading && !isResending) onClose();
          }}
          disabled={isLoading || isResending}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verificação de Email</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Digite o código de 6 dígitos enviado para:</p>
          <p className="text-green-600 dark:text-green-400 font-semibold mt-1 break-all">{targetEmail}</p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* Code Input */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de Verificação
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                if (text) {
                  e.preventDefault();
                  setCode(text);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? 'Verificando...' : (<><CheckCircle className="w-5 h-5 mr-2" /> Verificar Email</>)}
          </button>
        </form>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Não recebeu o código?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="text-green-600 dark:text-green-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Enviando...' : countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
            O código é válido por 15 minutos. Verifique sua caixa de spam se não encontrar o email.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationModal;
