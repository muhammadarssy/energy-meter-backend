/**
 * Luhn algorithm for PLN meter code check digit
 */
class ChecksumCalculator {
    /**
     * Calculate check code (last digit) for a numeric string.
     * @param {string} code - numeric string WITHOUT check digit
     * @returns {string} - single check digit
     */
    static calculateCheckCode(code) {
        const digits = code.split('').map(Number);
        let sum = 0;
        let isSecond = false;

        // Process right to left
        for (let i = digits.length - 1; i >= 0; i--) {
            let d = digits[i];
            if (isSecond) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            isSecond = !isSecond;
        }

        return String((10 - (sum % 10)) % 10);
    }

    /**
     * Validate a full code (last digit is check digit).
     * @param {string} fullCode - numeric string including check digit
     * @returns {boolean}
     */
    static validateCheckCode(fullCode) {
        if (!fullCode || fullCode.length < 2) return false;
        const codeWithoutCheck = fullCode.slice(0, -1);
        const expected = ChecksumCalculator.calculateCheckCode(codeWithoutCheck);
        return fullCode.slice(-1) === expected;
    }
}

module.exports = ChecksumCalculator;
