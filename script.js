document.addEventListener('DOMContentLoaded', () => {
    // --- Settings ---
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRiyP0D5X-WL8IPT4UMNgO5QFYruJIPaKpHLGD8Wl1PdUcJcefMMOzERSSKyT54AENHkpMdwaOzD3Ik/pub?output=csv';
    const screens = {
        login: document.getElementById('login-screen' ),
        loader: document.getElementById('loader-screen'),
        results: document.getElementById('results-screen')
    };
    const inputs = {
        code: document.getElementById('memberCodeInput'),
        analyzeBtn: document.getElementById('analyze-button')
    };
    const loaderElements = {
        text: document.getElementById('loader-text'),
        progressBar: document.querySelector('.progress-bar-inner')
    };
    let loaderTimeouts = [];
    let currentChart = null;

    // --- Theme Settings ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;
    function applyTheme(isLight) {
        body.classList.toggle('light-mode', isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        if (currentChart) updateChartTheme();
    }
    function toggleTheme() { applyTheme(!body.classList.contains('light-mode')); }
    const savedTheme = localStorage.getItem('theme') === 'light';
    applyTheme(savedTheme);
    themeToggleButton.addEventListener('click', toggleTheme);

    // --- Screen Control ---
    function switchScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        if (screens[screenName]) screens[screenName].classList.add('active');
    }

    // --- Title Type Effect ---
    function typeEffect(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = "";
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
    typeEffect(document.getElementById('animated-title'), "TMSU DATA-LINK");

    // --- Interactive Loader ---
    function runLoader() {
        switchScreen('loader');
        const steps = [
            { text: "INITIATING CONNECTION...", duration: 500, progress: 10 },
            { text: "ACCESSING DATABASE...", duration: 700, progress: 30 },
            { text: "FETCHING RECORDS...", duration: 800, progress: 60 },
            { text: "PARSING DATA PACKETS...", duration: 600, progress: 90 },
            { text: "RENDERING VISUALS...", duration: 400, progress: 100 }
        ];
        loaderTimeouts.forEach(t => clearTimeout(t));
        loaderTimeouts = [];
        let totalDuration = 0;
        steps.forEach(step => {
            const t = setTimeout(() => {
                if (loaderElements.text) loaderElements.text.textContent = step.text;
                if (loaderElements.progressBar) loaderElements.progressBar.style.width = `${step.progress}%`;
            }, totalDuration);
            loaderTimeouts.push(t);
            totalDuration += step.duration;
        });
        return totalDuration;
    }

    // --- Main Search Function ---
    function handleSearch() {
        const memberCode = inputs.code.value.trim();
        if (!memberCode) return;
        const loaderDuration = runLoader();
        setTimeout(() => {
            Papa.parse(csvUrl, {
                download: true, header: true, skipEmptyLines: true,
                complete: (results) => {
                    const memberData = results.data.find(row => row.Code && row.Code.trim().toLowerCase() === memberCode.toLowerCase());
                    if (memberData) {
                        displayResults(memberData);
                    } else {
                        alert("Incorrect or non-existent code. Please try again.");
                        switchScreen('login');
                    }
                },
                error: (err) => {
                    alert("Error fetching data. Check your internet connection.");
                    switchScreen('login');
                }
            });
        }, loaderDuration);
    }

    // --- PDF Generation (Screenshot Method - Simplified) ---
    function generateAndDownloadPDF(memberName) {
        const downloadBtn = document.getElementById('download-pdf-button');
        const actionButtons = document.querySelector('.results-actions');
        const resultsContainer = document.getElementById('results-screen');

        downloadBtn.textContent = 'GENERATING...';
        downloadBtn.disabled = true;
        if (actionButtons) actionButtons.style.visibility = 'hidden';

        html2canvas(resultsContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: document.body.classList.contains('light-mode') ? '#f4f4f9' : '#0d0d0d',
            width: resultsContainer.scrollWidth,
            height: resultsContainer.scrollHeight,
            scrollY: -window.scrollY,
            scrollX: -window.scrollX,
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Evaluation-Report-${memberName.replace(/ /g, '_')}.pdf`);
        }).catch(err => {
            console.error("PDF generation failed:", err);
            alert("Sorry, there was an error creating the PDF file.");
        }).finally(() => {
            if (actionButtons) actionButtons.style.visibility = 'visible';
            downloadBtn.textContent = 'DOWNLOAD PDF';
            downloadBtn.disabled = false;
        });
    }

    // --- Display Results Function ---
    function displayResults(data) {
        switchScreen('results');
        const performanceKeys = ['Quality of the task', 'Quantity of the task', 'Attendence', 'Communication'];
        const softSkillsKeys = ['Flexibility', 'Teamwork', 'Technical Knowledge', 'Bonus'];
        const createListHTML = (keys) => keys.map(key => `<li><span>${key.replace(/ of the task/g, '')}</span> <span class="value">${data[key] || 0}</span></li>`).join('');
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
            return `<div class="indicator-item ${isActive ? 'active ' + item.class : ''}"><i class="fas ${item.icon}"></i><span class="indicator-label">${key}</span><span class="indicator-value">${value}</span></div>`;
        }).join('');
        const percentage = parseInt(data['%'] || 0);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const percentageHTML = `<div class="progress-ring"><svg width="100" height="100"><circle class="progress-ring__circle" stroke="${getChartColors().borderColor}" stroke-width="6" fill="transparent" r="${radius}" cx="50" cy="50" style="stroke-dasharray: ${circumference} ${circumference}; stroke-dashoffset: ${offset};"/></svg><span class="progress-ring__text">${percentage}%</span></div>`;
        screens.results.innerHTML = `<div class="result-card" style="grid-column: 1 / -1;"><h2>${data.Name || 'Unknown Member'}</h2><p>${data.Committee || 'N/A'}</p></div><div class="results-grid"><div class="result-card"><div class="title">Final Grade</div><div class="total-score-display">${data.Appreciation || 'N/A'}</div></div><div class="result-card percentage-card"><div class="title">Percentage</div>${percentageHTML}</div><div class="result-card"><div class="title">Total Score</div><div class="total-score-display">${data.Total || '0'}</div></div><div class="result-card status-card"><div class="member-status-display"><div class="title">Member Status</div><div class="status-text ${statusClass}">${memberStatus}</div></div><div class="status-indicators">${indicatorsHTML}</div></div><div class="details-container"><details class="collapsible-list" open><summary>Performance Metrics</summary><ul>${performanceListHTML}</ul></details><details class="collapsible-list" open><summary>Soft & Technical Skills</summary><ul>${softSkillsListHTML}</ul></details></div><div class="result-card main-chart-container"><canvas id="radarChart"></canvas></div><div class="result-card comment-card"><div class="title">Analyst's Comment</div><p>${data.Comment || 'No comments recorded.'}</p></div></div><div class="results-actions"><button id="new-search-button" class="cybr-btn">NEW SEARCH</button><button id="download-pdf-button" class="cybr-btn">DOWNLOAD PDF</button><a href="https://forms.gle/WQxsNjX2XX8PNa9w8" target="_blank" rel="noopener" class="complaint-button">File a Complaint</a></div>`;
        const allKeys = [...performanceKeys, ...softSkillsKeys];
        const allData = allKeys.map(key => parseInt(data[key] || 0 ));
        createOrUpdateChart(allKeys.map(k => k.replace(/ of the task/g, '')), allData);
        document.getElementById('download-pdf-button').addEventListener('click', () => generateAndDownloadPDF(data.Name || 'Member'));
        document.getElementById('new-search-button').addEventListener('click', () => {
            if (currentChart) { currentChart.destroy(); currentChart = null; }
            gsap.to("#results-screen > *", { duration: 0.5, y: -40, opacity: 0, stagger: 0.05, ease: "power2.in", onComplete: () => {
                switchScreen('login');
                inputs.code.value = '';
                gsap.from(".login-container > *", { duration: 0.7, y: 30, opacity: 0, stagger: 0.1, ease: "power3.out" });
            }});
        });
        gsap.from("#results-screen > *", { duration: 0.8, y: 50, opacity: 0, stagger: 0.08, ease: "power3.out" });
    }

    // --- Chart Functions ---
    function getChartColors() {
        const isLightMode = body.classList.contains('light-mode');
        return {
            gridColor: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            labelColor: isLightMode ? '#333333' : '#e0e0e0',
            borderColor: isLightMode ? 'rgba(211, 47, 47, 1)' : 'rgba(255, 7, 58, 1)',
            pointColor: '#ffffff',
            background: isLightMode ? 'rgba(211, 47, 47, 0.08)' : 'rgba(255, 7, 58, 0.12)'
        };
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
        if (currentChart) {
            currentChart.destroy();
        }
        currentChart = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Evaluation',
                    data: data,
                    backgroundColor: colors.background,
                    borderColor: colors.borderColor,
                    borderWidth: 2,
                    pointBackgroundColor: colors.pointColor,
                    pointBorderColor: colors.borderColor,
                    pointHoverBackgroundColor: colors.pointColor,
                    pointHoverBorderColor: colors.borderColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: colors.gridColor },
                        grid: { color: colors.gridColor },
                        pointLabels: { color: colors.labelColor, font: { family: "'Share Tech Mono', monospace", size: 12 } },
                        ticks: { display: false, beginAtZero: true, suggestedMax: 100 }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                elements: {
                    line: { borderWidth: 2, tension: 0.25 },
                    point: { radius: 4 }
                }
            }
        });
    }

    // --- Initial Event Listeners ---
    if (inputs.analyzeBtn) {
        inputs.analyzeBtn.addEventListener('click', handleSearch);
    }
    if (inputs.code) {
        inputs.code.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});
