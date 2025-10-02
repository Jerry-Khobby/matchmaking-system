import countries from 'i18n-iso-countries';

// Register languages (optional, only needed if you want to get names in multiple locales)
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/fr.json'));

export const isValidCountryCode = (code: string): boolean => {
  if (!code) return false;

  const alpha2Codes = Object.keys(countries.getAlpha2Codes()); // e.g. "GH", "NA", "US"
  const alpha3Codes = Object.keys(countries.getAlpha3Codes()); // e.g. "GHA", "NAM", "USA"

  const upper = code.toUpperCase();
  return alpha2Codes.includes(upper) || alpha3Codes.includes(upper);
};
