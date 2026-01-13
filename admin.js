const adminApp = {
    API_URL: 'https://pathfinder-ochre-kappa.vercel.app/api',
    
    /* Dibuat oleh: Suud Nofa 24SA11A151 & direvisi oleh: Adinedo 24SA11A148 */
    
    // SISTEM LOGIN
    login: function() {
        const u = document.getElementById('admin-user').value.trim();
        const p = document.getElementById('admin-pass').value.trim();
        
        if (u === 'Midae' && p === '135246') {
            document.getElementById('login-screen').classList.replace('active', 'hidden');
            document.getElementById('dashboard-screen').classList.replace('hidden', 'active');
            this.renderUserTable();
        } else { 
            alert('Username atau Password Salah!'); 
        }
    },

    // NAVIGASI TAB
    switchTab: function(t, e) {
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        if (e) e.currentTarget.classList.add('active');
        document.getElementById(`tab-${t}`).classList.add('active');
        t === 'users' ? this.renderUserTable() : this.renderQuestionTable();
    },

    // FITUR DETAIL JAWABAN
    showUserInfo: async function(userData) {
        try {
            const response = await fetch(`${this.API_URL}/user-answers/${userData.id}`);
            const answers = await response.json();

            if (!answers || answers.length === 0) {
                alert("User ini tidak memiliki data detail jawaban.");
                return;
            }

            let reportHTML = `
                <html>
                <head>
                    <title>Detail Hasil - ${userData.NAME}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                        h2 { color: #2c3e50; border-bottom: 2px solid #3498db; }
                        .header-box { background: #f4f7f6; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                        .item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                        .question { font-weight: bold; color: #2c3e50; }
                        .answer { color: #3498db; font-weight: bold; margin-left: 5px; }
                        .btn-print { background: #27ae60; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; margin-top: 20px; }
                        @media print { .btn-print { display: none; } }
                    </style>
                </head>
                <body>
                    <h2>LAPORAN HASIL TES</h2>
                    <div class="header-box">
                        <strong>Nama:</strong> ${userData.NAME}<br>
                        <strong>Rekomendasi:</strong> ${userData.result}
                    </div>
                    <div>
            `;

            answers.forEach((item, index) => {
                const q = item.question_text || "Pertanyaan tidak ditemukan";
                const a = item.selected_option || "Tidak ada jawaban";
                reportHTML += `
                    <div class="item">
                        <div class="question">${index + 1}. ${q}</div>
                        <div>Jawaban: <span class="answer">${a}</span></div>
                    </div>
                `;
            });

            reportHTML += `
                    </div>
                    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
                </body>
                </html>
            `;

            const win = window.open("", "_blank", "width=600,height=800,scrollbars=yes");
            win.document.write(reportHTML);
            win.document.close();

        } catch (e) {
            console.error("Gagal mengambil detail:", e);
            alert("Gagal menyambung ke server database.");
        }
    },

    // MANAJEMEN USER
    renderUserTable: async function() {
        try {
            const r = await fetch(`${this.API_URL}/users`);
            const sortedData = await r.json(); 

            const container = document.getElementById('user-table-body');
            if (!container) return;

            container.innerHTML = sortedData.map(u => {
                // Escape quotes untuk data JSON di HTML agar tidak error
                const userJson = JSON.stringify(u).replace(/"/g, '&quot;');
                
                return `
                <tr>
                    <td>${u.DATE ? new Date(u.DATE).toLocaleDateString('id-ID') : '-'}</td>
                    <td>${u.NAME}</td>
                    <td>${u.result}</td>
                    <td>
                        <button class="action-btn" title="Lihat Detail" onclick="adminApp.showUserInfo(${userJson})">🔍</button>
                        <button class="action-btn" title="Hapus" onclick="adminApp.deleteUser(${u.id})">🗑️</button>
                    </td>
                </tr>`;
            }).join('');
        } catch (e) { 
            console.error("Gagal memuat tabel user:", e); 
        }
    },

    deleteUser: async function(id) {
        if(confirm('Hapus data user ini secara permanen?')) {
            try {
                const res = await fetch(`${this.API_URL}/users/${id}`, { method: 'DELETE' });
                if(res.ok) this.renderUserTable();
            } catch (e) {
                alert("Gagal menghapus user.");
            }
        }
    },

    // MANAJEMEN SOAL
    renderQuestionTable: async function() {
        try {
            const r = await fetch(`${this.API_URL}/questions`);
            const d = await r.json();
            const container = document.getElementById('question-table-body');
            if (!container) return;
            
            container.innerHTML = d.map(q => {
                const text = q.TEXT || "";
                const type = q.TYPE || "";
                
                return `
                <tr>
                    <td>${q.id}</td>
                    <td>${text}</td>
                    <td><span class="badge">${type}</span></td>
                    <td>
                        <button class="action-btn" title="Edit Soal" onclick="adminApp.editQuestion(${q.id}, '${text.replace(/'/g, "\\'")}', '${type}')">📝</button>
                        <button class="action-btn" title="Hapus Soal" onclick="adminApp.deleteQuestion(${q.id})">🗑️</button>
                    </td>
                </tr>`;
            }).join('') || '<tr><td colspan="4">Tidak ada soal.</td></tr>';
        } catch (e) { 
            console.error("Gagal memuat tabel soal:", e); 
        }
    },

    addQuestion: async function() {
        const textEl = document.getElementById('new-q-text');
        const typeEl = document.getElementById('new-q-type');
        const t = textEl.value.trim();
        const y = typeEl.value;

        if (!t) return alert('Isi teks pertanyaan!');

        try {
            const res = await fetch(`${this.API_URL}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ TEXT: t, TYPE: y })
            });
            if(res.ok) {
                textEl.value = ''; 
                this.renderQuestionTable();
            }
        } catch (e) {
            alert("Gagal menambah soal.");
        }
    },

    editQuestion: async function(id, txt, typ) {
        const nT = prompt("Edit Soal:", txt);
        const nY = prompt("Edit Tipe:", typ);
        
        if (nT !== null && nY !== null) {
            try {
                const res = await fetch(`${this.API_URL}/questions/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ TEXT: nT, TYPE: nY.toUpperCase() })
                });
                if(res.ok) this.renderQuestionTable();
            } catch (e) {
                alert("Gagal mengupdate soal.");
            }
        }
    },

    deleteQuestion: async function(id) {
        if(confirm('Hapus soal ini?')) {
            try {
                const res = await fetch(`${this.API_URL}/questions/${id}`, { 
                    method: 'DELETE' 
                });
                if(res.ok) this.renderQuestionTable();
            } catch (e) {
                console.error("Gagal menghapus:", e);
                alert("Gagal menghapus soal.");
            }
        }
    }
};