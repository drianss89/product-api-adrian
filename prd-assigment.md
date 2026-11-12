# Product Requirements Document (PRD)
**Judul Proyek:** Implementasi Interaktivitas & Asynchronous Data Handling pada E-Commerce Product Detail (Phase 2)  
**Basis Repository:** `api-product` (Melanjutkan Study Case Phase 1: `project-AI/index.html` & `project-AI/frontend/`)  
**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS / Tailwind CSS, Lodash `4.18.1`, dan Baseline REST API (`api-product`)

---

## 1. Tujuan & Ruang Lingkup Proyek

### 1.1 Tujuan Utama
Menambahkan fitur interaktivitas berbasis manipulasi DOM, event handling, validasi input, dan manajemen state asynchronous (Fetch API) pada dua halaman detail produk yang telah dibuat pada Study Case Phase 1 tanpa mengganti arsitektur backend maupun endpoint baseline.

### 1.2 Batasan Ruang Lingkup (Out of Scope)
* **Tidak** membuat website, backend, database, atau endpoint API baru di luar repository baseline `api-product`.
* **Tidak** mengimplementasikan fitur checkout penuh atau penyimpanan keranjang ke database (state keranjang bersifat lokal di sisi klien/memory).
* **Tidak** menaruh API key, token, atau credential rahasia pada kode frontend maupun repository publik.

---

## 2. Spesifikasi Halaman & Integrasi Study Case Phase 1
Sistem wajib mempertahankan kedua halaman detail produk dari Phase 1 beserta sumber datanya masing-masing:

| Halaman | Lokasi File Baseline | Sumber Data | Mekanisme Rendering |
| :--- | :--- | :--- | :--- |
| **Halaman 1: Static / Hardcoded Product** | `project-AI/index.html` (`script.js`, `styles.css`) | Data statis (hardcoded) pada kode frontend | Render langsung saat DOM dimuat, diperbarui secara reaktif melalui event listener. |
| **Halaman 2: API-Driven Product** | `project-AI/frontend/index.html` (`src/main.js`, `src/api/products.js`, `src/lib/product.js`) | Endpoint REST API baseline (`api-product`) | Asynchronous `fetch` dengan siklus *Loading* → *Success Render* atau *Error State* (+ *Retry*). |

---

## 3. Kebutuhan Fungsional (Functional Requirements)

### 3.1 Interaksi DOM & Kalkulasi Dinamis (Berlaku di Kedua Halaman)
1. **Pemilihan Variasi Produk (`Variant Selection`)**
   * Pengguna dapat memilih opsi variasi produk sesuai data dari sumber masing-masing.
   * Perubahan variasi memperbarui status variasi aktif (harga varian jika berbeda dan label variasi terpilih) serta menghitung ulang subtotal secara otomatis.
2. **Pengaturan & Validasi Kuantitas (`Quantity Input`)**
   * Pengguna dapat mengubah jumlah pembelian melalui form input angka atau tombol kontrol (`+` / `-`).
   * **Aturan Validasi Ketat:**
     * Nilai wajib berupa **bilangan bulat positif** (`integer >= 1`).
     * Nilai **tidak boleh melebihi total stok** yang tersedia pada data sumber.
     * Jika API baseline tidak menyediakan stok per variasi, sistem wajib menggunakan **stok total** dan dilarang mengasumsikan pembagian stok per variasi.
   * **Penolakan Input Invalid:** Jika pengguna memasukkan `0`, angka negatif (`-1`), bilangan pecahan/desimal (`1.5`), teks non-numerik, atau angka di atas stok, sistem menolak perhitungan dan menampilkan pesan error validasi yang jelas menggunakan `textContent`.
3. **Pembaruan Ringkasan & Subtotal (`Live Summary`)**
   * Setiap perubahan variasi atau kuantitas yang valid langsung menghitung ulang `Subtotal = Harga Aktif × Quantity` dan memperbarui ringkasan pada DOM menggunakan `textContent`.
4. **Aksi Tambah ke Keranjang & Feedback UI (`Add to Cart Action`)**
   * Mengklik tombol aksi utama (*Add to Cart*) saat pilihan dan kuantitas valid akan:
     * Memperbarui indikator **Cart Count lokal** sesuai jumlah yang ditambahkan.
     * Menampilkan pesan feedback sukses (memuat nama produk, variasi, dan jumlah) pada halaman menggunakan `textContent`.
   * Mengklik tombol aksi saat kuantitas invalid akan memblokir penambahan ke cart dan menampilkan pesan validasi.

### 3.2 Asynchronous Data Handling (Khusus Halaman 2: `project-AI/frontend`)
1. **Proses Request Baseline (`Fetch API`)**
   * Menggunakan atau merapikan proses request asynchronous pada baseline (`async/await` dengan `fetch`, atau mempertahankan Promise chain baseline yang setara).
   * Mempertahankan endpoint, mapping response, dan credential handling baseline tanpa memicu request duplikat saat halaman dimuat.
2. **Manajemen State Asynchronous UI**
   * **Loading State:** Menampilkan indikator loading segera saat data sedang dimuat.
   * **Validasi HTTP (`response.ok`):** Memeriksa `response.ok` sebelum membaca `response.json()`. Jika status HTTP gagal (misal: `404` atau `500`), alur diarahkan ke penanganan error.
   * **Success Render:** Menghilangkan indikator loading dan merender nama, harga, gambar, deskripsi, pilihan variasi, serta stok dari response baseline ke DOM.
   * **Error State & Retry:** Jika jaringan atau request HTTP gagal, indikator loading **wajib dihilangkan**, error state ditampilkan dengan jelas, dan tersedia opsi **Retry** (request ulang) tanpa duplikasi event listener maupun request.

---

## 4. Kebutuhan Non-Fungsional & Standar Teknis
* **Event Listener Standard:** Semua event listener wajib dipasang menggunakan `addEventListener` (tanpa inline handler HTML).
* **Idempotensi Event & Request:** Proses *Retry* atau interaksi berulang tidak boleh memasang event listener berkali-kali maupun mengirim request API duplikat.
* **DOM Text Manipulation:** Pembaruan teks status, pesan validasi, ringkasan, dan subtotal wajib menggunakan `textContent`.
* **Utilitas Pendukung:** Memanfaatkan **Lodash `4.18.1`** sesuai standar tools assignment.

---

## 5. Matriks Kesesuaian Kriteria Penilaian (Rubrik 100 Poin)

| No | Aspek Penilaian | Bobot | Target Implementasi pada Sistem |
| :---: | :--- | :---: | :--- |
| **1** | **DOM dan event handling** | **20%** | Selector DOM terstruktur, seluruh interaksi dipasang via `addEventListener`, dan tidak terjadi duplicate listener saat re-render/retry. |
| **2** | **Fitur interaktif** | **20%** | Pemilihan variasi & quantity berjalan real-time, validasi bilangan bulat positif (`1 <= qty <= stok total`) akurat, subtotal & feedback UI diperbarui via `textContent`, serta cart count lokal bertambah sesuai pilihan. |
| **3** | **Asynchronous JavaScript** | **25%** | Request ke endpoint baseline berjalan tanpa duplikasi, menampilkan loading state saat fetch, memeriksa `response.ok` sebelum `.json()`, merender data saat sukses, serta menghapus loading dan menampilkan error state (+ retry) saat gagal. |
| **4** | **Integrasi Study Case Phase 1** | **15%** | Kedua halaman (`index.html` hardcoded & `frontend/` API-driven) tetap dipertahankan sesuai sumber data masing-masing tanpa membuat backend/endpoint baru dan tanpa kebocoran credential. |
| **5** | **Pengujian dan kualitas kode** | **10%** | Struktur kode bersih, modular, mudah dibaca, serta seluruh skenario pengujian (valid, invalid, gagal request, retry) terdokumentasi lengkap. |
| **6** | **README dan pengumpulan** | **10%** | README memuat penjelasan arsitektur, fitur interaksi, endpoint baseline, cara menjalankan, cara menguji, tabel hasil pengujian + screenshot, catatan penggunaan AI, serta link GitHub & commit terakhir. |
| | **Total Bobot** | **100%** | |

---

## 6. Skenario Pengujian Minimum (Acceptance Criteria)

| ID | Skenario Pengujian | Input / Kondisi | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Interaksi Halaman Hardcoded | Buka `project-AI/index.html`, ubah pilihan variasi & quantity ke `2`. | Data produk tampil lengkap; subtotal berubah menjadi `2 × harga variasi` secara otomatis via `textContent`. |
| **TC-02** | Validasi Quantity Invalid | Input quantity `0`, `-2`, `1.5`, atau angka `> stok total`. | Input ditolak dengan pesan validasi yang jelas; subtotal tidak valid tidak dihitung; tombol aksi tidak menambah cart. |
| **TC-03** | Aksi Tambah ke Cart Valid | Pilih variasi valid, input quantity `2` (`<= stok`), klik tombol aksi. | Pesan feedback sukses tampil; indikator `Cart Count` lokal bertambah `2`. |
| **TC-04** | Loading & Render Halaman API | Jalankan server `api-product`, buka halaman API-driven (`project-AI/frontend`). | Indikator loading muncul saat request berjalan, lalu hilang dan digantikan data produk dari endpoint baseline. |
| **TC-05** | Error Handling Request Gagal | Matikan server API atau akses endpoint dengan ID tidak valid (`404`). | Indikator loading hilang sepenuhnya; UI menampilkan pesan error state dengan jelas. |
| **TC-06** | Uji Retry Tanpa Duplikasi | Dari kondisi error (TC-05), aktifkan kembali server API lalu klik tombol *Retry*. | Hanya 1 request fetch dikirim; data ter-render normal; klik tombol aksi/variasi hanya memicu event 1 kali. |

---

## 7. Deliverables & Checklist Pengumpulan
1. **Repository GitHub Publik/Aksesibel Mentor:**
   * Kode halaman hardcoded (`project-AI/index.html`) dan API-driven (`project-AI/frontend/`) lengkap dengan interaksi DOM & status asynchronous.
   * Mencantumkan hash **commit terakhir** yang dinilai pada pengumpulan LMS.
2. **Dokumentasi `README.md`:**
   * Penjelasan perbedaan halaman hardcoded dan API-driven beserta endpoint baseline yang digunakan.
   * Penjelasan fitur interaksi, aturan validasi quantity/stok, dan mekanisme error handling (`response.ok`, loading, error, retry).
   * Langkah menjalankan aplikasi dan langkah pengujian.
   * Tabel pengujian berisi *Input/Kondisi*, *Expected Result*, *Actual Result*, dan *Screenshot/Output Browser*.
   * Catatan singkat mengenai penggunaan AI selama pengerjaan assignment.