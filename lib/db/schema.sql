-- Cloudflare D1 SQL Schema for TechSecond ID (E-Commerce Elektronik Bekas)
-- Jalankan perintah ini menggunakan wrangler CLI:
-- wrangler d1 execute <DATABASE_NAME> --file=./schema.sql

-- 1. Table Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table Products (Barang Elektronik Bekas)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Smartphone', 'Laptop', 'Kamera', 'Tablet', 'Audio', 'Gaming'
  grade TEXT NOT NULL, -- 'Grade A+', 'Grade A', 'Grade B', 'Grade C'
  original_price INTEGER NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 1,
  image TEXT NOT NULL,
  gallery TEXT, -- JSON array of image URLs
  description TEXT,
  badge TEXT,
  specs TEXT, -- JSON key-value specs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table QC Reports (35-Titik Pengecekan Barang Bekas)
CREATE TABLE IF NOT EXISTS qc_reports (
  product_id TEXT PRIMARY KEY,
  battery_health INTEGER, -- % Baterai (misal 92%)
  cycle_count INTEGER,
  shutter_count INTEGER,
  imei_status TEXT, -- 'Terdaftar Kemenperin', 'Resmi Bea Cukai', 'N/A'
  screen_condition TEXT,
  body_condition TEXT,
  camera_function TEXT,
  speakers_microphone TEXT,
  face_id_fingerprint TEXT,
  accessories TEXT,
  warranty_days INTEGER DEFAULT 30,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Table Orders (Transaksi Penjualan & Midtrans Payment)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  courier TEXT NOT NULL,
  tracking_number TEXT,
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER NOT NULL,
  insurance_cost INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Menunggu Pembayaran',
  payment_type TEXT NOT NULL, -- 'qris', 'bca_va', 'mandiri_va', 'bni_va', 'credit_card'
  midtrans_transaction_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  grade TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Indexing for fast search and filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_grade ON products(grade);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
