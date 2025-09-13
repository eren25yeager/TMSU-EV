document.addEventListener('DOMContentLoaded', () => {

    // --- Global Variables & Elements ---
    const artisticIntro = document.getElementById('artistic-intro');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRiyP0D5X-WL8IPT4UMNgO5QFYruJIPaKpHLGD8Wl1PdUcJcefMMOzERSSKyT54AENHkpMdwaOzD3Ik/pub?output=csv';
    const body = document.body;
    let loaderTimeouts = [];
    let currentChart = null;
    let toastTimeout = null;

    // ==========================================================================
    // --- 1. ARTISTIC INTRO ANIMATION
    // ==========================================================================
    function runArtisticIntro() {
        if (!artisticIntro) {
            initializeApp(); // Fallback if intro element is missing
            return;
        }

        const canvas = document.getElementById('constellation-canvas');
        const ctx = canvas.getContext('2d');
        const introTitle = document.getElementById('intro-title');
        let particles = [];
        let animationFrameId;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = Math.random() * 0.4 - 0.2;
                this.vy = Math.random() * 0.4 - 0.2;
                this.radius = Math.random() * 1.5 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 7, 58, 0.8)';
                ctx.fill();
            }
        }

        function init() {
            const particleCount = window.innerWidth < 768 ? 60 : 120;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function connect() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 7, 58, ${1 - distance / 150})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connect();
            animationFrameId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            init();
        });
        
        init();
        animate();

        const loginScreen = document.getElementById('login-screen');
        loginScreen.style.opacity = '0';
        loginScreen.classList.remove('active');

        setTimeout(() => {
            introTitle.style.opacity = '1';
        }, 3000);

        setTimeout(() => {
            artisticIntro.style.opacity = '0';
            setTimeout(() => {
                cancelAnimationFrame(animationFrameId);
                artisticIntro.style.display = 'none';
                loginScreen.classList.add('active');
                loginScreen.style.opacity = '1';
                initializeApp();
                gsap.from(".login-container > *", { duration: 0.7, y: 30, opacity: 0, stagger: 0.1, ease: "power3.out" });
            }, 1500);
        }, 7000);
    }

    // ==========================================================================
    // --- 2. MAIN APP LOGIC
    // ==========================================================================
    function initializeApp() {
        particlesJS("particles-js", {
            "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#ff073a" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": false, "anim": { "enable": false } }, "size": { "value": 3, "random": true, "anim": { "enable": false } }, "line_linked": { "enable": true, "distance": 150, "color": "#ff073a", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 4, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false } },
            "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } } },
            "retina_detect": true
        });

        const themeToggleButton = document.getElementById('theme-toggle-button');
        function applyTheme(isLight) {
            body.classList.toggle('light-mode', isLight);
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (currentChart) updateChartTheme();
        }
        const savedTheme = localStorage.getItem('theme') === 'light';
        applyTheme(savedTheme);
        themeToggleButton.addEventListener('click', () => applyTheme(!body.classList.contains('light-mode')));

        typeEffect(document.getElementById('animated-title'), "TSMU Evaluation");

        const memberCodeInput = document.getElementById('memberCodeInput');
        document.getElementById('analyze-button').addEventListener('click', handleSearch);
        memberCodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });

        const inputWrapper = document.querySelector('.input-wrapper');
        const caret = document.getElementById('input-caret');
        if (inputWrapper && caret) {
            const updateCaretPosition = () => {
                const inputStyle = window.getComputedStyle(memberCodeInput);
                const font = `${inputStyle.fontSize} ${inputStyle.fontFamily}`;
                const textWidth = getTextWidth(memberCodeInput.value, font);
                const newLeft = (memberCodeInput.offsetWidth / 2) + (textWidth / 2) + 2;
                caret.style.left = `${newLeft}px`;
            };
            memberCodeInput.addEventListener('focus', () => { inputWrapper.classList.add('focused'); updateCaretPosition(); });
            memberCodeInput.addEventListener('blur', () => inputWrapper.classList.remove('focused'));
            memberCodeInput.addEventListener('input', updateCaretPosition);
            updateCaretPosition();
        }
        
        const imageModal = document.getElementById('image-modal');
        const closeModalBtn = document.querySelector('.close-modal-btn');
        if (imageModal && closeModalBtn) {
            closeModalBtn.addEventListener('click', () => imageModal.classList.remove('show'));
            imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.classList.remove('show'); });
        }
    }
    
    // --- HELPER FUNCTIONS FOR THE MAIN APP ---
    
    function getTextWidth(text, font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        return context.measureText(text).width;
    }
    
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 4000);
    }

    function switchScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const activeScreen = document.getElementById(`${screenName}-screen`);
        if (activeScreen) activeScreen.classList.add('active');
    }

    function typeEffect(element, text, speed = 100) {
        if (!element) return;
        let i = 0;
        element.innerHTML = "";
        function type() { if (i < text.length) { element.innerHTML += text.charAt(i++); setTimeout(type, speed); } }
        type();
    }
    
    function runLoader() {
        switchScreen('loader');
        const steps = [ { text: "INITIATING CONNECTION...", duration: 500, progress: 10 }, { text: "ACCESSING DATABASE...", duration: 700, progress: 30 }, { text: "FETCHING RECORDS...", duration: 800, progress: 60 }, { text: "PARSING DATA PACKETS...", duration: 600, progress: 90 }, { text: "RENDERING VISUALS...", duration: 400, progress: 100 } ];
        loaderTimeouts.forEach(t => clearTimeout(t));
        loaderTimeouts = [];
        let totalDuration = 0;
        const progressBar = document.querySelector('.progress-bar-inner');
        const loaderText = document.getElementById('loader-text');
        steps.forEach(step => {
            const t = setTimeout(() => {
                if (loaderText) loaderText.textContent = step.text;
                if (progressBar) progressBar.style.width = `${step.progress}%`;
            }, totalDuration);
            loaderTimeouts.push(t);
            totalDuration += step.duration;
        });
        return totalDuration;
    }

    function handleSearch() {
        const memberCodeInput = document.getElementById('memberCodeInput');
        const memberCode = memberCodeInput.value.trim();
        if (!memberCode) {
            memberCodeInput.style.animation = 'shake 0.5s';
            setTimeout(() => memberCodeInput.style.animation = '', 500);
            showToast("Please enter a member code.");
            return;
        }
        const loaderDuration = runLoader();
        setTimeout(() => {
            Papa.parse(csvUrl, {
                download: true, header: true, skipEmptyLines: true,
                complete: (results) => {
                    const memberData = results.data.find(row => row.Code && row.Code.trim().toLowerCase() === memberCode.toLowerCase());
                    if (memberData) { displayResults(memberData); } 
                    else { showToast("Incorrect or non-existent code. Please try again."); switchScreen('login'); }
                },
                error: (err) => { showToast("Error fetching data. Check your internet connection."); switchScreen('login'); }
            });
        }, loaderDuration);
    }

    async function generateAndDownloadPDF(memberName) {
        const downloadBtn = document.getElementById('download-pdf-button');
        const resultsContainer = document.getElementById('results-screen');
        const allOtherElements = document.querySelectorAll('body > *:not(#results-screen)');
        const actionButtons = resultsContainer.querySelector('.results-actions');
        const socialLinks = resultsContainer.querySelector('.social-links');
        downloadBtn.textContent = 'GENERATING...';
        downloadBtn.disabled = true;
        if (actionButtons) actionButtons.style.display = 'none';
        if (socialLinks) socialLinks.style.display = 'none';
        allOtherElements.forEach(el => el.style.display = 'none');
        resultsContainer.style.top = '0';
        resultsContainer.style.left = '0';
        resultsContainer.style.position = 'absolute';
        window.scrollTo(0, 0);
        try {
            const canvas = await html2canvas(resultsContainer, {
                scale: 2, useCORS: true, allowTaint: true,
                backgroundColor: body.classList.contains('light-mode') ? '#f4f4f9' : '#0d0d0d',
                width: resultsContainer.scrollWidth, height: resultsContainer.scrollHeight,
                windowWidth: resultsContainer.scrollWidth, windowHeight: resultsContainer.scrollHeight
            });
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Evaluation-Report-${memberName.replace(/ /g, '_')}.pdf`);
        } catch (err) { console.error("PDF generation failed:", err); showToast("Sorry, there was an error creating the PDF file.");
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
        let photoUrl = data['Photo URL'] || '';
        if (photoUrl.includes('drive.google.com')) {
            const fileId = new URL(photoUrl).searchParams.get('id');
            if (fileId) photoUrl = `https://lh3.googleusercontent.com/d/${fileId}=s220`;
        }
        const fallbackImage = 'images/default-avatar.png';
        const photoHTML = `<img src="${photoUrl}" class="member-photo" alt="Member Photo" crossorigin="anonymous" onerror="this.onerror=null;this.src='${fallbackImage}';">`;
        const memberHeaderHTML = `<div class="member-header">${photoHTML}<div class="member-info"><h2>${data.Name || 'Unknown Member'}</h2><p>${data.Committee || 'N/A'}</p></div></div>`;
        const performanceKeys = ['Quality of the task', 'Quantity of the task', 'Attendence', 'Communication'];
        const softSkillsKeys = ['Flexibility', 'Teamwork', 'Technical Knowledge', 'Bonus'];
        const createListHTML = (keys) => keys.map(key => `<li><span>${key.replace(/ of the task/g, '')}</span> <span class="value">${data[key] || 0}</span></li>`).join('');
        const performanceListHTML = createListHTML(performanceKeys);
        const softSkillsListHTML = createListHTML(softSkillsKeys);
        const memberStatus = data.Status || 'N/A';
        const statusClass = `status-${memberStatus.toLowerCase()}`;
        const indicatorsData = { 'Freezing': { dbKey: 'Freezing', icon: 'fa-snowflake', class: 'indicator-freezing' }, 'Attention': { dbKey: 'Attention', icon: 'fa-triangle-exclamation', class: 'indicator-attention' }, 'Alarm': { dbKey: 'Alarm', icon: 'fa-bell', class: 'indicator-alarm' } };
        const indicatorsHTML = Object.keys(indicatorsData).map(key => { const item = indicatorsData[key]; const value = parseInt(data[item.dbKey] || 0); const isActive = value > 0; return `<div class="indicator-item ${isActive ? 'active ' + item.class : ''}"><i class="fas ${item.icon}"></i><span class="indicator-label">${key}</span><span class="indicator-value">${value}</span></div>`; }).join('');
        const percentage = parseInt(data['%'] || 0);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const percentageHTML = `<div class="progress-ring"><svg width="100" height="100"><circle class="progress-ring__circle" stroke="${getChartColors().borderColor}" stroke-width="6" fill="transparent" r="${radius}" cx="50" cy="50" style="stroke-dasharray: ${circumference} ${circumference}; stroke-dashoffset: ${offset};"/></svg><span class="progress-ring__text">${percentage}%</span></div>`;
        document.getElementById('results-screen').innerHTML = `${memberHeaderHTML}<div class="results-grid"><div class="result-card"><div class="title">Final Grade</div><div class="total-score-display">${data.Appreciation || 'N/A'}</div></div><div class="result-card percentage-card"><div class="title">Percentage</div>${percentageHTML}</div><div class="result-card"><div class="title">Total Score</div><div class="total-score-display">${data.Total || '0'}</div></div><div class="result-card status-card"><div class="member-status-display"><div class="title">Member Status</div><div class="status-text ${statusClass}">${memberStatus}</div></div><div class="status-indicators">${indicatorsHTML}</div></div><div class="details-container"><details class="collapsible-list" open><summary>Performance Metrics</summary><ul>${performanceListHTML}</ul></details><details class="collapsible-list" open><summary>Soft & Technical Skills</summary><ul>${softSkillsListHTML}</ul></details></div><div class="result-card main-chart-container"><canvas id="radarChart"></canvas></div><div class="result-card comment-card"><div class="title">Analyst's Comment</div><p>${data.Comment || 'No comments recorded.'}</p></div></div><div class="results-actions"><button id="new-search-button" class="cybr-btn">NEW SEARCH</button><button id="download-pdf-button" class="cybr-btn">DOWNLOAD PDF</button><a href="https://forms.gle/WQxsNjX2XX8PNa9w8" target="_blank" rel="noopener" class="complaint-button">File a Complaint</a></div><div class="social-links results-social"><a href="https://www.facebook.com/Students.union.long.live.eg/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a><a href="https://forms.tahyamisrsu.com/" target="_blank" rel="noopener" aria-label="Event Registration"><i class="fas fa-file-signature"></i></a><a href="https://eg.linkedin.com/company/students-union.long.live.eg" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a><a href="https://x.com/sulongliveeg?lang=ar" target="_blank" rel="noopener" aria-label="X Platform"><i class="fab fa-xing"></i></a><a href="https://www.instagram.com/sulongliveeg/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a></div>`;
        const allKeys = [...performanceKeys, ...softSkillsKeys];
        const allData = allKeys.map(key => parseInt(data[key] || 0));
        createOrUpdateChart(allKeys.map(k => k.replace(/ of the task/g, '')), allData);
        document.getElementById('download-pdf-button').addEventListener('click', () => generateAndDownloadPDF(data.Name || 'Member'));
        document.getElementById('new-search-button').addEventListener('click', () => {
            if (currentChart) { currentChart.destroy(); currentChart = null; }
            gsap.to("#results-screen > *", { duration: 0.5, y: -40, opacity: 0, stagger: 0.05, ease: "power2.in", onComplete: () => {
                switchScreen('login'); document.getElementById('memberCodeInput').value = '';
                gsap.from(".login-container > *", { duration: 0.7, y: 30, opacity: 0, stagger: 0.1, ease: "power3.out" });
            }});
        });
        const memberPhoto = document.querySelector('.member-photo');
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        if (memberPhoto && imageModal && modalImage) { memberPhoto.addEventListener('click', () => { imageModal.classList.add('show'); modalImage.src = memberPhoto.src; }); }
        gsap.from("#results-screen > *", { duration: 0.8, y: 50, opacity: 0, stagger: 0.08, ease: "power3.out" });
    }

    function getChartColors() {
        const isLightMode = body.classList.contains('light-mode');
        return { gridColor: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)', labelColor: isLightMode ? '#333333' : '#e0e0e0', borderColor: isLightMode ? 'rgba(211, 47, 47, 1)' : 'rgba(255, 7, 58, 1)', pointColor: '#ffffff', background: isLightMode ? 'rgba(211, 47, 47, 0.08)' : 'rgba(255, 7, 58, 0.12)' };
    }
    
    function updateChartTheme() {
        if (!currentChart) return;
        const colors = getChartColors();
        currentChart.options.scales.r.angleLines.color = colors.gridColor;
        currentChart.options.scales.r.grid.color = colors.gridColor;
        currentChart.options.scales.r.pointLabels.color = colors.labelColor;
        currentChart.data.datasets[0].backgroundColor = colors.background;
        currentChart.data.datasets[0].borderColor = colors.borderColor;
        currentChart.update();
    }

    function createOrUpdateChart(labels, data) {
        const colors = getChartColors();
        const ctx = document.getElementById('radarChart');
        if (!ctx) return;
        if (currentChart) { currentChart.destroy(); }
        currentChart = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: { labels: labels, datasets: [{ label: 'Evaluation', data: data, backgroundColor: colors.background, borderColor: colors.borderColor, borderWidth: 2, pointBackgroundColor: colors.pointColor, pointBorderColor: colors.borderColor, pointHoverBackgroundColor: colors.pointColor, pointHoverBorderColor: colors.borderColor }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: colors.gridColor }, grid: { color: colors.gridColor }, pointLabels: { color: colors.labelColor, font: { family: "'Share Tech Mono', monospace", size: 12 } }, ticks: { display: false, beginAtZero: true, suggestedMax: 100 } } }, plugins: { legend: { display: false }, tooltip: { enabled: true } }, elements: { line: { borderWidth: 2, tension: 0.25 }, point: { radius: 4 } } }
        });
    }

    // ==========================================================================
    // --- 3. APP START
    // ==========================================================================
    runArtisticIntro();
});