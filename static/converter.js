/**
 * KPWorks Converter Wrapper
 * Separates UI logic from the original Sanka conversion engine (`kn.js`).
 */

const KPConverter = {
    /**
     * Converts text based on the selected mode.
     * @param {string} input - The text to convert.
     * @param {string} mode - 'a2u' (ASCII to Unicode) or 'u2a' (Unicode to ASCII).
     * @param {boolean} englishNumbers - Whether to retain English numbers.
     * @param {boolean} removeExtraSpaces - Whether to trim extra spaces.
     * @returns {string} The converted text.
     */
    convert: function(input, mode, englishNumbers = false, removeExtraSpaces = false) {
        if (!input || input.trim() === '') {
            return '';
        }

        if (mode === 'a2u') {
            return kn.ascii_to_unicode(input, englishNumbers, removeExtraSpaces);
        } else if (mode === 'u2a') {
            return kn.unicode_to_ascii(input, englishNumbers, removeExtraSpaces);
        }
        
        return input;
    }
};
