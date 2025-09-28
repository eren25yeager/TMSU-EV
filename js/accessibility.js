// ==========================================================================
// Accessibility Enhancement System
// ==========================================================================

export class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupReducedMotion();
    }

    setupKeyboardNavigation() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case 'Escape':
                    this.handleEscape();
                    break;
                case 'Enter':
                    if (e.target.classList.contains('cybr-btn')) {
                        e.target.click();
                    }
                    break;
                case '/':
                    e.preventDefault();
                    this.focusSearchInput();
                    break;
            }
        });

        // Tab navigation enhancement
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupScreenReaderSupport() {
        // Add ARIA labels and descriptions
        const searchInput = document.getElementById('memberCodeInput');
        if (searchInput) {
            searchInput.setAttribute('aria-label', 'Enter member code for evaluation lookup');
            searchInput.setAttribute('aria-describedby', 'search-instructions');
            
            // Add instructions element
            const instructions = document.createElement('div');
            instructions.id = 'search-instructions';
            instructions.className = 'sr-only';
            instructions.textContent = 'Enter your member code and press Enter or click Analyze to view your evaluation results';
            searchInput.parentNode.appendChild(instructions);
        }

        // Add live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
    }

    setupFocusManagement() {
        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            const modal = document.querySelector('.image-modal.show');
            if (modal && e.key === 'Tab') {
                this.trapFocus(e, modal);
            }
        });
    }

    setupReducedMotion() {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            document.body.classList.toggle('reduced-motion', e.matches);
        });
    }

    handleEscape() {
        // Close modals
        const modal = document.querySelector('.image-modal.show');
        if (modal) {
            modal.classList.remove('show');
            return;
        }

        // Return to search if on results screen
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen && resultsScreen.classList.contains('active')) {
            const newSearchBtn = document.getElementById('new-search-button');
            if (newSearchBtn) {
                newSearchBtn.click();
            }
        }
    }

    focusSearchInput() {
        const searchInput = document.getElementById('memberCodeInput');
        if (searchInput && searchInput.offsetParent !== null) {
            searchInput.focus();
        }
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    updatePageTitle(title) {
        document.title = title;
    }
}