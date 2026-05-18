const supabase = require('../config/db');
const puppeteer = require('puppeteer');
const fs = require('fs');     
const path = require('path'); 

const getAllSkl = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('skl_mahasiswa')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        res.status(200).json({ status: 'success', data: data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const createSkl = async (req, res) => {
    try {
        // --- 1. PENJAGA DATA GANDA (TAMBAHAN BARU) ---
        // Kita cek dulu apakah NIM ini sudah ada di tabel 'skl_mahasiswa'
        const { data: cekData, error: errorCek } = await supabase
            .from('skl_mahasiswa') 
            .select('nim')
            .eq('nim', req.body.nim);

        if (errorCek) throw errorCek; // Jika gagal ngecek, lempar ke catch

        // Jika array cekData ada isinya (NIM ketemu), tolak proses simpan!
        if (cekData && cekData.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Peringatan: Data dengan NIM ${req.body.nim} sudah terdaftar di sistem!`
            });
        }
        // ---------------------------------------------

        // --- 2. PROSES SIMPAN (KODE ASLI ANDA) ---
        const { data, error } = await supabase
            .from('skl_mahasiswa')
            .insert([req.body])
            .select();

        if (error) throw error;

        res.status(201).json({
            status: 'success',
            message: 'Data berhasil disimpan',
            data: data
        });
        // -----------------------------------------

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
const cetakSkl = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase.from('skl_mahasiswa').select('*').eq('id', id).single();
        if (error || !data) throw error || new Error("Data tidak ditemukan");
        
        const upper = (str) => str ? str.toUpperCase() : '-';
        
        const formatDateUpper = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            const bulan = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
            return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
        };

        
        const formatDateNormal = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            const bulan = ['Januari','Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']; 
            return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
        };
        
        const formatBesarKecil = (teks) => {
            if (!teks) return '-';
            return teks.toLowerCase().split(' ').map(kata => 
                kata.charAt(0).toUpperCase() + kata.substring(1)
            ).join(' ');
        };

        let logoBase64 = '';
        let fibaaBase64 = '';
        let bluBase64 = '';
        
        try {
            
            const logoPath = path.resolve(__dirname, '../assets/logo-unej.png');
            if (fs.existsSync(logoPath)) {
                const logoData = fs.readFileSync(logoPath);
                logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            }
            
            const fibaaPath = path.resolve(__dirname, '../assets/fibaa.png');
            if (fs.existsSync(fibaaPath)) {
                const fibaaData = fs.readFileSync(fibaaPath);
                fibaaBase64 = `data:image/png;base64,${fibaaData.toString('base64')}`;
            }
            
            const bluPath = path.resolve(__dirname, '../assets/BLU.png');
            if (fs.existsSync(bluPath)) {
                const bluData = fs.readFileSync(bluPath);
                bluBase64 = `data:image/png;base64,${bluData.toString('base64')}`;
            }
        } catch (err) {
            console.error("Gagal memuat logo:", err);
        }
       
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; line-height: 1.5; color: #000; padding: 0; margin: 0; position: relative; min-height: 100vh; }
            p { margin-top: 5px; margin-bottom: 5px; }

            /* KOP SURAT */
            .kop-surat { width: 100%; border-bottom: 3px solid black; margin-bottom: 20px; padding-bottom: 10px; }
            .kop-surat td { vertical-align: middle; text-align: center; }
            .kop-logo { width: 15%; }
            .kop-logo img { width: 100px; } /* Lebar logo */
            .kop-text { line-height: 1.1; }
            .kementerian { font-size: 16pt; }
            .sains { font-size: 16pt; }
            .univ { font-size: 14pt; font-weight: bold; }
            .fakultas { font-size: 14pt; font-weight: bold; }
            .alamat { font-size: 11pt; }

            /* HEADER SURAT */
            .header { text-align: center; margin-bottom: 20px; line-height: 1.2; }
            .header h3 { margin: 0; text-decoration: underline; font-size: 14pt; font-weight: bold;}
            .header p { margin: 0; }
                
            /* TABEL DATA */
            .content table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; }
            table-layout: fixed;
            .content table td { padding: 3px 0; vertical-align: top; }
            .col-1 { width: 30%; }
            .col-2 { width: 3%; text-align: left; }
            .col-3 { width: 66%; text-align: justify;}

            /* AREA TANDA TANGAN */
            .signature-section { margin-top: 15px; width: 100%; }
            .photo-box { border: 1px solid #000; width: 3cm; height: 4cm; float: left; margin-left: 110px; display: table; margin-top: 10px; }
            .photo-text { display: table-cell; vertical-align: middle; text-align: center; font-size: 10pt; line-height: 1.2; }
            .signature { float: right; width: 40%; padding-left: 20px; }
            .clearfix::after { content: ""; clear: both; display: table; }

            /* =====================================
               CSS UNTUK FOOTER LOGO FIBAA & BLU 
               ===================================== */
            .footer-surat {
                width: 100%;
                position: absolute;
                bottom: 10px; /* Jarak logo dari tepi bawah kertas */
                left: 0;
                display: flex;
                justify-content: space-between; /* Membuat satu di kiri, satu di kanan */
                align-items: center;
                padding: 0px 8px; /* Jarak dari margin kiri dan kanan */
                box-sizing: border-box;
            }
            .logo-kiri {
                height: 70px; 
                object-fit: contain;
                
            }
            .logo-kanan {
                height: 70px; /* Sesuaikan ukuran logo BLU di sini */
                object-fit: contain;
                
            }
            </style>
        </head>
        <body>
            <table class="kop-surat">
                <tr>
                    <td class="kop-logo">
                        <img src="${logoBase64}" alt="Logo Universitas Jember" style="width: 120px;">
                    </td>
                    <td class="kop-text">
                        <span class="kementerian">KEMENTERIAN PENDIDIKAN TINGGI,</span><br>
                        <span class="sains">SAINS, DAN TEKNOLOGI</span><br>
                        <span class="univ">UNIVERSITAS JEMBER</span><br>
                        <span class="fakultas">FAKULTAS EKONOMI DAN BISNIS</span><br>
                        <span class="alamat">Jl. Kalimantan 37 - Kampus Bumi Tegal Boto Kotak Pos 159 Jember 68121<br>
                        Telepon 0331-337990 Faximile 0331-332150<br>
                        Email: feb@unej.ac.id Laman: www.feb.unej.ac.id</span>
                    </td>
                </tr>
            </table>

            <div class="header">
                <h3>SURAT KETERANGAN LULUS</h3>
                <p>Nomor: ${data.nomor_surat || '......'}/DST/UN25.B4/LL/2026</p>
            </div>
            
            <p>Dekan Fakultas Ekonomi dan Bisnis menerangkan dengan sebenarnya, bahwa :</p>
            
            <table class="content">
    <tr><td class="col-1">Nama</td><td class="col-2">:</td><td class="col-3">${formatBesarKecil(data.nama_mahasiswa)}</td></tr>
    
    <tr><td>NIM</td><td>:</td><td>${data.nim || '-'}</td></tr>
    
    <tr><td>Jurusan</td><td>:</td><td>${formatBesarKecil(data.jurusan)}</td></tr>
    <tr><td>Program Studi</td><td>:</td><td>${formatBesarKecil(data.program_studi)}</td></tr>
    <tr><td>Tempat/ Tgl. Lahir</td><td>:</td><td>${formatBesarKecil(data.tempat_lahir)}, ${formatBesarKecil(formatDateNormal(data.tanggal_lahir))}</td></tr>
    
    <tr><td>Judul Tugas Akhir</td><td>:</td><td>${data.judul_tugas_akhir ? data.judul_tugas_akhir.toUpperCase() : '-'}</td></tr>
    
    <tr><td>No. Ijasah Nasional</td><td>:</td><td>${data.nin || '-'}</td></tr>
    <tr><td>No. Transkrip Nilai</td><td>:</td><td>${data.nomor_transkrip || '-'}</td></tr>
    <tr><td>IPK</td><td>:</td><td>${data.ipk || '-'}</td></tr>
    
    <tr><td>Predikat Kelulusan</td><td>:</td><td>${formatBesarKecil(data.predikat)}</td></tr>
</table>
            </div>

            <p style="text-align: justify; margin-top: 15px;">Berdasarkan Berita Acara Ujian tanggal ${formatDateNormal(data.tanggal_lulus)}, yang bersangkutan telah dinyatakan "LULUS" pada Jurusan ${data.jurusan} Program Studi ${data.program_studi} dan berhak mengikuti pelaksanaan wisuda. Ijasah dan Transkrip nilai masih dalam proses penyelesaian oleh Fakultas Ekonomi dan Bisnis Universitas Jember. Surat ini berlaku selama 3 (tiga) bulan sejak diterbitkan.</p>
            <p style="text-align: justify;">Demikian Surat Keterangan ini dibuat agar dapat dipergunakan sebagaimana mestinya.</p>
            
            <div class="signature-section clearfix">
                <div class="photo-box">
                    <div class="photo-text">Pas Photo<br>hitam putih<br>3x4</div>
                </div>

                <div class="signature">
                    <p>Jember, ${formatDateNormal(data.tanggal_pembuatan_surat)}<br>Dekan,</p>
                    <br><br><br>
                    <p style="margin: 0;"><b>Prof. Dr. Isti Fadah, M.Si.</b></p>
                    <p style="margin: 0;">NIP. 196610201990022001</p>
                </div>
            </div>

        <div class="footer-surat">
            <img src="${fibaaBase64}" alt="Logo FIBAA" class="logo-kiri">
            <img src="${bluBase64}" alt="Logo BLU" class="logo-kanan">
        </div>
        
        </body>
        </html>
        `;

        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', right: '2.2cm', bottom: '0cm', left: '2.2cm' } 
        });
        
            await browser.close();

        res.setHeader('Content-Disposition', `inline; filename="SKL_${data.nim}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error cetak PDF:", error);
        res.status(500).json({ status: 'error', message: "Gagal mencetak PDF" });
    }
};

const deleteSkl = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('skl_mahasiswa')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        
        if (data.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Data berhasil dihapus',
            data: data
        });
    } catch (error) {
        console.error("Error menghapus data:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const updateSkl = async (req, res) => {
    try {
        const { id } = req.params;

        // Proses memperbarui data di Supabase berdasarkan ID
        const { data, error } = await supabase
            .from('skl_mahasiswa')
            .update(req.body) // req.body berisi data baru dari form
            .eq('id', id)
            .select();

        if (error) throw error;

        // Jika data yang mau diupdate tidak ditemukan
        if (data.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Data berhasil diperbarui',
            data: data
        });
    } catch (error) {
        console.error("Error update data:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { getAllSkl, createSkl, cetakSkl, deleteSkl, updateSkl };