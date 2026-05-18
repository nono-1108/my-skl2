const { createApp } = Vue;

axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

createApp({
    data() {
        return {
            apiURL: 'http://10.139.10.57:5000/api/skl',
            searchQuery: '',
            filterProdi: '', 
            dataList: [],
            form: {
                id: null,
                jurusan: '',
                program_studi: '',
                nomor_surat: '',
                nama_mahasiswa: '',
                nim: '',
                tempat_lahir: '',
                tanggal_lahir: '',
                tanggal_lulus: '',
                judul_tugas_akhir: '',
                nin: '',
                nomor_transkrip: '',
                ipk: '',
                predikat: '',
                tanggal_pembuatan_surat: new Date().toISOString().slice(0, 10)
            }
        }
    },
    
    computed: {
        filteredData() {
            return this.dataList.filter(item => {
                // 1. Cek apakah teks pencarian cocok dengan NIM atau Nama
                const cocokPencarian = item.nim.includes(this.searchQuery) || 
                                       item.nama_mahasiswa.toLowerCase().includes(this.searchQuery.toLowerCase());
                
                // 2. Cek apakah program studi cocok dengan dropdown (jika kosong, tampilkan semua)
                const cocokProdi = this.filterProdi === '' || item.program_studi === this.filterProdi;

                // Tampilkan data HANYA JIKA kedua syarat di atas terpenuhi
                return cocokPencarian && cocokProdi;
            });
        }
    },
    
    methods: {
        async loadData() {
            try {
                const response = await axios.get(this.apiURL);
                const dataDariBackend = response.data.data;
                this.dataList = Array.isArray(dataDariBackend) ? dataDariBackend : [];
            } catch (error) {
                console.error('Error loading data:', error);
                this.dataList = [];
                alert('Gagal memuat data. Pastikan server backend sudah berjalan.');
            }
        },

        async saveData() {
            try {
                const dataYangDikirim = { ...this.form };
                const idData = dataYangDikirim.id;
                
                delete dataYangDikirim.id; 

                if (idData) {
                    await axios.put(`${this.apiURL}/${idData}`, dataYangDikirim);
                    alert("Data berhasil diperbarui!");
                } else {
                    await axios.post(this.apiURL, dataYangDikirim);
                    alert("Data berhasil disimpan!");
                }

                this.clearForm();
                this.loadData();
            } catch (error) {
                const pesanError = error.response?.data?.message || "Gagal menyimpan/memperbarui. Pastikan server backend sudah menyala.";
                alert(pesanError);
                console.error("Detail Error:", error);
            }
        },

        editData(item) {
            this.form = {...item};
        },
        
        async deleteData() {
            if(confirm('Yakin hapus data ini?')) {
                try {
                    await axios.delete(`${this.apiURL}/${this.form.id}`);
                    alert("Data berhasil dihapus");
                    this.clearForm();
                    this.loadData();
                } catch (error) {
                    alert("Gagal hapus data");
                }
            }
        },
        
        cetakPDF(id) {
            window.open(`${this.apiURL}/cetak/${id}`, '_blank');
        },
        
        clearForm() {
            this.form = {
                id: null,
                jurusan: '',
                program_studi: '',
                tanggal_pembuatan_surat: new Date().toISOString().slice(0, 10)
            };
        },
        
        resetProdi() {
            this.form.program_studi = '';
        }, 

        exportExcel() {
            if (this.filteredData.length === 0) {
                alert("Tidak ada data untuk diekspor!");
                return;
            }

            const dataSiapExport = this.filteredData.map((item, index) => ({
                "No": index + 1,
                "NIM": item.nim,
                "Nama Mahasiswa": item.nama_mahasiswa,
                "Jurusan": item.jurusan,
                "Program Studi": item.program_studi,
                "Tempat Lahir": item.tempat_lahir,
                "Tanggal Lahir": item.tanggal_lahir,
                "Nomor Surat SKL": item.nomor_surat,
                "Tanggal Surat": item.tanggal_pembuatan_surat,
                "Judul Tugas Akhir": item.judul_tugas_akhir,
                "Tanggal Lulus": item.tanggal_lulus,
                "NIN (No Ijasah)": item.nin,
                "Nomor Transkrip": item.nomor_transkrip,
                "IPK": item.ipk,
                "Predikat": item.predikat
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataSiapExport);
            const workbook = XLSX.utils.book_new();
            
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Lulusan");
            XLSX.writeFile(workbook, "Rekap_Data_SKL_Mahasiswa.xlsx");
        },

        triggerFileInput() {
            this.$refs.fileInput.click(); 
        },

        async processFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                    if (excelData.length === 0) {
                        alert("File Excel kosong atau format tidak sesuai!");
                        this.$refs.fileInput.value = ''; 
                        return;
                    }

                    if(!confirm(`Ditemukan ${excelData.length} baris data. Mulai proses import ke database?`)) {
                        this.$refs.fileInput.value = ''; 
                        return;
                    }

                    let successCount = 0;
                    let failCount = 0;

                    for (const row of excelData) {
                        const payload = {
                            nim: row["NIM"] || '',
                            nama_mahasiswa: row["Nama Mahasiswa"] || '',
                            jurusan: row["Jurusan"] || '',
                            program_studi: row["Program Studi"] || '',
                            tempat_lahir: row["Tempat Lahir"] || '',
                            tanggal_lahir: row["Tanggal Lahir"] || null, 
                            nomor_surat: row["Nomor Surat SKL"] || '',
                            tanggal_pembuatan_surat: row["Tanggal Surat"] || new Date().toISOString().slice(0, 10),
                            judul_tugas_akhir: row["Judul Tugas Akhir"] || '',
                            tanggal_lulus: row["Tanggal Lulus"] || null,
                            nin: row["NIN (No Ijasah)"] || '',
                            nomor_transkrip: row["Nomor Transkrip"] || '',
                            ipk: row["IPK"] ? parseFloat(row["IPK"]) : 0, 
                            predikat: row["Predikat"] || ''
                        };

                        try {
                            await axios.post(this.apiURL, payload);
                            successCount++;
                        } catch (err) {
                            console.error("Gagal menyimpan data NIM:", row["NIM"], err);
                            failCount++;
                        }
                    }

                    alert(`Proses Import Selesai!\nBerhasil tersimpan: ${successCount} data\nGagal: ${failCount} data`);
                    this.loadData(); 
                    
                } catch (error) {
                    alert("Gagal membaca file Excel. Pastikan formatnya benar.");
                    console.error(error);
                } finally {
                    this.$refs.fileInput.value = ''; 
                }
            };
            
            reader.readAsArrayBuffer(file);
        }
    }, 
    mounted() {
        const statusLogin = localStorage.getItem('skl_logged_in');
        
        if (statusLogin !== 'true') {
            window.location.href = 'login.html';
        } else {
            this.loadData();
        }
    }
}).mount('#app');