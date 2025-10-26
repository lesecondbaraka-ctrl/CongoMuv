import { format, parseISO, isBefore, isAfter, addDays, differenceInMinutes, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date selon le format spécifié
 * @param {Date|string} date - La date à formater
 * @param {string} formatStr - Le format de sortie (par défaut: 'dd/MM/yyyy HH:mm')
 * @returns {string} La date formatée
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy HH:mm') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
};

/**
 * Calcule la durée entre deux dates en minutes
 * @param {Date|string} start - Date de début
 * @param {Date|string} end - Date de fin
 * @returns {number} Durée en minutes
 */
export const calculateDuration = (start, end) => {
  if (!start || !end) return 0;
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  return differenceInMinutes(endDate, startDate);
};

/**
 * Formate une durée en minutes en format lisible (ex: "2h 30m")
 * @param {number} minutes - Durée en minutes
 * @returns {string} Durée formatée
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
};

/**
 * Formate un montant avec la devise
 * @param {number} amount - Montant à formater
 * @param {string} currency - Code de la devise (par défaut: 'CDF')
 * @returns {string} Montant formaté avec la devise
 */
export const formatCurrency = (amount, currency = 'CDF') => {
  if (amount === null || amount === undefined) return '';
  
  const formatter = new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: 'narrowSymbol',
  });
  
  return formatter.format(amount).replace(currency, '').trim() + ' ' + currency;
};

/**
 * Vérifie si une date est dans le futur
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} Vrai si la date est dans le futur
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isAfter(dateObj, new Date());
};

/**
 * Vérifie si une date est dans le passé
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} Vrai si la date est dans le passé
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isBefore(dateObj, new Date());
};

/**
 * Génère un identifiant unique
 * @param {number} length - Longueur de l'identifiant (par défaut: 8)
 * @returns {string} Identifiant unique
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};

/**
 * Valide une adresse email
 * @param {string} email - Adresse email à valider
 * @returns {boolean} Vrai si l'email est valide
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Valide un numéro de téléphone
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} Vrai si le numéro est valide
 */
export const isValidPhone = (phone) => {
  // Format international: +243 81 234 5678
  const re = /^\+?[0-9\s-]{10,15}$/;
  return re.test(phone);
};

/**
 * Tronque un texte à une longueur maximale
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale (par défaut: 100)
 * @param {string} ellipsis - Caractères d'ellipse (par défaut: '...')
 * @returns {string} Texte tronqué
 */
export const truncate = (text, maxLength = 100, ellipsis = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + ellipsis;
};

/**
 * Met en majuscule la première lettre d'une chaîne
 * @param {string} str - Chaîne à formater
 * @returns {string} Chaîne formatée
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formate un nom propre (première lettre de chaque mot en majuscule)
 * @param {string} str - Chaîne à formater
 * @returns {string} Chaîne formatée
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
 * Génère un code de réservation aléatoire
 * @param {string} prefix - Préfixe optionnel pour le code
 * @returns {string} Code de réservation
 */
export const generateBookingCode = (prefix = '') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = prefix || '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calcule le montant total d'une réservation
 * @param {Array} passengers - Liste des passagers
 * @param {number} basePrice - Prix de base par passager
 * @param {Object} discounts - Réductions applicables
 * @returns {Object} { total, subtotal, discountAmount, taxAmount }
 */
export const calculateBookingTotal = (passengers = [], basePrice = 0, discounts = {}) => {
  const subtotal = passengers.length * basePrice;
  let discountAmount = 0;
  
  // Appliquer les réductions
  if (discounts.percentage) {
    discountAmount += subtotal * (discounts.percentage / 100);
  }
  if (discounts.fixed) {
    discountAmount += discounts.fixed;
  }
  
  // Calculer le montant après réduction
  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  // Calculer les taxes (18% par défaut)
  const taxRate = 0.18;
  const taxAmount = amountAfterDiscount * taxRate;
  
  // Calculer le total
  const total = amountAfterDiscount + taxAmount;
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    total: Math.round(total),
    currency: 'CDF',
  };
};

/**
 * Vérifie si un objet est vide
 * @param {Object} obj - Objet à vérifier
 * @returns {boolean} Vrai si l'objet est vide
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Retourne une valeur par défaut si la valeur est nulle ou indéfinie
 * @param {*} value - Valeur à vérifier
 * @param {*} defaultValue - Valeur par défaut
 * @returns {*} La valeur ou la valeur par défaut
 */
export const defaultTo = (value, defaultValue) => {
  return value !== null && value !== undefined ? value : defaultValue;
};

/**
 * Convertit un objet en chaîne de requête URL
 * @param {Object} params - Paramètres à convertir
 * @returns {string} Chaîne de requête formatée
 */
export const toQueryString = (params) => {
  return Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
};

/**
 * Convertit une chaîne de requête en objet
 * @param {string} queryString - Chaîne de requête à convertir
 * @returns {Object} Objet contenant les paramètres
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    // Gère les tableaux (paramètres avec le même nom)
    if (key in result) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

export default {
  formatDate,
  calculateDuration,
  formatDuration,
  formatCurrency,
  isFutureDate,
  isPastDate,
  generateId,
  isValidEmail,
  isValidPhone,
  truncate,
  capitalize,
  toTitleCase,
  formatPhoneNumber,
  generateBookingCode,
  calculateBookingTotal,
  isEmpty,
  defaultTo,
  toQueryString,
  parseQueryString,
};
