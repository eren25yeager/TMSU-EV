// ==========================================================================
// Main Application - Modular Architecture
// ==========================================================================

import { Utils } from './js/utils.js';
import { ToastManager } from './js/toast.js';
import { ThemeManager } from './js/theme.js';
import { LoaderManager } from './js/loader.js';
import { DataManager } from './js/data.js';
import { ChartManager } from './js/chart.js';
import { ParticlesManager } from './js/particles.js';
import { AccessibilityManager } from './js/accessibility.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    const toast = new ToastManager();
    const themeManager = new ThemeManager();
    const loader = new LoaderManager();
    const dataManager = new DataManager();
    const chartManager = new ChartManager(themeManager);
    const particlesManager = new ParticlesManager();
    const accessibilityManager = new AccessibilityManager();

    const artisticIntro = document.getElementById('artistic-intro');
    let matrixAnimationId = null;

    // ==========================================================================
    // 1. ARTISTIC INTRO ANIMATION - Enhanced
    // ==========================================================================
    function runArtisticIntro() {
        if (!artisticIntro) {
            initializeApp();
            return;
        }

        const canvas = document.getElementById('matrix-canvas');
        const ctx = canvas.getContext('2d');
        const introTitle = document.getElementById('intro-title');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Enhanced Matrix effect settings
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}تحيا مصر';
        const fontSize = 16;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);
        const mainColor = '#ff073a';
        const fadeColors = ['#ff073a', '#ff4757', '#ff6b7a', '#ff8fa3'];

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                
                // Enhanced color effect
                const colorIndex = Math.floor(Math.random() * fadeColors.length);
                ctx.fillStyle = fadeColors[colorIndex];
                
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        function animate() {
            drawMatrix();
            matrixAnimationId = requestAnimationFrame(animate);
        }

        const resizeHandler = Utils.debounce(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const newColumns = Math.floor(canvas.width / fontSize);
            drops.length = newColumns;
            for(let i = 0; i < newColumns; i++) {
                if (drops[i] === undefined) drops[i] = 1;
            }
        }, 250);

        window.addEventListener('resize', resizeHandler);
        
        animate();

        const loginScreen = document.getElementById('login-screen');
        loginScreen.style.opacity = '0';
        loginScreen.classList.remove('active');

        // Enhanced intro sequence
        setTimeout(() => {
            introTitle.style.opacity = '1';
            accessibilityManager.announceToScreenReader('TMSU Evaluation System Loading');
        }, 3000);

        setTimeout(() => {
            artisticIntro.style.opacity = '0';
            
            setTimeout(() => {
                if (matrixAnimationId) {
                    cancelAnimationFrame(matrixAnimationId);
                    matrixAnimationId = null;
                }
                window.removeEventListener('resize', resizeHandler);
                artisticIntro.style.display = 'none';
                loginScreen.classList.add('active');
                loginScreen.style.opacity = '1';
                initializeApp();
                
                gsap.from(".login-container > *", { 
                    duration: 0.8, 
                    y: 40, 
                    opacity: 0, 
                    stagger: 0.12, 
                    ease: "power3.out" 
                });
                
                accessibilityManager.updatePageTitle('TMSU Evaluation - Login');
            }, 1500);
        }, 7000);
    }

    // ==========================================================================
    // 2. MAIN APP INITIALIZATION - Enhanced
    // ==========================================================================
    function initializeApp() {
        // Initialize particles with performance optimization
        particlesManager.init();
        
        // Listen for theme changes to update particles
        document.addEventListener('themeChanged', (e) => {
            particlesManager.updateTheme(e.detail.isLight);
        });

        // Enhanced typing effect
        typeEffect(document.getElementById('animated-title'), "TMSU Evaluation", 80);

        // Setup search functionality
        setupSearchFunctionality();
        
        // Setup input enhancements
        setupInputEnhancements();
        
        // Setup modal functionality
        setupModalFunctionality();
        
        // Setup performance monitoring
        setupPerformanceMonitoring();
    }

    function setupSearchFunctionality() {
        const memberCodeInput = document.getElementById('memberCodeInput');
        const analyzeButton = document.getElementById('analyze-button');
        
        if (analyzeButton) {
            analyzeButton.addEventListener('click', handleSearch);
        }
        
        if (memberCodeInput) {
            memberCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                }
            });
            
            // Enhanced input validation
            memberCodeInput.addEventListener('input', Utils.debounce((e) => {
                const validation = Utils.validateMemberCode(e.target.value);
                e.target.classList.toggle('invalid', !validation.isValid && e.target.value.length > 0);
            }, 300));
        }
    }

    function setupInputEnhancements() {
        const memberCodeInput = document.getElementById('memberCodeInput');
        const inputWrapper = document.querySelector('.input-wrapper');
        const caret = document.getElementById('input-caret');
        
        if (inputWrapper && caret && memberCodeInput) {
            const updateCaretPosition = Utils.debounce(() => {
                const inputStyle = window.getComputedStyle(memberCodeInput);
                const font = `${inputStyle.fontSize} ${inputStyle.fontFamily}`;
                const textWidth = Utils.getTextWidth(memberCodeInput.value, font);
                const newLeft = (memberCodeInput.offsetWidth / 2) + (textWidth / 2) + 2;
                caret.style.left = `${newLeft}px`;
            }, 50);

            memberCodeInput.addEventListener('focus', () => {
                inputWrapper.classList.add('focused');
                updateCaretPosition();
            });
            
            memberCodeInput.addEventListener('blur', () => {
                inputWrapper.classList.remove('focused');
            });
            
            memberCodeInput.addEventListener('input', updateCaretPosition);
            updateCaretPosition();
        }
    }

    function setupModalFunctionality() {
        const imageModal = document.getElementById('image-modal');
        const closeModalBtn = document.querySelector('.close-modal-btn');
        
        if (imageModal && closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                imageModal.classList.remove('show');
                accessibilityManager.announceToScreenReader('Image modal closed');
            });
            
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    imageModal.classList.remove('show');
                    accessibilityManager.announceToScreenReader('Image modal closed');
                }
            });
        }
    }

    function setupPerformanceMonitoring() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('High memory usage detected');
                    // Clear data cache if needed
                    dataManager.clearCache();
                }
            }, 30000); // Check every 30 seconds
        }
        
        // Monitor performance
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 100) {
                    console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                }
            }
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
    }

    // ==========================================================================
    // 3. ENHANCED HELPER FUNCTIONS
    // ==========================================================================
    function switchScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const activeScreen = document.getElementById(`${screenName}-screen`);
        if (activeScreen) {
            activeScreen.classList.add('active');
            accessibilityManager.updatePageTitle(`TMSU Evaluation - ${screenName.charAt(0).toUpperCase() + screenName.slice(1)}`);
        }
    }

    function typeEffect(element, text, speed = 80) {
        if (!element) return;
        
        let i = 0;
        element.innerHTML = "";
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i++);
                setTimeout(type, speed + Math.random() * 40); // Variable speed for more natural effect
            }
        }
        type();
    }

    async function handleSearch() {
        const memberCodeInput = document.getElementById('memberCodeInput');
        const memberCode = memberCodeInput.value.trim();
        
        const validation = Utils.validateMemberCode(memberCode);
        if (!validation.isValid) {
            memberCodeInput.style.animation = 'shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
            setTimeout(() => memberCodeInput.style.animation = '', 600);
            toast.show("Please enter a valid member code (2-20 characters)", 'warning');
            accessibilityManager.announceToScreenReader('Invalid member code entered');
            return;
        }

        switchScreen('loader');
        accessibilityManager.announceToScreenReader('Searching for member data');
        
        const loaderDuration = loader.show();

        setTimeout(() => {
            searchMemberData(validation.sanitized);
        }, loaderDuration);
    }

    async function searchMemberData(memberCode) {
        try {
            const memberData = await dataManager.fetchMemberData(memberCode);
            loader.hide();
            displayResults(memberData);
            toast.show("Member data loaded successfully!", 'success');
            accessibilityManager.announceToScreenReader('Member evaluation data loaded successfully');
        } catch (error) {
            loader.hide();
            const errorMessage = Utils.formatError(error);
            toast.show(errorMessage, 'error');
            switchScreen('login');
            accessibilityManager.announceToScreenReader(`Error: ${errorMessage}`);
        }
    }

    async function generateAndDownloadPDF(memberName) {
        const downloadBtn = document.getElementById('download-pdf-button');
        const resultsContainer = document.getElementById('results-screen');
        const allOtherElements = document.querySelectorAll('body > *:not(#results-screen)');
        const actionButtons = resultsContainer.querySelector('.results-actions');
        const socialLinks = resultsContainer.querySelector('.social-links');
        
        downloadBtn.textContent = 'GENERATING...';
        downloadBtn.disabled = true;
        toast.show('Generating PDF report...', 'info');
        
        if (actionButtons) actionButtons.style.display = 'none';
        if (socialLinks) socialLinks.style.display = 'none';
        allOtherElements.forEach(el => el.style.display = 'none');
        
        resultsContainer.style.top = '0';
        resultsContainer.style.left = '0';
        resultsContainer.style.position = 'absolute';
        window.scrollTo(0, 0);
        
        try {
            const canvas = await html2canvas(resultsContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: document.body.classList.contains('light-mode') ? '#f4f4f9' : '#0d0d0d',
                width: resultsContainer.scrollWidth,
                height: resultsContainer.scrollHeight,
                windowWidth: resultsContainer.scrollWidth,
                windowHeight: resultsContainer.scrollHeight,
                logging: false
            });
            
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const fileName = `Evaluation-Report-${memberName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            pdf.save(fileName);
            
            toast.show('PDF report generated successfully!', 'success');
            accessibilityManager.announceToScreenReader('PDF report downloaded successfully');
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.show("Sorry, there was an error creating the PDF file.", 'error');
            accessibilityManager.announceToScreenReader('PDF generation failed');
        } finally {
            allOtherElements.forEach(el => el.style.display = '');
            resultsContainer.style.position = '';
            resultsContainer.style.top = '';
            resultsContainer.style.left = '';
            if (actionButtons) actionButtons.style.display = '';
            if (socialLinks) socialLinks.style.display = '';
            downloadBtn.textContent = 'DOWNLOAD PDF';
            downloadBtn.disabled = false;
        }
    }

    function displayResults(data) {
        switchScreen('results');
        
        const photoUrl = dataManager.processPhotoUrl(data['Photo URL']);
        const fallbackImage = 'images/default-avatar.png';
        const photoHTML = `<img src="${photoUrl}" class="member-photo" alt="Profile photo of ${data.Name || 'Member'}" crossorigin="anonymous" onerror="this.onerror=null;this.src='${fallbackImage}';" loading="lazy">`;
        
        const memberHeaderHTML = `<div class="member-header">${photoHTML}<div class="member-info"><h2>${data.Name || 'Unknown Member'}</h2><p>${data.Committee || 'N/A'}</p></div></div>`;
        
        const performanceKeys = ['Quality of the task', 'Quantity of the task', 'Attendence', 'Communication'];
        const softSkillsKeys = ['Flexibility', 'Teamwork', 'Technical Knowledge', 'Bonus'];
        
        const createListHTML = (keys) => keys.map(key => {
            const value = parseInt(data[key] || 0);
            const displayKey = key.replace(/ of the task/g, '');
            return `<li><span>${displayKey}</span> <span class="value" data-value="${value}">${value}</span></li>`;
        }).join('');
        
        const performanceListHTML = createListHTML(performanceKeys);
        const softSkillsListHTML = createListHTML(softSkillsKeys);
        
        const memberStatus = data.Status || 'N/A';
        const statusClass = `status-${memberStatus.toLowerCase()}`;
        
        const indicatorsData = {
            'Freezing': { dbKey: 'Freezing', icon: 'fa-snowflake', class: 'indicator-freezing' },
            'Attention': { dbKey: 'Attention', icon: 'fa-triangle-exclamation', class: 'indicator-attention' },
            'Alarm': { dbKey: 'Alarm', icon: 'fa-bell', class: 'indicator-alarm' }
        };
        
        const indicatorsHTML = Object.keys(indicatorsData).map(key => {
            const item = indicatorsData[key];
            const value = parseInt(data[item.dbKey] || 0);
            const isActive = value > 0;
            return `<div class="indicator-item ${isActive ? 'active ' + item.class : ''}" role="status" aria-label="${key}: ${value}">
                <i class="fas ${item.icon}" aria-hidden="true"></i>
                <span class="indicator-label">${key}</span>
                <span class="indicator-value">${value}</span>
            </div>`;
        }).join('');
        
        const percentage = parseInt(data['%'] || 0);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const colors = themeManager.getChartColors();
        const percentageHTML = `<div class="progress-ring" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="Overall percentage: ${percentage}%">
            <svg width="100" height="100">
                <circle class="progress-ring__circle" stroke="${colors.borderColor}" stroke-width="6" fill="transparent" r="${radius}" cx="50" cy="50" style="stroke-dasharray: ${circumference} ${circumference}; stroke-dashoffset: ${offset}; transition: stroke-dashoffset 1.5s ease-out;"/>
            </svg>
            <span class="progress-ring__text">${percentage}%</span>
        </div>`;

        // Enhanced results HTML with better accessibility
        document.getElementById('results-screen').innerHTML = `
            ${memberHeaderHTML}
            <div class="results-grid">
                <div class="result-card">
                    <div class="title">Final Grade</div>
                    <div class="total-score-display" role="status" aria-label="Final grade: ${data.Appreciation || 'N/A'}">${data.Appreciation || 'N/A'}</div>
                </div>
                <div class="result-card percentage-card">
                    <div class="title">Percentage</div>
                    ${percentageHTML}
                </div>
                <div class="result-card">
                    <div class="title">Total Score</div>
                    <div class="total-score-display" role="status" aria-label="Total score: ${data.Total || '0'}">${data.Total || '0'}</div>
                </div>
                <div class="result-card status-card">
                    <div class="member-status-display">
                        <div class="title">Member Status</div>
                        <div class="status-text ${statusClass}" role="status" aria-label="Member status: ${memberStatus}">${memberStatus}</div>
                    </div>
                    <div class="status-indicators" role="group" aria-label="Status indicators">
                        ${indicatorsHTML}
                    </div>
                </div>
                <div class="details-container">
                    <details class="collapsible-list" open>
                        <summary>Performance Metrics</summary>
                        <ul role="list">${performanceListHTML}</ul>
                    </details>
                    <details class="collapsible-list" open>
                        <summary>Soft & Technical Skills</summary>
                        <ul role="list">${softSkillsListHTML}</ul>
                    </details>
                </div>
                <div class="result-card main-chart-container">
                    <canvas id="radarChart" role="img" aria-label="Radar chart showing evaluation metrics"></canvas>
                </div>
                <div class="result-card comment-card">
                    <div class="title">Analyst's Comment</div>
                    <p>${data.Comment || 'No comments recorded.'}</p>
                </div>
            </div>
            <div class="results-actions">
                <button id="new-search-button" class="cybr-btn" aria-label="Start a new search">NEW SEARCH</button>
                <button id="download-pdf-button" class="cybr-btn" aria-label="Download evaluation report as PDF">DOWNLOAD PDF</button>
                <a href="https://forms.gle/WQxsNjX2XX8PNa9w8" target="_blank" rel="noopener" class="complaint-button" aria-label="File a complaint (opens in new tab)">File a Complaint</a>
            </div>
            <div class="social-links results-social" role="navigation" aria-label="Social media links">
                <a href="https://www.facebook.com/Students.union.long.live.eg/" target="_blank" rel="noopener" aria-label="Facebook (opens in new tab)"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
                <a href="https://forms.tahyamisrsu.com/" target="_blank" rel="noopener" aria-label="Event Registration (opens in new tab)"><i class="fas fa-file-signature" aria-hidden="true"></i></a>
                <a href="https://eg.linkedin.com/company/students-union.long.live.eg" target="_blank" rel="noopener" aria-label="LinkedIn (opens in new tab)"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>
                <a href="https://x.com/sulongliveeg?lang=ar" target="_blank" rel="noopener" aria-label="X Platform (opens in new tab)"><i class="fab fa-xing" aria-hidden="true"></i></a>
                <a href="https://www.instagram.com/sulongliveeg/" target="_blank" rel="noopener" aria-label="Instagram (opens in new tab)"><i class="fab fa-instagram" aria-hidden="true"></i></a>
            </div>
        `;

        // Create enhanced chart
        const allKeys = [...performanceKeys, ...softSkillsKeys];
        const allData = allKeys.map(key => parseInt(data[key] || 0));
        const chartLabels = allKeys.map(k => k.replace(/ of the task/g, ''));
        
        chartManager.createOrUpdateChart(chartLabels, allData);

        // Enhanced event listeners
        const downloadBtn = document.getElementById('download-pdf-button');
        const newSearchBtn = document.getElementById('new-search-button');
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => generateAndDownloadPDF(data.Name || 'Member'));
        }
        
        if (newSearchBtn) {
            newSearchBtn.addEventListener('click', () => {
                chartManager.destroy();
                
                gsap.to("#results-screen > *", {
                    duration: 0.6,
                    y: -50,
                    opacity: 0,
                    stagger: 0.06,
                    ease: "power2.in",
                    onComplete: () => {
                        switchScreen('login');
                        document.getElementById('memberCodeInput').value = '';
                        gsap.from(".login-container > *", {
                            duration: 0.8,
                            y: 40,
                            opacity: 0,
                            stagger: 0.12,
                            ease: "power3.out"
                        });
                        accessibilityManager.announceToScreenReader('Returned to search screen');
                    }
                });
            });
        }

        // Enhanced photo modal functionality
        const memberPhoto = document.querySelector('.member-photo');
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        
        if (memberPhoto && imageModal && modalImage) {
            memberPhoto.addEventListener('click', () => {
                imageModal.classList.add('show');
                modalImage.src = memberPhoto.src;
                modalImage.alt = `Full size profile photo of ${data.Name || 'Member'}`;
                accessibilityManager.announceToScreenReader('Profile photo opened in modal');
            });
        }

        // Enhanced entrance animation
        gsap.from("#results-screen > *", {
            duration: 1,
            y: 60,
            opacity: 0,
            stagger: 0.1,
            ease: "power3.out"
        });

        // Animate progress ring
        setTimeout(() => {
            const progressCircle = document.querySelector('.progress-ring__circle');
            if (progressCircle) {
                progressCircle.style.strokeDashoffset = offset;
            }
        }, 500);

        // Animate value counters
        setTimeout(() => {
            const valueElements = document.querySelectorAll('.value[data-value]');
            valueElements.forEach(el => {
                const finalValue = parseInt(el.dataset.value);
                let currentValue = 0;
                const increment = finalValue / 30;
                
                const counter = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        el.textContent = finalValue;
                        clearInterval(counter);
                    } else {
                        el.textContent = Math.floor(currentValue);
                    }
                }, 50);
            });
        }, 800);
    }

    // ==========================================================================
    // 4. APP START
    // ==========================================================================
    runArtisticIntro();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (matrixAnimationId) {
            cancelAnimationFrame(matrixAnimationId);
        }
        particlesManager.destroy();
        chartManager.destroy();
        loader.clear();
        toast.clear();
    });
});