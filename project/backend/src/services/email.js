const nodemailer = require('nodemailer');
const env = require('../config/env');

console.log('🔧 Configuration du transporteur email...');
console.log(`📧 Hôte SMTP: ${env.EMAIL_HOST}:${env.EMAIL_PORT}`);
console.log(`👤 Compte: ${env.EMAIL_USER}`);

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT),
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Vérification de la configuration du transporteur
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Erreur de configuration du transporteur email:', error);
  } else {
    console.log('✅ Le serveur SMTP est prêt à envoyer des emails');
  }
});

exports.sendOTPEmail = async (to, code) => {
  console.log(`\n📨 ========== TENTATIVE D'ENVOI D'OTP ==========`);
  console.log(`📧 Destinataire: ${to}`);
  console.log(`🔑 Code OTP: ${code}`);
  
  if (!to || !code) {
    console.error('❌ Erreur: Destinataire ou code OTP manquant');
    return false;
  }

  const mailOptions = {
    from: `"CongoMuv Auth" <${env.EMAIL_USER}>`,
    to,
    subject: 'Votre code OTP CongoMuv',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Votre code de vérification</h2>
        <p>Bonjour,</p>
        <p>Voici votre code de vérification pour vous connecter à CongoMuv :</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <h1 style="color: #2e86de; margin: 0; font-size: 36px; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>Ce code est valable pendant <strong>5 minutes</strong>.</p>
        <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          Cet email a été envoyé automatiquement, veuillez ne pas y répondre.
        </p>
      </div>
    `
  };

  try {
    console.log('🔄 Tentative d\'envoi de l\'email...');
    
    // Vérification de la configuration avant envoi
    if (!env.EMAIL_HOST || !env.EMAIL_PORT || !env.EMAIL_USER || !env.EMAIL_PASS) {
      throw new Error('Configuration SMTP incomplète. Vérifiez vos variables d\'environnement.');
    }

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email OTP envoyé avec succès!');
    console.log('📩 Détails de l\'envoi:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      response: info.response
    });
    
    return true;
  } catch (error) {
    console.error('❌ ERREUR LORS DE L\'ENVOI DE L\'EMAIL:');
    console.error('🔍 Code d\'erreur:', error.code);
    console.error('📝 Message:', error.message);
    
    if (error.response) {
      console.error('📡 Réponse du serveur SMTP:', error.response);
    }
    
    // Détails spécifiques pour les erreurs courantes
    switch (error.code) {
      case 'EAUTH':
        console.error('🔑 Erreur d\'authentification SMTP. Vérifiez vos identifiants Gmail.');
        console.error('ℹ️ Assurez-vous d\'utiliser un mot de passe d\'application si l\'authentification à deux facteurs est activée.');
        break;
      case 'ECONNREFUSED':
        console.error('🔌 Impossible de se connecter au serveur SMTP. Vérifiez l\'hôte et le port.');
        break;
      case 'ETIMEDOUT':
        console.error('⏱️ Délai d\'attente dépassé lors de la connexion au serveur SMTP.');
        break;
      default:
        console.error('🔍 Détails complets de l\'erreur:', error);
    }
    
    return false;
  }
};
