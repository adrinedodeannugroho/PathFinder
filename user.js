const API_URL = 'http://localhost:3000/api';
    // Dibuat oleh: Miza 24SA11A132 & direvisi oleh: Adrinedo 24SA11A148
const userApp = {
    questions: [],
    currentStep: 0,
    scores: { TECH: 0, COMM: 0, BIZ: 0, HEALTH: 0, SPATIAL: 0 },
    userName: "",
    userAnswersTracking: [], 
    tempSelection: null, 

    // NAVIGASI HALAMAN
    showIdentityScreen: function() {
        document.getElementById('dashboard-home').classList.replace('active', 'hidden');
        const identity = document.getElementById('identity-screen');
        identity.classList.remove('hidden');
        identity.classList.add('active');
    },

    backToHome: function() {
        document.getElementById('identity-screen').classList.replace('active', 'hidden');
        const home = document.getElementById('dashboard-home');
        home.classList.remove('hidden');
        home.classList.add('active');
    },

    // LOGIKA KUIS
    startQuiz: async function() {
        const input = document.getElementById('username');
        const nameError = document.getElementById('name-error');

        if (!input || !input.value.trim()) {
            if (nameError) nameError.style.display = 'block';
            return;
        }
        
        this.userName = input.value.trim();
        if (nameError) nameError.style.display = 'none';

        try {
            const response = await fetch(`${API_URL}/questions`);
            this.questions = await response.json();

            if (!this.questions || this.questions.length === 0) {
                alert("Database Kosong! Silakan hubungi admin untuk mengisi soal.");
                return;
            }

            document.getElementById('identity-screen').classList.replace('active', 'hidden');
            const quizScreen = document.getElementById('quiz-screen');
            quizScreen.classList.remove('hidden');
            quizScreen.classList.add('active');
            
            this.renderQuestion();
        } catch (error) {
            console.error("Error Koneksi:", error);
            alert("Gagal koneksi ke Server! Pastikan backend Node.js Anda berjalan.");
        }
    },

    renderQuestion: function() {
        if (this.currentStep >= this.questions.length) {
            this.finishQuiz();
            return;
        }

        const qData = this.questions[this.currentStep];
        // Mendukung case-insensitive untuk property TEXT/text
        let textKey = Object.keys(qData).find(k => k.toLowerCase() === 'text');
        const textSoal = textKey ? qData[textKey] : "Soal tidak tersedia";
        
        document.getElementById('question-text').innerText = textSoal;
        document.getElementById('question-count').innerText = `Pertanyaan ${this.currentStep + 1} dari ${this.questions.length}`;
        
        const progress = (this.currentStep / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;

        const container = document.getElementById('options-container');
        if (container) {
            container.innerHTML = '';
            const options = [
                { val: 5, label: "Sangat Setuju" },
                { val: 3, label: "Setuju" },
                { val: 1, label: "Kurang Setuju" },
                { val: 0, label: "Tidak Setuju" }
            ];

            options.forEach(opt => {
                const div = document.createElement('div');
                div.className = 'option-item';
                div.innerHTML = `<span>${opt.label}</span><div class="checkmark">✔</div>`;
                div.onclick = () => this.handleAnswer(opt.val, opt.label, div);
                container.appendChild(div);
            });
        }
    },

    handleAnswer: function(points, label, element) {
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        const qData = this.questions[this.currentStep];
        let typeKey = Object.keys(qData).find(k => k.toLowerCase() === 'type');
        let textKey = Object.keys(qData).find(k => k.toLowerCase() === 'text');

        // Simpan data sementara sebelum konfirmasi
        this.tempSelection = {
            points: points,
            category: typeKey ? qData[typeKey].toUpperCase() : 'TECH',
            question: qData[textKey],
            q_id: qData.id, 
            label: label
        };

        document.getElementById('confirm-modal').classList.remove('hidden');
    },

    confirmAnswer: function() {
        if (!this.tempSelection) return;
        
        const { points, category, question, q_id, label } = this.tempSelection;

        // Tambah Skor ke kategori terkait
        if (this.scores.hasOwnProperty(category)) {
            this.scores[category] += points;
        }

        // SINKRONISASI DENGAN SERVER.JS:
        this.userAnswersTracking.push({
            q_id: q_id,
            question: question,
            answer: label,
            category: category
        });

        document.getElementById('confirm-modal').classList.add('hidden');
        this.currentStep++;
        this.renderQuestion();
    },

    cancelAnswer: function() {
        document.getElementById('confirm-modal').classList.add('hidden');
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        this.tempSelection = null;
    },

    finishQuiz: function() {
        document.getElementById('summary-name').innerText = this.userName;
        
        const summaryContainer = document.getElementById('user-summary-list');
        if (summaryContainer) {
            summaryContainer.innerHTML = this.userAnswersTracking.map((item, index) => `
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                    <p style="margin:0; font-weight:600; font-size:14px;">${index + 1}. ${item.question}</p>
                    <p style="margin:0; color:#3498db; font-size:13px;">Jawaban: ${item.answer}</p>
                </div>
            `).join('');
        }

        document.getElementById('quiz-screen').classList.replace('active', 'hidden');
        const summaryScreen = document.getElementById('summary-screen');
        summaryScreen.classList.remove('hidden');
        summaryScreen.classList.add('active');
    },

    showFinalResult: async function() {
        let maxScore = -1, winningCategory = "TECH";
        
        for (const [key, value] of Object.entries(this.scores)) {
            if (value > maxScore) { 
                maxScore = value; 
                winningCategory = key; 
            }
        }
        
        const majors = (typeof majorCategories !== 'undefined' && majorCategories[winningCategory]) 
                       ? majorCategories[winningCategory] 
                       : ["Informatika"];
        
        const finalMajor = majors[Math.floor(Math.random() * majors.length)];

        document.getElementById('major-name').innerText = finalMajor;
        document.getElementById('major-desc').innerText = `Kategori Dominan: ${winningCategory}`;
        this.renderCareerOptions(finalMajor);

        document.getElementById('summary-screen').classList.replace('active', 'hidden');
        const resultScreen = document.getElementById('result-screen');
        resultScreen.classList.remove('hidden');
        resultScreen.classList.add('active');

        // KIRIM DATA KE DATABASE
        try {
            await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    NAME: this.userName, 
                    result: finalMajor,
                    category: winningCategory,
                    answers: this.userAnswersTracking
                })
            });
        } catch (e) { 
            console.error("Gagal mengirim data hasil ke server:", e); 
        }
    },

    renderCareerOptions: function(majorName) {
        const careers = typeof careerOptions !== 'undefined' ? careerOptions[majorName] : null;
        const container = document.getElementById('career-list-container');
        if(!container) return;
        
        container.innerHTML = careers 
            ? careers.map(c => `<div class="career-item"><h5>🚀 ${c.title}</h5><p>${c.desc}</p></div>`).join('')
            : '<p>Opsi karir sedang dimuat...</p>';
    }
};

// EKSPOR DATA
const exportManager = {
    downloadImage: function() {
        const area = document.getElementById('print-area');
        html2canvas(area, { backgroundColor: "#ffffff", scale: 2, useCORS: true }).then(canvas => {
            const link = document.createElement('a');
            link.download = `PathFinder_${userApp.userName}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        });
    },
    downloadPDF: function() {
        const { jsPDF } = window.jspdf;
        const area = document.getElementById('print-area');
        html2canvas(area, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
            pdf.save(`PathFinder_${userApp.userName}.pdf`);
        });
    }
};