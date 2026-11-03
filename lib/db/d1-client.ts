import { Product, Order, OrderStatus, CustomerProfile, CustomerSegment, CRMMetrics, RetentionVoucher, RetentionActivity, SegmentInfo } from '../types';
import { INITIAL_PRODUCTS } from './initial-data';
import { INITIAL_ORDERS, INITIAL_VOUCHERS, SEGMENT_RULES } from './initial-crm-data';

// Singleton storage to persist state across hot reloads and server invocations
interface MemoryStore {
  products: Product[];
  orders: Order[];
  vouchers: RetentionVoucher[];
  customerNotes: Record<string, string>;
  customerTags: Record<string, string[]>;
  customerLoyaltyAdjustments: Record<string, number>;
  retentionActivities: Record<string, RetentionActivity[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __d1MemoryStore: MemoryStore | undefined;
}

if (!globalThis.__d1MemoryStore) {
  globalThis.__d1MemoryStore = {
    products: [...INITIAL_PRODUCTS],
    orders: [...INITIAL_ORDERS],
    vouchers: [...INITIAL_VOUCHERS],
    customerNotes: {
      'dewi.sartika@gmail.com': 'Pelanggan setia pecinta produk Apple. Selalu memilih pengiriman YES dan asuransi penuh.',
      'budi.santoso@gmail.com': 'Tertarik dengan aksesoris iPhone & perlengkapan audio.',
      'siti.rahma@gmail.com': 'Membeli kamera 2 bulan lalu. Perlu follow-up penawaran lensa atau promo winback.',
      'rian.pratama@gmail.com': 'Pernah order 2x tahun lalu, saat ini belum repeat order selama > 60 hari.',
    },
    customerTags: {
      'dewi.sartika@gmail.com': ['VIP', 'Apple Fan', 'High Spender'],
      'budi.santoso@gmail.com': ['Repeat Buyer', 'iPhone User'],
      'ahmad.fauzi@gmail.com': ['First Time Buyer', 'Tech Enthusiast'],
      'jessica.tan@gmail.com': ['MacBook User', 'Pelajar/Mahasiswa'],
      'siti.rahma@gmail.com': ['Kamera', 'Risk Churn'],
      'rian.pratama@gmail.com': ['At Risk', 'Surabaya'],
    },
    customerLoyaltyAdjustments: {
      'dewi.sartika@gmail.com': 300, // Extra VIP bonus points
    },
    retentionActivities: {
      'siti.rahma@gmail.com': [
        {
          id: 'act-01',
          type: 'email_follow_up',
          title: 'Follow-up Reaktivasi Kamera Sony',
          description: 'Mengirimkan email winback dengan rekomendasi aksesoris kamera dan voucher COMEBACK100.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          channel: 'Email',
          status: 'Terkirim',
        },
      ],
      'dewi.sartika@gmail.com': [
        {
          id: 'act-02',
          type: 'voucher_sent',
          title: 'Apresiasi Member Loyal VIP',
          description: 'Mengirimkan voucher diskon 10% eksklusif (LOYALVIP10) atas pencapaian transaksi ke-3.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          channel: 'Email',
          status: 'Terkirim',
        },
      ],
    },
  };
}

const store = globalThis.__d1MemoryStore;

export class D1Client {
  private isConfiguredCloudflare(): boolean {
    return Boolean(
      process.env.CLOUDFLARE_D1_DATABASE_ID &&
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_API_TOKEN
    );
  }

  // Get status info
  getStatus() {
    const isCloudflare = this.isConfiguredCloudflare();
    return {
      engine: isCloudflare ? 'Cloudflare D1 Production API' : 'Cloudflare D1 Local SQLite Storage',
      connected: true,
      databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID || 'd1-techsecond-id-prod',
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID ? 'Configured (Active)' : 'Default Sandbox',
      totalProducts: store.products.length,
      totalOrders: store.orders.length,
    };
  }

  // ==================== PRODUCTS ====================
  async getProducts(category?: string, grade?: string, query?: string): Promise<Product[]> {
    let list = [...store.products];

    if (category && category !== 'Semua') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (grade && grade !== 'Semua') {
      list = list.filter((p) => p.grade === grade);
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getProductById(id: string): Promise<Product | null> {
    const item = store.products.find((p) => p.id === id);
    return item || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    store.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    store.products[index] = {
      ...store.products[index],
      ...updates,
    };
    return store.products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    store.products.splice(index, 1);
    return true;
  }

  // ==================== ORDERS ====================
  async getOrders(): Promise<Order[]> {
    return [...store.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrderById(id: string): Promise<Order | null> {
    return store.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    const cleanEmail = email.toLowerCase().trim();
    return store.orders
      .filter((o) => o.customerEmail.toLowerCase().trim() === cleanEmail)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Perhitungan Poin Loyalitas yang didapat: 1 poin per Rp 10.000 belanja
    // Jika customer sudah loyal, berikan multiplier 1.5x
    const existingOrders = await this.getOrdersByEmail(orderData.customerEmail);
    const isLoyal = existingOrders.length >= 2;
    const basePoints = Math.floor(orderData.subtotal / 10000);
    const loyaltyPointsEarned = isLoyal ? Math.floor(basePoints * 1.5) : basePoints;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      loyaltyPointsEarned,
      createdAt: new Date().toISOString(),
    };

    store.orders.unshift(newOrder);

    // Decrease stock for items
    orderData.items.forEach((item) => {
      const prod = store.products.find((p) => p.id === item.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    // Catat penggunaan voucher jika ada
    if (newOrder.voucherCode) {
      const voucher = store.vouchers.find((v) => v.code === newOrder.voucherCode);
      if (voucher) {
        voucher.usageCount += 1;
      }
    }

    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<Order | null> {
    const order = store.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    return order;
  }

  // ==================== CRM ENGINE & SEGMENTATION ====================

  /**
   * Evaluasi aturan segmentasi yang jelas:
   * 1. Pelanggan Tidak Aktif:
   *    Aturan: Transaksi terakhir > 45 hari yang lalu tanpa pesanan baru.
   * 2. Pelanggan Loyal:
   *    Aturan: Order >= 2 kali DAN Akumulasi Belanja >= Rp 10.000.000.
   * 3. Pelanggan Baru:
   *    Aturan: Order = 1 atau terdaftar <= 30 hari.
   */
  evaluateCustomerSegment(
    customerOrders: Order[],
    joinedDate: Date
  ): { segment: CustomerSegment; reason: string } {
    if (customerOrders.length === 0) {
      return {
        segment: 'Pelanggan Baru',
        reason: 'Belum memiliki riwayat transaksi (Calon Pelanggan Baru terdaftar).',
      };
    }

    // Urutkan pesanan dari terbaru ke terlama
    const sorted = [...customerOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latestOrder = sorted[0];
    const latestDate = new Date(latestOrder.createdAt);
    const now = new Date();
    const daysSinceLastOrder = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    const totalOrdersCount = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.subtotal || o.total), 0);

    // Aturan 1: Pelanggan Tidak Aktif (Inactive / At-Risk Churn)
    // Syarat: Terakhir order > 45 hari yang lalu
    if (daysSinceLastOrder > 45) {
      return {
        segment: 'Pelanggan Tidak Aktif',
        reason: `Tidak ada transaksi baru selama ${daysSinceLastOrder} hari (> 45 hari tanpa order). Diperlukan kampanye winback reaktivasi.`,
      };
    }

    // Aturan 2: Pelanggan Loyal (Loyal / VIP)
    // Syarat: Order >= 2 kali DAN Akumulasi Belanja >= Rp 10.000.000 (atau order >= 3)
    if (totalOrdersCount >= 2 && totalSpent >= 10000000) {
      return {
        segment: 'Pelanggan Loyal',
        reason: `Melakukan ${totalOrdersCount} kali transaksi dengan total akumulasi belanja Rp ${totalSpent.toLocaleString('id-ID')} (≥ Rp 10 Juta). Berhak atas reward VIP & multiplier poin 1.5x.`,
      };
    }

    if (totalOrdersCount >= 3) {
      return {
        segment: 'Pelanggan Loyal',
        reason: `Telah melakukan ${totalOrdersCount} kali transaksi berulang. Loyalitas terbukti.`,
      };
    }

    // Aturan 3: Pelanggan Baru (New Customers)
    // Syarat: Order = 1 atau baru bertransaksi dalam <= 30 hari
    return {
      segment: 'Pelanggan Baru',
      reason: `Transaksi pertama berhasil dilakukan ${daysSinceLastOrder === 0 ? 'hari ini' : `${daysSinceLastOrder} hari lalu`}. Target retensi: Mendorong transaksi ke-2 dengan voucher onboarding.`,
    };
  }

  /**
   * Menghitung seluruh profil pelanggan dari pesanan dan data CRM
   */
  async getCustomers(segmentFilter?: string, query?: string): Promise<CustomerProfile[]> {
    // Kelompokkan orders berdasarkan customerEmail
    const customerMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      address: string;
      orders: Order[];
    }>();

    for (const order of store.orders) {
      const email = order.customerEmail.toLowerCase().trim();
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          name: order.customerName,
          email,
          phone: order.customerPhone,
          address: order.shippingAddress,
          orders: [],
        });
      }
      customerMap.get(email)!.orders.push(order);
    }

    const profiles: CustomerProfile[] = [];

    for (const [email, info] of customerMap.entries()) {
      const orders = info.orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const firstOrderDate = new Date(orders[orders.length - 1].createdAt);
      const lastOrderDate = orders[0].createdAt;
      const totalOrders = orders.length;
      const completedOrders = orders.filter((o) => o.status === 'Selesai' || o.status === 'Sudah Dibayar' || o.status === 'Dikirim').length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.subtotal || o.total), 0);
      const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

      // Evaluasi Segmen
      const { segment, reason } = this.evaluateCustomerSegment(orders, firstOrderDate);

      // Hitung Poin Loyalitas
      // Base: 1 poin per Rp 10.000 belanja
      const basePoints = Math.floor(totalSpent / 10000);
      const loyaltyMultiplier = segment === 'Pelanggan Loyal' ? 1.5 : 1.0;
      const calculatedPoints = Math.floor(basePoints * loyaltyMultiplier);
      const pointsAdjustment = store.customerLoyaltyAdjustments[email] || 0;
      const pointsUsed = orders.reduce((sum, o) => sum + (o.loyaltyPointsUsed || 0), 0);
      const loyaltyPoints = Math.max(0, calculatedPoints + pointsAdjustment - pointsUsed);

      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=18181b&color=ffffff&bold=true`;

      profiles.push({
        id: `crm-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: info.name,
        email,
        phone: info.phone,
        avatar,
        address: info.address,
        joinedAt: firstOrderDate.toISOString(),
        segment,
        segmentReason: reason,
        totalOrders,
        completedOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate,
        loyaltyPoints,
        tags: store.customerTags[email] || ['Member'],
        notes: store.customerNotes[email] || '',
        retentionActivities: store.retentionActivities[email] || [],
      });
    }

    // Filter by segment if requested
    let result = profiles;
    if (segmentFilter && segmentFilter !== 'Semua') {
      result = result.filter((p) => p.segment === segmentFilter);
    }

    // Filter by query if requested
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by total spending descending
    return result.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  /**
   * Mengambil detail pelanggan berdasarkan email
   */
  async getCustomerByEmail(email: string): Promise<{ customer: CustomerProfile; orders: Order[] } | null> {
    const cleanEmail = email.toLowerCase().trim();
    const allCustomers = await this.getCustomers();
    const customer = allCustomers.find((c) => c.email === cleanEmail);
    const orders = await this.getOrdersByEmail(cleanEmail);

    if (!customer) {
      // Jika pelanggan baru mendaftar (belum ada pesanan)
      const userJoined = new Date().toISOString();
      const fallbackCustomer: CustomerProfile = {
        id: `crm-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '-',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail)}&background=18181b&color=ffffff&bold=true`,
        address: '-',
        joinedAt: userJoined,
        segment: 'Pelanggan Baru',
        segmentReason: 'Pengguna baru terdaftar (Belum ada transaksi).',
        totalOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        loyaltyPoints: 50, // Bonus sambutan selamat datang
        tags: ['New Member'],
        notes: '',
        retentionActivities: [],
      };
      return { customer: fallbackCustomer, orders: [] };
    }

    return { customer, orders };
  }

  /**
   * Menghitung dashboard metrik CRM:
   * 1. Jumlah Pelanggan
   * 2. Repeat Purchase Rate (RPR)
   * 3. Rata-rata Nilai Order (AOV)
   * 4. Distribusi Segmen (Pelanggan Baru, Loyal, Tidak Aktif)
   */
  async getCRMMetrics(): Promise<CRMMetrics> {
    const customers = await this.getCustomers();
    const totalCustomers = customers.length;
    const orders = store.orders;
    const totalOrders = orders.length;

    // Pelanggan dengan pesanan >= 2 (Repeat Buyers)
    const repeatCustomers = customers.filter((c) => c.totalOrders >= 2).length;
    const activeOrderingCustomers = customers.filter((c) => c.totalOrders >= 1).length;

    // Repeat Purchase Rate (%) = (Repeat Customers / Total Ordering Customers) * 100
    const repeatPurchaseRate = activeOrderingCustomers > 0
      ? Math.round((repeatCustomers / activeOrderingCustomers) * 1000) / 10
      : 0;

    // Total Omzet / Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal || o.total), 0);

    // Average Order Value (AOV) = Total Revenue / Total Orders
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Total Loyalty Points
    const totalLoyaltyPointsIssued = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    const totalLoyaltyPointsRedeemed = orders.reduce((sum, o) => sum + (o.loyaltyPointsUsed || 0), 0);

    // Segment Breakdown (Minimal 3 Kelompok)
    const newCount = customers.filter((c) => c.segment === 'Pelanggan Baru').length;
    const loyalCount = customers.filter((c) => c.segment === 'Pelanggan Loyal').length;
    const inactiveCount = customers.filter((c) => c.segment === 'Pelanggan Tidak Aktif').length;

    const segmentBreakdown: SegmentInfo[] = [
      {
        segment: 'Pelanggan Baru',
        count: newCount,
        percentage: totalCustomers > 0 ? Math.round((newCount / totalCustomers) * 100) : 0,
        color: '#2563eb', // Blue
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        badgeBorder: 'border-blue-200',
        ruleTitle: SEGMENT_RULES.NEW.ruleTitle,
        ruleDescription: SEGMENT_RULES.NEW.ruleDescription,
        recommendedAction: SEGMENT_RULES.NEW.recommendedAction,
      },
      {
        segment: 'Pelanggan Loyal',
        count: loyalCount,
        percentage: totalCustomers > 0 ? Math.round((loyalCount / totalCustomers) * 100) : 0,
        color: '#16a34a', // Emerald/Green
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        badgeBorder: 'border-emerald-200',
        ruleTitle: SEGMENT_RULES.LOYAL.ruleTitle,
        ruleDescription: SEGMENT_RULES.LOYAL.ruleDescription,
        recommendedAction: SEGMENT_RULES.LOYAL.recommendedAction,
      },
      {
        segment: 'Pelanggan Tidak Aktif',
        count: inactiveCount,
        percentage: totalCustomers > 0 ? Math.round((inactiveCount / totalCustomers) * 100) : 0,
        color: '#dc2626', // Red
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-200',
        ruleTitle: SEGMENT_RULES.INACTIVE.ruleTitle,
        ruleDescription: SEGMENT_RULES.INACTIVE.ruleDescription,
        recommendedAction: SEGMENT_RULES.INACTIVE.recommendedAction,
      },
    ];

    return {
      totalCustomers,
      activeOrderingCustomers,
      repeatCustomers,
      repeatPurchaseRate,
      averageOrderValue,
      totalRevenue,
      totalOrders,
      totalLoyaltyPointsIssued,
      totalLoyaltyPointsRedeemed,
      segmentBreakdown,
    };
  }

  // ==================== RETENTION ACTIONS & VOUCHERS ====================

  async getRetentionVouchers(): Promise<RetentionVoucher[]> {
    return [...store.vouchers];
  }

  /**
   * Memvalidasi kode voucher retensi sesuai segmen pelanggan
   */
  async validatePromo(
    code: string,
    customerEmail: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount: number; message: string; voucher?: RetentionVoucher }> {
    const cleanCode = code.trim().toUpperCase();
    const voucher = store.vouchers.find((v) => v.code === cleanCode && v.isActive);

    if (!voucher) {
      return { valid: false, discount: 0, message: 'Kode promo tidak ditemukan atau sudah tidak aktif.' };
    }

    if (subtotal < voucher.minSpend) {
      return {
        valid: false,
        discount: 0,
        message: `Minimal belanja untuk promo ini adalah Rp ${voucher.minSpend.toLocaleString('id-ID')}.`,
      };
    }

    // Ambil segmen pelanggan
    const customerData = await this.getCustomerByEmail(customerEmail);
    const segment = customerData?.customer.segment || 'Pelanggan Baru';

    if (voucher.targetSegment !== 'Semua' && voucher.targetSegment !== segment) {
      return {
        valid: false,
        discount: 0,
        message: `Voucher ini eksklusif untuk segmen "${voucher.targetSegment}". Akun Anda saat ini masuk dalam segmen "${segment}".`,
      };
    }

    let discount = 0;
    if (voucher.discountType === 'fixed') {
      discount = voucher.discountValue;
    } else {
      discount = Math.round((subtotal * voucher.discountValue) / 100);
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    }

    return {
      valid: true,
      discount,
      message: `Berhasil! Kupon "${voucher.name}" terpasang. Hemat Rp ${discount.toLocaleString('id-ID')}.`,
      voucher,
    };
  }

  /**
   * Menjalankan aksi retensi: Kirim email follow-up / promo ke pelanggan
   */
  async sendRetentionEmail(
    customerEmail: string,
    templateType: 'welcome_onboarding' | 'loyal_vip_reward' | 'winback_reactivation' | 'custom',
    customTitle?: string,
    customMessage?: string
  ): Promise<RetentionActivity> {
    const cleanEmail = customerEmail.toLowerCase().trim();
    if (!store.retentionActivities[cleanEmail]) {
      store.retentionActivities[cleanEmail] = [];
    }

    let title = customTitle || 'Email Retensi Pelanggan';
    let description = customMessage || '';

    if (templateType === 'welcome_onboarding') {
      title = 'Email Sambutan: Selamat Datang di TechSecond ID';
      description = 'Mengirimkan ucapan selamat datang, panduan garansi 90 hari, dan voucher diskon Rp 50.000 (BARUHEMAT50).';
    } else if (templateType === 'loyal_vip_reward') {
      title = 'Apresiasi Member VIP: Bonus 50 Poin & Diskon 10%';
      description = 'Mengirimkan apresiasi member setia dengan kode promo eksklusif LOYALVIP10 dan penambahan 50 poin loyalitas.';
      // Tambahkan bonus poin
      store.customerLoyaltyAdjustments[cleanEmail] = (store.customerLoyaltyAdjustments[cleanEmail] || 0) + 50;
    } else if (templateType === 'winback_reactivation') {
      title = 'Kampanye Winback: Kami Rindu Anda di TechSecond ID';
      description = 'Mengirimkan email follow-up ramah dengan tawaran voucher reaktivasi diskon Rp 100.000 (COMEBACK100) dan rekomendasi gadget terbaru.';
    }

    const activity: RetentionActivity = {
      id: `act-${Date.now()}`,
      type: 'email_follow_up',
      title,
      description,
      createdAt: new Date().toISOString(),
      channel: 'Email',
      status: 'Terkirim',
    };

    store.retentionActivities[cleanEmail].unshift(activity);
    return activity;
  }

  /**
   * Update catatan CRM, tag, atau penyesuaian poin loyalitas
   */
  async updateCustomerCRM(
    email: string,
    updates: { notes?: string; tags?: string[]; pointsDelta?: number }
  ): Promise<CustomerProfile | null> {
    const cleanEmail = email.toLowerCase().trim();

    if (updates.notes !== undefined) {
      store.customerNotes[cleanEmail] = updates.notes;
    }

    if (updates.tags !== undefined) {
      store.customerTags[cleanEmail] = updates.tags;
    }

    if (updates.pointsDelta) {
      store.customerLoyaltyAdjustments[cleanEmail] =
        (store.customerLoyaltyAdjustments[cleanEmail] || 0) + updates.pointsDelta;

      if (!store.retentionActivities[cleanEmail]) {
        store.retentionActivities[cleanEmail] = [];
      }
      store.retentionActivities[cleanEmail].unshift({
        id: `act-${Date.now()}`,
        type: 'loyalty_bonus',
        title: updates.pointsDelta > 0 ? `Penambahan +${updates.pointsDelta} Poin Loyalitas` : `Pengurangan ${updates.pointsDelta} Poin`,
        description: `Penyesuaian manual saldo poin oleh admin CRM.`,
        createdAt: new Date().toISOString(),
        channel: 'Sistem',
        status: 'Tercatat',
      });
    }

    const res = await this.getCustomerByEmail(cleanEmail);
    return res?.customer || null;
  }
}

export const d1 = new D1Client();
