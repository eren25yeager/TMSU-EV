// ==========================================================================
// Theme Management System
// ==========================================================================

export class ThemeManager {
    constructor() {
        this.body = document.body;
        this.themeToggleButton = document.getElementById('theme-toggle-button');
        this.currentChart = null;
        this.init();
    }

    init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') === 'light';
        this.applyTheme(savedTheme);

        // Add event listener
        if (this.themeToggleButton) {
            this.themeToggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Add keyboard shortcut (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        const isCurrentlyLight = this.body.classList.contains('light-mode');
        this.applyTheme(!isCurrentlyLight);
    }

    applyTheme(isLight) {
        // Add transition class for smooth theme change
        this.body.classList.add('theme-transitioning');
        
        // Apply theme
        this.body.classList.toggle('light-mode', isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        // Update chart if exists
        if (this.currentChart) {
            this.updateChartTheme();
        }

        // Remove transition class after animation
        setTimeout(() => {
            this.body.classList.remove('theme-transitioning');
        }, 400);

        // Trigger custom event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { isLight }
        }));
    }

    setCurrentChart(chart) {
        this.currentChart = chart;
    }

    getChartColors() {
        const isLightMode = this.body.classList.contains('light-mode');
        return {
            gridColor: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            labelColor: isLightMode ? '#333333' : '#e0e0e0',
            borderColor: isLightMode ? 'rgba(211, 47, 47, 1)' : 'rgba(255, 7, 58, 1)',
            pointColor: '#ffffff',
            background: isLightMode ? 'rgba(211, 47, 47, 0.08)' : 'rgba(255, 7, 58, 0.12)'
        };
    }

    updateChartTheme() {
        if (!this.currentChart) return;
        
        const colors = this.getChartColors();
        this.currentChart.options.scales.r.angleLines.color = colors.gridColor;
        this.currentChart.options.scales.r.grid.color = colors.gridColor;
        this.currentChart.options.scales.r.pointLabels.color = colors.labelColor;
        this.currentChart.data.datasets[0].backgroundColor = colors.background;
        this.currentChart.data.datasets[0].borderColor = colors.borderColor;
        this.currentChart.update('none'); // No animation for theme change
    }
}