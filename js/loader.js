// ==========================================================================
// Advanced Loader System
// ==========================================================================

export class LoaderManager {
    constructor() {
        this.loaderTimeouts = [];
        this.isLoading = false;
    }

    show() {
        if (this.isLoading) return;
        this.isLoading = true;

        const steps = [
            { text: "INITIATING SECURE CONNECTION...", duration: 600, progress: 15 },
            { text: "AUTHENTICATING ACCESS CREDENTIALS...", duration: 800, progress: 35 },
            { text: "ACCESSING ENCRYPTED DATABASE...", duration: 900, progress: 55 },
            { text: "FETCHING MEMBER RECORDS...", duration: 700, progress: 75 },
            { text: "PARSING DATA PACKETS...", duration: 500, progress: 90 },
            { text: "RENDERING EVALUATION VISUALS...", duration: 400, progress: 100 }
        ];

        // Clear any existing timeouts
        this.clear();

        let totalDuration = 0;
        const progressBar = document.querySelector('.progress-bar-inner');
        const loaderText = document.getElementById('loader-text');
        const progressPercentage = document.getElementById('progress-percentage');

        // Add percentage display if it doesn't exist
        if (!progressPercentage && progressBar) {
            const percentageEl = document.createElement('div');
            percentageEl.id = 'progress-percentage';
            percentageEl.className = 'progress-percentage';
            percentageEl.textContent = '0%';
            progressBar.parentNode.appendChild(percentageEl);
        }

        steps.forEach((step, index) => {
            const timeout = setTimeout(() => {
                if (loaderText) {
                    // Typewriter effect for loader text
                    this.typeText(loaderText, step.text);
                }
                
                if (progressBar) {
                    progressBar.style.width = `${step.progress}%`;
                    
                    // Update percentage
                    const percentEl = document.getElementById('progress-percentage');
                    if (percentEl) {
                        percentEl.textContent = `${step.progress}%`;
                    }
                }

                // Add pulse effect on final step
                if (index === steps.length - 1) {
                    setTimeout(() => {
                        if (progressBar) {
                            progressBar.classList.add('pulse-complete');
                        }
                    }, 200);
                }
            }, totalDuration);

            this.loaderTimeouts.push(timeout);
            totalDuration += step.duration;
        });

        return totalDuration;
    }

    typeText(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }

    hide() {
        this.isLoading = false;
        this.clear();
        
        // Reset progress bar
        const progressBar = document.querySelector('.progress-bar-inner');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.classList.remove('pulse-complete');
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = '0%';
        }
    }

    clear() {
        this.loaderTimeouts.forEach(timeout => clearTimeout(timeout));
        this.loaderTimeouts = [];
    }
}