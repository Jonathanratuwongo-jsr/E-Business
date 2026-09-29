export type ConditionGrade = 'Grade A+' | 'Grade A' | 'Grade B' | 'Grade C';

export interface QCReport {
  batteryHealth?: number; // e.g. 89%
  cycleCount?: number;
  shutterCount?: number;
  imeiStatus: 'Terdaftar Kemenperin' | 'Resmi Bea Cukai' | 'WiFi Only' | 'N/A';
  screenCondition: 'Mulus 100% No Scratch' | 'Layar Mulus No Shadow' | 'Micro Scratch Halus';
  bodyCondition: 'Mulus Seperti Baru 99%' | 'Mulus 95% Pemakaian Wajar' | 'Dent Halus di Sudut';
  cameraFunction: '100% Normal & Jernih';
  speakersMicrophone: '100% Normal Bersuara Jernih';
  faceIdFingerprint: '100% Normal Aktif';
  accessories: string; // e.g., 'Fullset Box Original + Adaptor 20W'
  warrantyDays: number; // e.g. 90
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: 'Smartphone' | 'Laptop' | 'Kamera' | 'Tablet' | 'Audio' | 'Gaming';
  grade: ConditionGrade;
  originalPrice: number;
  price: number;
  stock: number;
  image: string;
  gallery: string[];
  description: string;
  qc: QCReport;
  specs: { [key: string]: string };
  badge?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Menunggu Pembayaran' | 'Sudah Dibayar' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan';

export type MidtransPaymentType =
  | 'qris'
  | 'bca_va'
  | 'mandiri_va'
  | 'bni_va'
  | 'bri_va'
  | 'permata_va'
  | 'cimb_va'
  | 'bsi_va'
  | 'credit_card';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  courier: string;
  trackingNumber?: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    grade: ConditionGrade;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shippingCost: number;
  insuranceCost: number;
  total: number;
  status: OrderStatus;
  paymentType: MidtransPaymentType;
  midtransTransactionId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
}
