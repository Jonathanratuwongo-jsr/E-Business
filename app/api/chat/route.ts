import { NextRequest, NextResponse } from 'next/server';
import { d1 } from '@/lib/db/d1-client';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const query = lastUserMessage.toLowerCase();

    // Fetch active products to provide real recommendations
    const allProducts = await d1.getProducts();

    let reply = '';
    const recommendedProducts = [];

    if (query.includes('grade') || query.includes('kondisi') || query.includes('mulus')) {
      reply = `Halo! Di **TechSecond ID**, kami menguji setiap gadget dengan 35 titik Quality Control ketat:\n\n` +
        `• **Grade A+ (Like New 99%)**: Nyaris seperti baru, tanpa goresan terlihat, baterai 90%+, fullset original.\n` +
        `• **Grade A (Very Good 95%)**: Sangat mulus, tanda pemakaian mikro hanya terlihat dari dekat, fungsi 100% normal.\n` +
        `• **Grade B (Good 85-90%)**: Ada lecet pemakaian wajar atau dent kecil di sudut, layar jernih, harga jauh lebih hemat!\n\n` +
        `Semua unit dilindungi **Garansi Toko 30 - 90 Hari** tukar unit baru jika ada kendala hardware!`;
    } else if (query.includes('baterai') || query.includes('battery') || query.includes('health') || query.includes('bh')) {
      reply = `Tentang **Battery Health** gadget bekas kami:\n\n` +
        `1. Kami hanya menjual unit dengan Battery Health **minimal 85% - 95%** dengan sel baterai original (Bukan suntikan/bypass).\n` +
        `2. Untuk MacBook, kami mencantumkan jumlah **Cycle Count** riil.\n` +
        `3. Jika dalam masa garansi kesehatan baterai drop drastis di bawah 80%, teknisi kami siap melakukan penggantian baterai gratis!`;
    } else if (query.includes('imei') || query.includes('sinyal') || query.includes('kemenperin') || query.includes('blokir')) {
      reply = `Semua smartphone (iPhone & Android) yang kami jual **100% Bergaransi IMEI Seumur Hidup (Anti Blokir)**.\n\n` +
        `• Unit resmi Indonesia (iBox, SEIN, Digimap) terdaftar resmi di database **Kemenperin**.\n` +
        `• Unit ex-inter sudah resmi lolos pabean **Bea Cukai** dengan bukti pembayaran pajak resmi.\n` +
        `• Sinyal all operator (Telkomsel, Indosat, XL, Smartfren) langsung aktif dan aman digunakan permanen!`;
    } else if (query.includes('budget') || query.includes('rekomendasi') || query.includes('laptop') || query.includes('hp') || query.includes('iphone') || query.includes('juta')) {
      // Find matching items
      if (query.includes('laptop') || query.includes('coding') || query.includes('kerja')) {
        const laptops = allProducts.filter((p) => p.category === 'Laptop');
        recommendedProducts.push(...laptops);
        reply = `Untuk kebutuhan laptop bekas berkualitas, berikut rekomendasi terbaik di katalog kami saat ini:\n\n` +
          `1. **MacBook Air M1 (2020)** - Rp 8.450.000 (Cocok untuk kerja cepat, baterai awet 15 jam, bobot ringan 1.2kg).\n` +
          `2. **Lenovo ThinkPad T14 Gen 2 Ryzen 7 PRO** - Rp 6.490.000 (Pilihan terbaik untuk programmer, keyboard empuk, tahan banting standard militer).\n\n` +
          `Semua laptop sudah dibersihkan thermal paste baru dan lolos uji benchmark render & storage SSD!`;
      } else if (query.includes('kamera') || query.includes('foto') || query.includes('vlog')) {
        const cameras = allProducts.filter((p) => p.category === 'Kamera');
        recommendedProducts.push(...cameras);
        reply = `Untuk fotografi dan video vlogging, kami sangat merekomendasikan **Sony A6400 Mirrorless + Lensa Kit 16-50mm** seharga **Rp 8.950.000**.\n\n` +
          `• Shutter count baru 3.820 jepretan (sangat minim pemakaian).\n` +
          `• Autofocus Eye-AF secepat kilat (0.02 detik) dan layar flip 180° untuk vlogging.\n` +
          `• Sensor bersih bebas jamur atau fog!`;
      } else {
        const phones = allProducts.filter((p) => p.category === 'Smartphone');
        recommendedProducts.push(...phones);
        reply = `Berdasarkan katalog terlaris kami, berikut gadget bekas paling diminati:\n\n` +
          `• **iPhone 13 Pro 128GB** (Grade A+, Battery Health 92%) - Rp 9.850.000\n` +
          `• **Samsung Galaxy S23 Ultra 5G** (Kamera 200MP + S-Pen) - Rp 11.200.000\n` +
          `• **Apple iPad Air 5 M1** - Rp 6.850.000\n\n` +
          `Apakah ada preferensi brand atau budget spesifik yang ingin kamu cari?`;
      }
    } else if (query.includes('midtrans') || query.includes('bayar') || query.includes('pembayaran') || query.includes('cicilan')) {
      reply = `Pembayaran di TechSecond ID terintegrasi aman dengan **Payment Gateway Midtrans**:\n\n` +
        `• **QRIS Real-time**: GoPay, ShopeePay, DANA, OVO, LinkAja, BCA Mobile.\n` +
        `• **Virtual Account 24 Jam**: BCA, Mandiri, BNI, BRI, Permata (verifikasi otomatis tanpa kirim bukti transfer).\n` +
        `• **Kartu Kredit & Debit Online**: Visa, Mastercard, JCB dengan keamanan 3D Secure.\n\n` +
        `Semua transaksi terenkripsi dan dana Anda ditahan aman sampai barang tiba!`;
    } else if (query.includes('garansi') || query.includes('retur') || query.includes('rusak')) {
      reply = `Kami memberikan **Garansi Toko Resmi 30 sampai 90 Hari**:\n\n` +
        `• 7 Hari pertama: Garansi tukar unit langsung jika ditemukan cacat fungsi tersembunyi.\n` +
        `• 30-90 Hari: Garansi servis gratis perbaikan hardware.\n` +
        `• Asuransi pengiriman penuh mengganti 100% jika paket hilang/rusak saat diantar kurir (JNE/SiCepat).`;
    } else {
      reply = `Halo! Saya **TechGuru AI**, asisten spesialis gadget bekas bersertifikasi di TechSecond ID.\n\n` +
        `Saya bisa membantu Anda:\n` +
        `1. Memilih smartphone, laptop, kamera, atau tablet sesuai budget\n` +
        `2. Cek penjelasan kondisi Grade A+ / Grade A / Grade B\n` +
        `3. Informasi kesehatan baterai (Battery Health) & garansi IMEI anti-blokir\n` +
        `4. Cara pembayaran via QRIS, Virtual Account, & Midtrans\n\n` +
        `Ada gadget bekas yang sedang Anda incar hari ini?`;
    }

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: reply,
        products: recommendedProducts.slice(0, 2),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
