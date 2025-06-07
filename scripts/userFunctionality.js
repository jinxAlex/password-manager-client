/**
 * @file userFunctionality.js
 * @description Funciones utilitarias relacionadas con el manejo de usuarios en BlackVault.
 * @module userFunctionality
 */

/**
 * Capitaliza la primera letra de una cadena.
 * @memberof module:userFunctionality
 * @param {string} str - Cadena de texto a capitalizar.
 * @returns {string} Cadena con la primera letra en mayúscula.
 */
export function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}