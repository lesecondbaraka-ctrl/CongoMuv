/**
 * Valide un numéro de téléphone
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} Vrai si le numéro est valide
 */
export const validatePhoneNumber = (phone) => {
  // Format international: +243 81 234 5678 ou 081 234 5678
  const re = /^(\+?243|0)[789]\d{8}$/;
  return re.test(phone);
};

/**
 * Valide une adresse email
 * @param {string} email - Adresse email à valider
 * @returns {boolean} Vrai si l'email est valide
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Le mot de passe est requis' };
  }
  
  if (password.length < 8) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins 8 caractères' 
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins une majuscule' 
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins une minuscule' 
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins un chiffre' 
    };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins un caractère spécial' 
    };
  }
  
  return { isValid: true, message: 'Mot de passe valide' };
};

/**
 * Valide un code PIN (4 à 6 chiffres)
 * @param {string} pin - Code PIN à valider
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePin = (pin) => {
  if (!pin) {
    return { isValid: false, message: 'Le code PIN est requis' };
  }
  
  const re = /^\d{4,6}$/;
  if (!re.test(pin)) {
    return { 
      isValid: false, 
      message: 'Le code PIN doit contenir entre 4 et 6 chiffres' 
    };
  }
  
  return { isValid: true, message: 'Code PIN valide' };
};

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param {string} phone - Numéro de téléphone à formater
 * @returns {string} Numéro formaté
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Supprime tous les caractères non numériques
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Formate selon la longueur du numéro
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};

/**
 * Valide un numéro de carte d'identité
 * @param {string} idNumber - Numéro à valider
 * @returns {boolean} Vrai si le numéro est valide
 */
export const validateIdNumber = (idNumber) => {
  if (!idNumber) return false;
  // Format: 1 lettre suivie de 12 chiffres
  const re = /^[A-Za-z]\d{12}$/;
  return re.test(idNumber);
};

/**
 * Valide un numéro de passeport
 * @param {string} passport - Numéro de passeport à valider
 * @returns {boolean} Vrai si le numéro est valide
 */
export const validatePassport = (passport) => {
  if (!passport) return false;
  // Format: 2 lettres suivies de 7 chiffres
  const re = /^[A-Za-z]{2}\d{7}$/;
  return re.test(passport);
};

/**
 * Valide une date de naissance (doit être d'au moins 18 ans)
 * @param {Date} date - Date de naissance à valider
 * @returns {boolean} Vrai si la date est valide
 */
export const validateBirthDate = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const birthDate = new Date(date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
};

/**
 * Valide un code de réservation
 * @param {string} code - Code à valider
 * @returns {boolean} Vrai si le code est valide
 */
export const validateBookingCode = (code) => {
  if (!code) return false;
  // Format: 2 lettres suivies de 6 chiffres
  const re = /^[A-Za-z]{2}\d{6}$/;
  return re.test(code);
};

/**
 * Valide un montant numérique
 * @param {string|number} amount - Montant à valider
 * @param {number} min - Montant minimum (inclus)
 * @param {number} max - Montant maximum (inclus)
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateAmount = (amount, min = 0, max = 1000000) => {
  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, message: 'Le montant est requis' };
  }
  
  const num = Number(amount);
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Le montant doit être un nombre' };
  }
  
  if (num < min) {
    return { 
      isValid: false, 
      message: `Le montant doit être supérieur ou égal à ${min}` 
    };
  }
  
  if (num > max) {
    return { 
      isValid: false, 
      message: `Le montant doit être inférieur ou égal à ${max}` 
    };
  }
  
  return { isValid: true, message: 'Montant valide' };
};

/**
 * Valide un code de réduction
 * @param {string} code - Code à valider
 * @returns {boolean} Vrai si le code est valide
 */
export const validatePromoCode = (code) => {
  if (!code) return false;
  // Format: 6-8 caractères alphanumériques en majuscules
  const re = /^[A-Z0-9]{6,8}$/;
  return re.test(code);
};

/**
 * Valide un numéro de carte de crédit (format simple)
 * @param {string} cardNumber - Numéro de carte à valider
 * @returns {boolean} Vrai si le numéro est valide
 */
export const validateCreditCard = (cardNumber) => {
  if (!cardNumber) return false;
  
  // Supprime les espaces et les tirets
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Vérifie que ce sont que des chiffres et une longueur valide (13-19 chiffres)
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  // Algorithme de Luhn
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

export default {
  validatePhoneNumber,
  validateEmail,
  validatePassword,
  validatePin,
  formatPhoneNumber,
  validateIdNumber,
  validatePassport,
  validateBirthDate,
  validateBookingCode,
  validateAmount,
  validatePromoCode,
  validateCreditCard,
};
