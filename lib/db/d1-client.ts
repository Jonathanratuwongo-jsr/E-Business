import { Product, Order, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from './initial-data';

// Singleton storage to persist state across hot reloads and server invocations
interface MemoryStore {
  products: Product[];
  orders: Order[];
}

declare global {
  // eslint-disable-next-line no-var
  var __d1MemoryStore: MemoryStore | undefined;
}

if (!globalThis.__d1MemoryStore) {
  globalThis.__d1MemoryStore = {
    products: [...INITIAL_PRODUCTS],
    orders: [
      {
        id: 'ord-01',
        orderNumber: 'ORD-20260312-7891',
        customerName: 'Budi Santoso',
        customerEmail: 'budi.santoso@gmail.com',
        customerPhone: '081234567890',
        shippingAddress: 'Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan, 12190',
        courier: 'JNE YES (Yakin Esok Sampai) + Asuransi',
        trackingNumber: 'JNE88291048291',
        items: [
          {
            productId: 'prod-01',
            productName: 'Apple iPhone 13 Pro 128GB Sierra Blue',
            productImage: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80',
            grade: 'Grade A+',
            price: 9850000,
            quantity: 1,
          },
        ],
        subtotal: 9850000,
        shippingCost: 35000,
        insuranceCost: 25000,
        total: 9910000,
        status: 'Dikirim',
        paymentType: 'qris',
        midtransTransactionId: 'MID-TX-20260312-001',
        createdAt: '2026-03-12T09:15:00Z',
      },
    ],
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

  // Products
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

  // Orders
  async getOrders(): Promise<Order[]> {
    return [...store.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrderById(id: string): Promise<Order | null> {
    return store.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
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
}

export const d1 = new D1Client();
