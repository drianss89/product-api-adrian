# Product API

REST API CRUD produk dengan Express.js dan PostgreSQL, dilengkapi Swagger UI dan integration test.

## Tech Stack

- **Runtime**: Node.js LTS (ESM)
- **Framework**: Express.js
- **Database**: PostgreSQL (Docker)
- **Validasi**: Zod
- **Docs**: OpenAPI 3.1 + Swagger UI
- **Testing**: Vitest + Supertest

---

## Setup & Jalankan

### 1. Clone dan install dependencies

```bash
npm install
```

### 2. Copy environment variable

```bash
cp .env.example .env
```

Edit `.env` sesuai konfigurasi Docker kamu.

### 3. Jalankan PostgreSQL dengan Docker

```bash
docker-compose up -d
```

Ini akan membuat:
- `product_api_postgres` di port **5432** (development)
- `product_api_postgres_test` di port **5433** (testing)

### 4. Jalankan Migrasi

```bash
npm run migrate
```

### 5. Seed Data (opsional)

```bash
npm run seed
```

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`.

---

## Environment Variables

| Variable | Default | Keterangan |
|---|---|---|
| `PORT` | `3000` | Port HTTP server |
| `NODE_ENV` | `development` | Environment (`development`/`test`/`production`) |
| `DATABASE_URL` | - | PostgreSQL connection string (wajib) |
| `DATABASE_SSL` | `false` | Aktifkan SSL untuk koneksi database |
| `DATABASE_TEST_URL` | sama dgn DATABASE_URL | Database khusus untuk testing |

---

## API Endpoints

| Method | Endpoint | Keterangan | Response |
|---|---|---|---|
| GET | `/api/products` | Daftar semua produk | `200` + `{ data, meta }` |
| GET | `/api/products/:id` | Detail satu produk | `200` + `{ data, meta }` |
| POST | `/api/products` | Buat produk baru | `201` + header `Location` |
| PUT | `/api/products/:id` | Ganti seluruh data produk | `200` + `{ data, meta }` |
| DELETE | `/api/products/:id` | Hapus produk | `204 No Content` |
| GET | `/health` | Health check | `200` |
| GET | `/api-docs` | Swagger UI | HTML |
| GET | `/openapi.json` | Dokumen OpenAPI 3.1 | JSON |

Endpoint baseline yang digunakan frontend: `GET /api/products/:id` dan `GET /api/products`.

---

## Swagger UI

```
http://localhost:3000/api-docs
```

---

## Format Response

**Sukses** (`application/json; charset=utf-8`):
```json
{
  "data": { ... },
  "meta": {}
}
```

**Error** (`application/problem+json; charset=utf-8`) — RFC 9457:
```json
{
  "type": "https://api.example.com/problems/validation-error",
  "title": "Request validation failed",
  "status": 400,
  "detail": "One or more request fields are invalid",
  "instance": "/api/products",
  "errors": [
    { "field": "price", "message": "price must be >= 0" }
  ]
}
```

---

## Contoh Request

**POST /api/products**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Kaos Katun Polos","price":150000,"image":"https://example.com/kaos.png","variants":{"colorOrSize":["S","M","L"],"quantity":10},"description":"Kaos katun nyaman."}'
```

**GET /api/products/1**
```bash
curl http://localhost:3000/api/products/1
```

---

## Testing

```bash
npm run test:unit
npm run test:integration
npm test
npm run test:coverage
```

Integration test membutuhkan container `product_api_postgres_test` di port 5433.

---

## Struktur Proyek

```
src/
  app.js
  server.js
  config/
    env.js
    database.js
  routes/
    product.routes.js
    docs.routes.js
  controllers/
    product.controller.js
  services/
    product.service.js
  repositories/
    product.repository.js
  schemas/
    product.schema.js
  middlewares/
    validate-id.js
    validate-request.js
    not-found.js
    error-handler.js
  errors/
    app-error.js
  utils/
    product-response.js
migrations/
scripts/
tests/
  unit/
  integration/
openapi.yaml
docker-compose.yml
```

---

## Frontend

Dua halaman detail produk tersedia di folder `../project-AI/`:

### Perbedaan Halaman Hardcoded vs API-Driven

| Aspek | Halaman 1 — Hardcoded | Halaman 2 — API-Driven |
|---|---|---|
| Lokasi | `project-AI/index.html` + `script.js` | `project-AI/frontend/` (Vite app) |
| Sumber data | Objek `PRODUCT` statis di `script.js` | `GET http://localhost:3000/api/products/:id` |
| Produk | Essential Hoodie — Rp289.000 | Sesuai data di database (default ID 1) |
| Loading state | Tidak ada (data langsung tersedia) | Tampil saat fetch berlangsung |
| Error handling | Tidak diperlukan | Error state + tombol Retry |
| Render | Synchronous saat DOM siap | Async fetch → render setelah response |

### Fitur Interaksi (Berlaku di Kedua Halaman)

- **Variant Selection** — klik varian memperbarui status aktif dan menghitung ulang subtotal.
- **Quantity Control** — tombol `+`/`−` mengubah jumlah. Tombol `−` disabled di angka 1, tombol `+` disabled di angka maksimum stok.
- **Subtotal Otomatis** — `Subtotal = Harga × Quantity`, diperbarui via `textContent` setiap perubahan.
- **Validasi Quantity** — menolak nilai bukan bilangan bulat, < 1, atau > stok. Pesan error ditampilkan via `textContent`.
- **Add to Cart** — validasi dulu, lalu perbarui cart counter lokal dan tampilkan feedback nama + variasi + jumlah.

### Aturan Validasi Quantity

| Input | Hasil |
|---|---|
| Bilangan bulat, 1 ≤ qty ≤ stok | Valid, subtotal dihitung |
| `0` atau negatif | Ditolak — "Jumlah harus minimal 1." |
| Desimal (`1.5`) | Ditolak — "Jumlah harus berupa bilangan bulat." |
| Melebihi stok | Ditolak — "Jumlah melebihi stok (N)." |

### Mekanisme Error Handling — Halaman 2

1. Saat fetch dimulai → loading state ditampilkan.
2. `response.ok` diperiksa sebelum `response.json()`.
3. Jika request gagal → loading dihilangkan, error state tampil dengan pesan yang sesuai.
4. Tombol **Retry** tersedia; listener dipasang dengan `{ once: true }` sehingga tidak duplikat meski diklik berkali-kali.
5. Setiap Retry menggunakan `AbortController` baru, membatalkan request sebelumnya jika masih berjalan.

---

## Cara Menjalankan Frontend

### Halaman 1 — Hardcoded

Buka langsung di browser — tidak memerlukan server:

```
project-AI/index.html
```

Atau gunakan Live Server extension di VS Code.

### Halaman 2 — API-Driven

Pastikan API berjalan terlebih dahulu, lalu:

```bash
# Di folder project-AI/frontend/
npm install
npm run dev
```

Buka `http://localhost:5173` di browser. Navigasi ke produk manapun untuk melihat halaman detail dengan interaksi lengkap.

---

## Cara Menguji

### Pengujian Manual

| ID | Skenario | Langkah | Expected Result |
|---|---|---|---|
| TC-01 | Render halaman hardcoded | Buka `project-AI/index.html` | Data Essential Hoodie tampil; varian S dipilih aktif; subtotal = Rp289.000 |
| TC-02 | Variant selection hardcoded | Klik varian M | Varian M menjadi aktif, S tidak aktif |
| TC-03 | Quantity change & subtotal | Tambah quantity ke 2 | Subtotal berubah menjadi Rp578.000 |
| TC-04 | Validasi qty 0 | Kurangi ke batas minimum | Tombol `−` disabled; tidak bisa ke 0 |
| TC-05 | Validasi qty > stok | Set qty melebihi stok (12) | Tombol `+` disabled di angka 12 |
| TC-06 | Add to cart valid | Qty=2, klik Tambah ke tas | Toast muncul; cart counter bertambah 2 |
| TC-07 | Loading state API | Jalankan server, buka halaman detail di `frontend/` | "Memuat produk…" tampil sesaat |
| TC-08 | Success render API | Server aktif, produk tersedia | Data produk tampil; interaksi aktif |
| TC-09 | Variant selection API | Klik variasi berbeda | Variasi aktif berubah; subtotal diperbarui |
| TC-10 | Add to cart API | Qty valid, klik tambah | Feedback muncul; cart counter bertambah |
| TC-11 | Error state — server mati | Matikan server, buka halaman detail | Loading hilang; error state tampil; tombol Retry muncul |
| TC-12 | Retry tanpa duplikasi | Dari error, aktifkan server, klik Retry | Hanya 1 request dikirim; data ter-render normal |

### Automated Test

```bash
# Backend unit test
cd api-product && npm run test:unit

# Backend integration test (butuh Docker)
cd api-product && npm run test:integration

# Frontend test
cd project-AI/frontend && npm test
```

---

## Catatan Penggunaan AI

**Semua output AI ditinjau** bantuan AI hanya untuk berdiskusi, apapun outputnya tetap di crosscheck sebelum digunakan. Keputusan dan finishing tetap dilakukan secara manual.
