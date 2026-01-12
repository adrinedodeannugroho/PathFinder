/* Dibuat dan direvisi oleh: Suud Nofa Setia Mahdani 24SA11A151 */
const DB = {
    // Default Data Pertanyaan (Init awal)
    defaultQuestions: [
        { text: "Apakah kamu suka mengutak-atik komputer atau gadget?", type: "TECH" },
        { text: "Apakah kamu tertarik dengan isu politik negara?", type: "COMM" },
        { text: "Apakah kamu suka merancang bangunan atau tata letak kota?", type: "SPATIAL" },
        { text: "Apakah kamu peduli dengan kesehatan fisik orang lain?", type: "HEALTH" },
        { text: "Apakah kamu suka menghitung uang dan laba rugi bisnis?", type: "BIZ" },
        { text: "Apakah kamu suka koding atau belajar bahasa pemrograman?", type: "TECH" },
        { text: "Apakah kamu orang yang pandai berbicara di depan umum?", type: "COMM" },
        { text: "Apakah kamu orang yang suka berinovasi dengan teknologi?", type: "TECH" },
        { text: "Apakah kamu suka menganalisis peta atau kondisi bumi?", type: "SPATIAL" },
        { text: "Apakah kamu sabar dalam merawat atau membantu orang sakit?", type: "HEALTH" },
        { text: "Apakah kamu suka menganalisis strategi pemasaran?", type: "BIZ" },
        { text: "Apakah kamu mengetahui dasar digital untuk kebutuhan bisnis?", type: "TECH" },
        { text: "Apakah kamu suka menggambar sketsa bangunan?", type: "SPATIAL" },
        { text: "Apakah kamu suka mempelajari anatomi dan fisiologi tubuh?", type: "HEALTH" },
        { text: "Apakah kamu teliti dalam pencatatan keuangan yang detail?", type: "BIZ" }
    ],

    // 1. Ambil Soal
    getQuestions: function() {
        const stored = localStorage.getItem('pf_questions');
        return stored ? JSON.parse(stored) : this.defaultQuestions;
    },

    // 2. Tambah Soal (Fitur Admin)
    addQuestion: function(text, type) {
        const current = this.getQuestions();
        current.push({ text, type });
        localStorage.setItem('pf_questions', JSON.stringify(current));
    },

    // 3. Hapus Soal (Fitur Admin)
    deleteQuestion: function(index) {
        const current = this.getQuestions();
        current.splice(index, 1);
        localStorage.setItem('pf_questions', JSON.stringify(current));
    },

    // 4. Simpan Hasil User (Fitur User)
    saveUserResult: function(name, result, category, answers) {
        const history = JSON.parse(localStorage.getItem('pf_users')) || [];
        const newEntry = { 
            id: Date.now(), 
            date: new Date().toLocaleDateString('id-ID'), 
            name, 
            result, 
            category,
            answers 
        };
        history.push(newEntry);
        localStorage.setItem('pf_users', JSON.stringify(history));
    },

    // 5. Ambil Data User (Fitur Admin)
    getUsers: function() {
        return JSON.parse(localStorage.getItem('pf_users')) || [];
    },

    // 6. Hapus Data User (Fitur Admin)
    deleteUser: function(id) {
        let history = this.getUsers();
        history = history.filter(user => user.id !== id);
        localStorage.setItem('pf_users', JSON.stringify(history));
    }
};

// Config Kategori Jurusan & Pemetaan Jurusan
const majorCategories = {
    TECH: ['Informatika', 'Teknologi Informasi', 'Sistem Informasi'],
    COMM: ['Ilmu Komunikasi', 'Hukum', 'Manajemen'],
    BIZ: ['Bisnis Digital', 'Akuntansi', 'Kewirausahaan'],
    HEALTH: ['Kebidanan', 'Fisioterapi'],
    SPATIAL: ['Arsitektur', 'Geografi', 'Perencanaan Wilayah dan Kota']
};

// DATA KARIR LENGKAP
const careerOptions = {
    'Informatika': [
        { title: 'Software Developer / Programmer', desc: 'Mengembangkan aplikasi atau sistem berbasis komputer menggunakan bahasa pemrograman.' },
        { title: 'Data Scientist', desc: 'Menganalisis data besar untuk menghasilkan informasi dan membantu pengambilan keputusan.' },
        { title: 'Game Developer', desc: 'Membuat dan mengembangkan permainan digital dari sisi teknis dan logika program.' }
    ],
    'Teknologi Informasi': [
        { title: 'IT Support Specialist', desc: 'Membantu pengguna mengatasi masalah perangkat keras dan perangkat lunak.' },
        { title: 'Network Administrator', desc: 'Mengelola dan menjaga jaringan komputer agar tetap aman dan stabil.' },
        { title: 'System Administrator', desc: 'Mengatur server dan sistem operasi agar sistem IT berjalan optimal.' }
    ],
    'Sistem Informasi': [
        { title: 'System Analyst', desc: 'Menganalisis kebutuhan sistem dan merancang solusi berbasis teknologi.' },
        { title: 'Business Analyst', desc: 'Menghubungkan kebutuhan bisnis dengan solusi sistem informasi.' },
        { title: 'IT Project Manager', desc: 'Mengelola proyek teknologi dari perencanaan hingga implementasi.' }
    ],
    'Ilmu Komunikasi': [
        { title: 'Public Relations (PR) Officer', desc: 'Menjaga citra dan hubungan baik organisasi dengan masyarakat.' },
        { title: 'Content Creator / Social Media Specialist', desc: 'Membuat konten kreatif untuk media sosial dan strategi komunikasi digital.' },
        { title: 'Jurnalis', desc: 'Mengumpulkan, menulis, dan menyampaikan berita kepada publik.' }
    ],
    'Hukum': [
        { title: 'Advokat / Pengacara', desc: 'Memberikan bantuan hukum dan pendampingan di pengadilan.' },
        { title: 'Notaris', desc: 'Membuat dan mengesahkan dokumen hukum resmi.' },
        { title: 'Legal Officer', desc: 'Menangani urusan hukum dan perizinan dalam perusahaan.' }
    ],
    'Bisnis Digital': [
        { title: 'Digital Marketing Specialist', desc: 'Mempromosikan produk melalui media digital seperti media sosial dan iklan online.' },
        { title: 'E-Commerce Manager', desc: 'Mengelola toko online dan strategi penjualan digital.' },
        { title: 'Product Manager Digital', desc: 'Mengembangkan produk digital sesuai kebutuhan pasar.' }
    ],
    'Manajemen': [
        { title: 'Manajer Operasional', desc: 'Mengatur kegiatan operasional agar perusahaan berjalan efisien.' },
        { title: 'Human Resource (HR) Officer', desc: 'Mengelola rekrutmen, pelatihan, dan kesejahteraan karyawan.' },
        { title: 'Business Consultant', desc: 'Memberi saran strategi bisnis untuk meningkatkan kinerja perusahaan.' }
    ],
    'Akuntansi': [
        { title: 'Forensik Accountant', desc: 'Menyelidiki tindak kriminal ekonomi.' },
        { title: 'Finansial Analyst', desc: 'Menganalisis data keuangan.' },
        { title: 'Konsultan Pajak', desc: 'Memberi nasihat kepada perusahaan atau individu tentang cara mengolah pajak.' }
    ],
    'Kewirausahaan': [
        { title: 'Entrepreneur', desc: 'Membuka dan mengelola bisnis sendiri, startup, mandiri UMKM.' },
        { title: 'Sosial Entrepreneur', desc: 'Membangun usaha dengan tujuan sosial (komunitas, usaha sosial).' },
        { title: 'Konsultan Bisnis', desc: 'Memberi saran bisnis, pemasaran dan pengembangan perusahaan.' }
    ],
    'Kebidanan': [
        { title: 'Bidan Praktik Mandiri', desc: 'Memberikan pelayanan kehamilan dan persalinan secara mandiri.' },
        { title: 'Bidan Rumah Sakit', desc: 'Mendampingi persalinan dan perawatan ibu serta bayi.' },
        { title: 'Penyuluh Kesehatan Ibu dan Anak', desc: 'Memberikan edukasi kesehatan kepada masyarakat.' }
    ],
    'Fisioterapi': [
        { title: 'Fisioterapis Rumah Sakit', desc: 'Membantu pasien memulihkan fungsi gerak akibat cedera atau penyakit.' },
        { title: 'Fisioterapis Olahraga', desc: 'Menangani cedera atlet dan meningkatkan performa fisik.' },
        { title: 'Terapis Rehabilitasi Medik', desc: 'Mendampingi pasien pasca operasi atau stroke.' }
    ],
    'Arsitektur': [
        { title: 'Arsitek Profesional', desc: 'Merancang desain bangunan dan mengawasi proses konstruksi.' },
        { title: 'Properti Developer', desc: 'Mengembangkan proyek properti (perusahaan properti, wirausaha).' },
        { title: 'Interior Design', desc: 'Mendesain interior dalam rumah (perusahaan desain interior, freelance).' }
    ],
    'Geografi': [
        { title: 'Ahli Lingkungan', desc: 'Menganalisis dampak lingkungan (Pemerintah).' },
        { title: 'Surveyor Lapangan', desc: 'Melakukan pengukuran dan pemetaan lapangan (Konstruksi, penambangan, kehutanan).' },
        { title: 'Perencanaan Tata Ruang', desc: 'Merancang tata kota, wilayah, dan penggunaan lahan (Pemerintah daerah).' }
    ],
    'Perencanaan Wilayah dan Kota': [
        { title: 'Pegawai Pemerintah PUPR/BUMN', desc: 'Mengelola kebijakan tata ruang pembangunan dan infrastruktur.' },
        { title: 'Perencana Wilayah', desc: 'Mengatur lahan dan pembangunan kawasan (Kementrian ATR, BPN, pemerintah daerah).' },
        { title: 'Ahli Transportasi Perkotaan', desc: 'Merancang transportasi publik (Lembaga internasional, konsultan swasta).' }
    ]
};