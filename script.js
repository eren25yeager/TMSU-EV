document.addEventListener('DOMContentLoaded', () => {
    // --- Interactive Background ---
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#ff073a" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.5, "random": false, "anim": { "enable": false } },
            "size": { "value": 3, "random": true, "anim": { "enable": false } },
            "line_linked": { "enable": true, "distance": 150, "color": "#ff073a", "opacity": 0.4, "width": 1 },
            "move": { "enable": true, "speed": 4, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
            "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } }
        },
        "retina_detect": true
    });

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
    
    // --- Modal Elements ---
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.querySelector('.close-modal-btn');

    let loaderTimeouts = [];
    let currentChart = null;
    let toastTimeout = null;
    let allMembersData = []; // لتخزين بيانات كل الأعضاء

    // --- Helper function to measure text width ---
    function getTextWidth(text, font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        return context.measureText(text).width;
    }

    // --- Toast Notification Function ---
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

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
                element.innerHTML += text.charAt(i++);
                setTimeout(type, speed);
            }
        }
        type();
    }
    typeEffect(document.getElementById('animated-title'), "TSMU Evaluation");

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
        if (!memberCode) {
            if(inputs.code) {
                inputs.code.style.animation = 'shake 0.5s';
                setTimeout(() => inputs.code.style.animation = '', 500);
            }
            showToast("Please enter a member code.");
            return;
        }
        const loaderDuration = runLoader();
        setTimeout(() => {
            Papa.parse(csvUrl, {
                download: true, header: true, skipEmptyLines: true,
                complete: (results) => {
                    const memberData = results.data.find(row => row.Code && String(row.Code).trim().toLowerCase() === memberCode.toLowerCase());
                    if (memberData) {
                        displayResults(memberData);
                    } else {
                        showToast("Incorrect or non-existent code. Please try again.");
                        switchScreen('login');
                    }
                },
                error: (err) => {
                    showToast("Error fetching data. Check your internet connection.");
                    switchScreen('login');
                }
            });
        }, loaderDuration);
    }

    // --- PDF Generation ---
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
                backgroundColor: document.body.classList.contains('light-mode') ? '#f4f4f9' : '#0d0d0d',
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

        } catch (err) {
            console.error("PDF generation failed:", err);
            showToast("Sorry, there was an error creating the PDF file.");
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

    // --- Display Results Function ---
    function displayResults(data) {
        switchScreen('results');

        let photoUrl = data['Photo URL'] || '';
        if (photoUrl.includes('drive.google.com')) {
            const fileId = new URL(photoUrl).searchParams.get('id');
            if (fileId) photoUrl = `https://lh3.googleusercontent.com/d/${fileId}=s220`;
        }
        const fallbackImage = 'images/default-avatar.png';
        const photoHTML = `<img src="${photoUrl}" class="member-photo" alt="Member Photo" crossorigin="anonymous" onerror="this.onerror=null;this.src='${fallbackImage}';">`;
        
        const memberHeaderHTML = `
            <div class="member-header">
                ${photoHTML}
                <div class="member-info">
                    <h2>${data.Name || 'Unknown Member'}</h2>
                    <p>${data.Committee || 'N/A'}</p>
                </div>
            </div>`;

        const performanceKeys = ['Quality of the task', 'Quantity of the task', 'Attendence', 'Communication'];
        const softSkillsKeys = ['Flexibility', 'Teamwork', 'Technical Knowledge', 'Bonus'];
        const createListHTML = (keys ) => keys.map(key => `<li><span>${key.replace(/ of the task/g, '')}</span> <span class="value">${data[key] || 0}</span></li>`).join('');
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
        
        screens.results.innerHTML = `
            ${memberHeaderHTML}
            <div class="results-grid">
                <div class="result-card"><div class="title">Final Grade</div><div class="total-score-display">${data.Appreciation || 'N/A'}</div></div>
                <div class="result-card percentage-card"><div class="title">Percentage</div>${percentageHTML}</div>
                <div class="result-card"><div class="title">Total Score</div><div class="total-score-display">${data.Total || '0'}</div></div>
                <div class="result-card status-card"><div class="member-status-display"><div class="title">Member Status</div><div class="status-text ${statusClass}">${memberStatus}</div></div><div class="status-indicators">${indicatorsHTML}</div></div>
                <div class="details-container"><details class="collapsible-list" open><summary>Performance Metrics</summary><ul>${performanceListHTML}</ul></details><details class="collapsible-list" open><summary>Soft & Technical Skills</summary><ul>${softSkillsListHTML}</ul></details></div>
                <div class="result-card main-chart-container"><canvas id="radarChart"></canvas></div>
                <div class="result-card comment-card"><div class="title">Analyst's Comment</div><p>${data.Comment || 'No comments recorded.'}</p></div>
            </div>
            <div class="results-actions">
                <button id="new-search-button" class="cybr-btn">NEW SEARCH</button>
                <button id="download-pdf-button" class="cybr-btn">DOWNLOAD PDF</button>
                <a href="https://forms.gle/WQxsNjX2XX8PNa9w8" target="_blank" rel="noopener" class="complaint-button">File a Complaint</a>
            </div>
            <div class="social-links results-social">
                <a href="https://www.facebook.com/Students.union.long.live.eg/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="https://forms.tahyamisrsu.com/" target="_blank" rel="noopener" aria-label="Event Registration"><i class="fas fa-file-signature"></i></a>
                <a href="https://eg.linkedin.com/company/students-union-long-live-eg" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a href="https://x.com/sulongliveeg?lang=ar" target="_blank" rel="noopener" aria-label="X Platform"><i class="fab fa-xing"></i></a>
                <a href="https://www.instagram.com/sulongliveeg/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            </div>`;

        const allKeys = [...performanceKeys, ...softSkillsKeys];
        const allData = allKeys.map(key => parseInt(data[key] || 0 ));
        createOrUpdateChart('radarChart', allKeys.map(k => k.replace(/ of the task/g, '')), allData);
        
        document.getElementById('download-pdf-button').addEventListener('click', () => generateAndDownloadPDF(data.Name || 'Member'));
        document.getElementById('new-search-button').addEventListener('click', () => {
            if (currentChart) { currentChart.destroy(); currentChart = null; }
            gsap.to("#results-screen > *", { duration: 0.5, y: -40, opacity: 0, stagger: 0.05, ease: "power2.in", onComplete: () => {
                switchScreen('login');
                inputs.code.value = '';
                gsap.from(".login-container > *", { duration: 0.7, y: 30, opacity: 0, stagger: 0.1, ease: "power3.out" });
            }});
        });

        const memberPhoto = document.querySelector('.member-photo');
        if (memberPhoto && imageModal && modalImage) {
            memberPhoto.addEventListener('click', () => {
                imageModal.classList.add('show');
                modalImage.src = memberPhoto.src;
            });
        }

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
    function createOrUpdateChart(canvasId, labels, data) {
        const colors = getChartColors();
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // A bit of a hack to manage the main chart instance
        if (canvasId === 'radarChart') {
            if (currentChart) {
                currentChart.destroy();
            }
            currentChart = new Chart(ctx.getContext('2d'), chartConfig(labels, data, colors));
        } else {
            // For any other chart (like in the modal), just create it.
            // We assume it will be destroyed when the modal is closed/recreated.
            new Chart(ctx.getContext('2d'), chartConfig(labels, data, colors));
        }
    }

    function chartConfig(labels, data, colors) {
        return {
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
                responsive: true, maintainAspectRatio: false,
                scales: { r: {
                    angleLines: { color: colors.gridColor },
                    grid: { color: colors.gridColor },
                    pointLabels: { color: colors.labelColor, font: { family: "'Share Tech Mono', monospace", size: 12 } },
                    ticks: { display: false, beginAtZero: true, suggestedMax: 100 }
                }},
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                elements: { line: { borderWidth: 2, tension: 0.25 }, point: { radius: 4 } }
            }
        };
    }

    // --- Initial & Global Event Listeners ---
    if (inputs.analyzeBtn) inputs.analyzeBtn.addEventListener('click', handleSearch);
    if (inputs.code) {
        inputs.code.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
        const inputWrapper = document.querySelector('.input-wrapper');
        const caret = document.getElementById('input-caret');
        if (inputWrapper && caret) {
            const updateCaretPosition = () => {
                const inputStyle = window.getComputedStyle(inputs.code);
                const font = `${inputStyle.fontSize} ${inputStyle.fontFamily}`;
                const textWidth = getTextWidth(inputs.code.value, font);
                const newLeft = (inputs.code.offsetWidth / 2) + (textWidth / 2) + 2;
                caret.style.left = `${newLeft}px`;
            };
            inputs.code.addEventListener('focus', () => { inputWrapper.classList.add('focused'); updateCaretPosition(); });
            inputs.code.addEventListener('blur', () => { inputWrapper.classList.remove('focused'); });
            inputs.code.addEventListener('input', updateCaretPosition);
            updateCaretPosition();
        }
    }

    // --- Global Modal Close Listeners ---
    if (imageModal && closeModalBtn) {
        closeModalBtn.addEventListener('click', () => { imageModal.classList.remove('show'); });
        imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.classList.remove('show'); });
    }

    // ==========================================================================
    // --- Admin Panel Logic ---
    // ==========================================================================
    const ADMIN_PASSWORD = "TSMU2025";

    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminDashboardModal = document.getElementById('admin-dashboard-modal');
    const adminAccessButton = document.getElementById('admin-access-button');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const adminLoginButton = document.getElementById('admin-login-button');
    const closeAdminButtons = document.querySelectorAll('.close-admin-modal-btn');
    const adminTableContainer = document.getElementById('admin-table-container');

    if (adminAccessButton) {
        adminAccessButton.addEventListener('click', () => {
            adminLoginModal.classList.add('show');
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        });
    }

    closeAdminButtons.forEach(btn => {
    btn.addEventListener('click', (event) => {
        // ابحث عن أقرب نافذة منبثقة (modal) للزر الذي تم الضغط عليه وقم بإغلاقها فقط
        const modalToClose = event.target.closest('.admin-modal');
        if (modalToClose) {
            modalToClose.classList.remove('show');
        }
    });
});


    if (adminLoginButton) {
        adminLoginButton.addEventListener('click', () => {
            if (adminPasswordInput.value === ADMIN_PASSWORD) {
                adminLoginModal.classList.remove('show');
                adminDashboardModal.classList.add('show');
                loadAdminDashboard();
            } else {
                showToast("Incorrect password.");
                adminPasswordInput.style.animation = 'shake 0.5s';
                setTimeout(() => adminPasswordInput.style.animation = '', 500);
            }
        });
    }
    if(adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') adminLoginButton.click();
        });
    }

    function loadAdminDashboard() {
        adminTableContainer.innerHTML = '<p>Loading all member data...</p>';
        document.getElementById('stats-cards-container').innerHTML = '<p>Calculating stats...</p>';

        if ($.fn.DataTable.isDataTable('#admin-table')) {
            $('#admin-table').DataTable().destroy();
        }
        adminTableContainer.innerHTML = '';

        Papa.parse(csvUrl, {
            download: true, header: true, skipEmptyLines: true, dynamicTyping: true,
            complete: (results) => {
                allMembersData = results.data;
                const members = allMembersData;
                const textColor = getComputedStyle(document.body).getPropertyValue('--color-text').trim();
                const gridColor = getComputedStyle(document.body).getPropertyValue('--color-border').trim();
                const bgColor = getComputedStyle(document.body).getPropertyValue('--color-bg').trim();

                // 1. Calculate and display stats
                const totalMembers = members.length;
                const totalScoreSum = members.reduce((sum, member) => sum + (member.Total || 0), 0);
                const averageScore = totalMembers > 0 ? (totalScoreSum / totalMembers).toFixed(1) : 0;
                const statusCounts = members.reduce((counts, member) => {
                    const status = member.Status || 'Unknown';
                    counts[status] = (counts[status] || 0) + 1;
                    return counts;
                }, {});

                const statsCardsContainer = document.getElementById('stats-cards-container');
                statsCardsContainer.innerHTML = `
                    <div class="stat-card"><div class="stat-value">${totalMembers}</div><div class="stat-label">Total Members</div></div>
                    <div class="stat-card"><div class="stat-value">${averageScore}</div><div class="stat-label">Average Score</div></div>
                    <div class="stat-card"><div class="stat-value">${statusCounts['Clear'] || 0}</div><div class="stat-label">Status: Clear</div></div>
                    <div class="stat-card"><div class="stat-value">${statusCounts['Firing'] || 0}</div><div class="stat-label">Status: Firing</div></div>
                `;

                // 2. Create and display data table
                let tableHTML = '<table id="admin-table" class="display" style="width:100%"><thead><tr>';
                const headers = ['Name', 'Code', 'Committee', 'Total', '%', 'Appreciation', 'Status'];
                headers.forEach(h => tableHTML += `<th>${h}</th>`);
                tableHTML += '</tr></thead><tbody>';
                members.forEach(member => {
                    tableHTML += '<tr>';
                    headers.forEach(h => tableHTML += `<td>${member[h] || ''}</td>`);
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table>';
                adminTableContainer.innerHTML = tableHTML;

                const adminTable = $('#admin-table').DataTable({
                    "pageLength": 10,
                    "responsive": true
                });

                $('#admin-table tbody').on('click', 'tr', function () {
                    const rowData = adminTable.row(this).data();
                    if (rowData) {
                        const memberCode = rowData[1];
                        const memberFullData = allMembersData.find(m => String(m.Code) === String(memberCode));
                        if (memberFullData) {
                            showMemberDetails(memberFullData);
                        }
                    }
                });

                // 3. Create and display charts
                const pieCtx = document.getElementById('statusPieChart');
                if (pieCtx) {
                    new Chart(pieCtx.getContext('2d'), {
                        type: 'pie',
                        data: {
                            labels: Object.keys(statusCounts),
                            datasets: [{
                                data: Object.values(statusCounts),
                                backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#6c757d'],
                                borderColor: bgColor,
                                borderWidth: 2
                            }]
                        },
                        options: { responsive: true, plugins: { legend: { position: 'top', labels: { color: textColor } } } }
                    });
                }

                const committeeScores = members.reduce((acc, member) => {
                    const committee = member.Committee || 'No Committee';
                    const score = member.Total || 0;
                    if (!acc[committee]) acc[committee] = { totalScore: 0, count: 0 };
                    acc[committee].totalScore += score;
                    acc[committee].count++;
                    return acc;
                }, {});
                const committeeLabels = Object.keys(committeeScores);
                const committeeAvgScores = committeeLabels.map(c => (committeeScores[c].totalScore / committeeScores[c].count).toFixed(1));

                const barCtx = document.getElementById('committeeBarChart');
                if (barCtx) {
                    new Chart(barCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: committeeLabels,
                            datasets: [{
                                label: 'Average Score',
                                data: committeeAvgScores,
                                backgroundColor: 'rgba(255, 7, 58, 0.6)',
                                borderColor: 'rgba(255, 7, 58, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true, indexAxis: 'y',
                            scales: {
                                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                                y: { ticks: { color: textColor }, grid: { color: gridColor } }
                            },
                            plugins: { legend: { display: false } }
                        }
                    });
                }
            },
            error: (err) => {
                adminTableContainer.innerHTML = '<p>Error loading data. Please check the console.</p>';
                console.error("Admin Dashboard Error:", err);
            }
        });
    }

    function showMemberDetails(data) {
        const detailsModal = document.getElementById('member-details-modal');
        const detailsContent = document.getElementById('member-details-content');

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
        const createListHTML = (keys ) => keys.map(key => `<li><span>${key.replace(/ of the task/g, '')}</span> <span class="value">${data[key] || 0}</span></li>`).join('');
        
        const percentage = parseInt(data['%'] || 0);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const percentageHTML = `<div class="progress-ring"><svg width="100" height="100"><circle class="progress-ring__circle" stroke="${getChartColors().borderColor}" stroke-width="6" fill="transparent" r="${radius}" cx="50" cy="50" style="stroke-dasharray: ${circumference} ${circumference}; stroke-dashoffset: ${offset};"/></svg><span class="progress-ring__text">${percentage}%</span></div>`;

        detailsContent.innerHTML = `
            ${memberHeaderHTML}
            <div class="results-grid">
                <div class="result-card"><div class="title">Final Grade</div><div class="total-score-display">${data.Appreciation || 'N/A'}</div></div>
                <div class="result-card percentage-card"><div class="title">Percentage</div>${percentageHTML}</div>
                <div class="result-card"><div class="title">Total Score</div><div class="total-score-display">${data.Total || '0'}</div></div>
                <div class="details-container" style="grid-column: 1 / -1;"><details class="collapsible-list" open><summary>Performance Metrics</summary><ul>${createListHTML(performanceKeys)}</ul></details><details class="collapsible-list" open><summary>Soft & Technical Skills</summary><ul>${createListHTML(softSkillsKeys)}</ul></details></div>
                <div class="result-card main-chart-container"><canvas id="memberDetailRadarChart"></canvas></div>
                <div class="result-card comment-card"><div class="title">Analyst's Comment</div><p>${data.Comment || 'No comments recorded.'}</p></div>
            </div>
        `;

        const allKeys = [...performanceKeys, ...softSkillsKeys];
        const allData = allKeys.map(key => parseInt(data[key] || 0));
        createOrUpdateChart('memberDetailRadarChart', allKeys.map(k => k.replace(/ of the task/g, '')), allData);

        detailsModal.classList.add('show');
    }
});
