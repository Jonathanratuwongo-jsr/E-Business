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
  discountAmount?: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscount?: number;
  voucherCode?: string;
  loyaltyPointsEarned?: number;
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

// ==================== CRM TYPES ====================
export type CustomerSegment = 'Pelanggan Baru' | 'Pelanggan Loyal' | 'Pelanggan Tidak Aktif';

export interface RetentionActivity {
  id: string;
  type: 'email_follow_up' | 'voucher_sent' | 'loyalty_bonus' | 'note';
  title: string;
  description: string;
  createdAt: string;
  channel?: 'Email' | 'WhatsApp' | 'Sistem';
  status: 'Terkirim' | 'Digunakan' | 'Tercatat';
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  joinedAt: string;
  segment: CustomerSegment;
  segmentReason: string;
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  loyaltyPoints: number;
  tags: string[];
  notes: string;
  retentionActivities: RetentionActivity[];
}

export interface SegmentInfo {
  segment: CustomerSegment;
  count: number;
  percentage: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  ruleTitle: string;
  ruleDescription: string;
  recommendedAction: string;
}

export interface CRMMetrics {
  totalCustomers: number;
  activeOrderingCustomers: number;
  repeatCustomers: number;
  repeatPurchaseRate: number; // e.g. 50%
  averageOrderValue: number; // AOV in Rupiah
  totalRevenue: number;
  totalOrders: number;
  totalLoyaltyPointsIssued: number;
  totalLoyaltyPointsRedeemed: number;
  segmentBreakdown: SegmentInfo[];
}

export interface RetentionVoucher {
  code: string;
  name: string;
  discountType: 'fixed' | 'percent';
  discountValue: number; // nominal atau persen
  maxDiscount?: number;
  minSpend: number;
  targetSegment: CustomerSegment | 'Semua';
  description: string;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
}
