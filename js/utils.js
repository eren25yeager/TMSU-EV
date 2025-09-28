// ==========================================================================
// Utility Functions
// ==========================================================================

export class Utils {
    static getTextWidth(text, font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        return context.measureText(text).width;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    static sanitizeInput(input) {
        return input.trim().replace(/[<>\"']/g, '');
    }

    static validateMemberCode(code) {
        const sanitized = this.sanitizeInput(code);
        return {
            isValid: sanitized.length >= 2 && sanitized.length <= 20,
            sanitized: sanitized
        };
    }

    static formatError(error) {
        if (error.name === 'NetworkError') {
            return 'Network connection error. Please check your internet connection.';
        }
        if (error.name === 'TimeoutError') {
            return 'Request timed out. Please try again.';
        }
        return 'An unexpected error occurred. Please try again.';
    }

    static async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
}