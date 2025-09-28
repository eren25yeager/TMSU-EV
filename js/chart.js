// ==========================================================================
// Chart Management System
// ==========================================================================

export class ChartManager {
    constructor(themeManager) {
        this.themeManager = themeManager;
        this.currentChart = null;
        this.chartContainer = null;
    }

    createOrUpdateChart(labels, data, containerId = 'radarChart') {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        this.chartContainer = ctx;
        
        // Destroy existing chart
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const colors = this.themeManager.getChartColors();
        
        this.currentChart = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Evaluation Metrics',
                    data: data,
                    backgroundColor: colors.background,
                    borderColor: colors.borderColor,
                    borderWidth: 3,
                    pointBackgroundColor: colors.pointColor,
                    pointBorderColor: colors.borderColor,
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverBackgroundColor: colors.pointColor,
                    pointHoverBorderColor: colors.borderColor,
                    pointHoverRadius: 8,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                scales: {
                    r: {
                        angleLines: {
                            color: colors.gridColor,
                            lineWidth: 1
                        },
                        grid: {
                            color: colors.gridColor,
                            lineWidth: 1
                        },
                        pointLabels: {
                            color: colors.labelColor,
                            font: {
                                family: "'Share Tech Mono', monospace",
                                size: 13,
                                weight: '600'
                            },
                            padding: 15
                        },
                        ticks: {
                            display: false,
                            beginAtZero: true,
                            suggestedMax: 100,
                            stepSize: 20
                        },
                        min: 0,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: colors.borderColor,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `Score: ${context.parsed.r}/100`;
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 3,
                        tension: 0.3
                    },
                    point: {
                        radius: 6,
                        hoverRadius: 8
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'point'
                }
            }
        });

        // Register chart with theme manager
        this.themeManager.setCurrentChart(this.currentChart);
        
        return this.currentChart;
    }

    destroy() {
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }
    }

    updateTheme() {
        if (this.currentChart) {
            this.themeManager.updateChartTheme();
        }
    }
}