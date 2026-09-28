const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../../database/data.json');

class DatabaseStore {
  constructor() {
    this.data = {
      users: [],
      seller_profiles: [],
      seller_applications: [],
      categories: [],
      brands: [],
      products: [],
      product_images: [],
      product_variants: [],
      carts: [],
      cart_items: [],
      wishlists: [],
      addresses: [],
      coupons: [],
      orders: [],
      seller_orders: [],
      order_items: [],
      payments: [],
      payouts: [],
      reviews: [],
      seller_reviews: [],
      chats: [],
      messages: [],
      seller_follows: [],
      reports: [],
      disputes: [],
      notifications: [],
      platform_settings: {
        id: 'settings-global',
        commission_rate: 10,
        auto_approve_products: false,
        currency: 'INR',
        currency_symbol: '₹',
        payout_threshold: 1000,
        marketplace_name: 'Art & Heritage Marketplace'
      }
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
        this.migrateMarketplaceData();
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.warn('[DatabaseStore] Error loading data.json, re-seeding:', err.message);
      this.seedInitialData();
    }
  }

  save() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DatabaseStore] Error saving data.json:', err.message);
    }
  }

  seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('admin123', salt);
    const userPassword = bcrypt.hashSync('user123', salt);

    const adminId = 'a1111111-1111-4111-8111-111111111111';
    const customerId = 'c2222222-2222-4222-8222-222222222222';

    // Users
    this.data.users = [
      {
        id: adminId,
        name: 'HariNama Admin',
        email: 'admin@harinama.com',
        password_hash: adminPassword,
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: customerId,
        name: 'Gauranga Das',
        email: 'user@harinama.com',
        password_hash: userPassword,
        phone: '+91 91234 56789',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        role: 'customer',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Categories
    const catBooks = 'cat-001';
    const catMala = 'cat-002';
    const catApparel = 'cat-003';
    const catPuja = 'cat-004';
    const catWellness = 'cat-005';
    const catMusic = 'cat-006';

    this.data.categories = [
      {
        id: catBooks,
        name: 'Sacred Books & Scriptures',
        slug: 'sacred-books',
        description: 'Authentic translations and commentaries of ancient Vedic scriptures, Bhagavad Gita, and philosophy.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        sort_order: 1
      },
      {
        id: catMala,
        name: 'Japa Mala & Beads',
        slug: 'japa-mala-beads',
        description: 'Handcrafted authentic Tulasi, Neem, Sandalwood, and Rosewood prayer beads with handcrafted japa bags.',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        sort_order: 2
      },
      {
        id: catApparel,
        name: 'Devotional Apparel',
        slug: 'devotional-apparel',
        description: 'Pure Ahimsa Silk Kurtas, hand-woven Khadi dhotis, designer sarees, and Harinama print chadhars.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        sort_order: 3
      },
      {
        id: catPuja,
        name: 'Puja & Altar Decor',
        slug: 'puja-altar-decor',
        description: 'Pure brass aarti lamps, deity thrones, silver thalis, bell chimes, and sacred altar furnishings.',
        image: 'https://images.unsplash.com/photo-1609137144822-0d198f2371a5?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        sort_order: 4
      },
      {
        id: catWellness,
        name: 'Natural Wellness & Aromas',
        slug: 'natural-wellness',
        description: 'Pure Vrindavan Sandalwood paste, natural temple dhoop, organic Ghee, and botanical essential oils.',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        sort_order: 5
      },
      {
        id: catMusic,
        name: 'Kirtan Instruments & Accs',
        slug: 'kirtan-instruments',
        description: 'Hand-beaten brass Kartals, premium clay Mridangas, harmoniums, and sacred jewelry.',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        sort_order: 6
      }
    ];

    // Brands
    const brandBBT = 'br-001';
    const brandVrindavan = 'br-002';
    const brandMayapur = 'br-003';
    const brandVedaSoul = 'br-004';

    this.data.brands = [
      { id: brandBBT, name: 'Bhaktivedanta Book Trust', slug: 'bbt', logo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80', status: 'active' },
      { id: brandVrindavan, name: 'Vrindavan Naturals', slug: 'vrindavan-naturals', logo: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=200&q=80', status: 'active' },
      { id: brandMayapur, name: 'Mayapur Handlooms', slug: 'mayapur-handlooms', logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80', status: 'active' },
      { id: brandVedaSoul, name: 'VedaSoul Crafts', slug: 'vedasoul-crafts', logo: 'https://images.unsplash.com/photo-1609137144822-0d198f2371a5?auto=format&fit=crop&w=200&q=80', status: 'active' }
    ];

    // Products
    this.data.products = [
      {
        id: 'prod-001',
        name: 'Srimad Bhagavad Gita As It Is (Deluxe Edition)',
        slug: 'bhagavad-gita-as-it-is-deluxe',
        description: 'The largest-selling, most comprehensive edition of the Bhagavad Gita in the world with original Sanskrit text, Roman transliteration, English equivalents, lucid translation, and elaborate purports by A.C. Bhaktivedanta Swami Prabhupada.',
        short_description: 'Complete 700 verses with elaborate commentary, Sanskrit text and full-color classical illustrations.',
        price: 899.00,
        compare_price: 1299.00,
        sku: 'BK-BG-DLX-01',
        stock: 50,
        category_id: catBooks,
        brand_id: brandBBT,
        status: 'active',
        featured: true,
        trending: true,
        rating: 4.9,
        reviews_count: 148,
        specifications: {
          "Author": "A.C. Bhaktivedanta Swami Prabhupada",
          "Pages": "924 Pages",
          "Language": "English & Sanskrit",
          "Cover": "Hardbound with Gold Foil Embossing",
          "Illustrations": "48 Full-color Plates"
        },
        tags: ['Gita', 'Philosophy', 'Scripture', 'Bestseller'],
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-002',
        name: 'Authentic Vrindavan Tulasi Japa Mala (108 Beads)',
        slug: 'authentic-tulasi-japa-mala-108',
        description: 'Specially hand-carved from sacred Vrindavan wood, each bead is selected for uniform shape and smoothness. Strung on durable silk thread with traditional hand-tied knots between each bead for optimal meditation flow.',
        short_description: '108 hand-carved Tulasi beads with Guru bead, silk tassel, and pure copper capping.',
        price: 1250.00,
        compare_price: 1699.00,
        sku: 'ML-TLS-108-01',
        stock: 35,
        category_id: catMala,
        brand_id: brandVrindavan,
        status: 'active',
        featured: true,
        trending: true,
        rating: 4.8,
        reviews_count: 92,
        specifications: {
          "Bead Count": "108 + 1 Guru Bead",
          "Bead Diameter": "8mm to 10mm Graduated",
          "Origin": "Vrindavan Dham",
          "Thread": "Reinforced Natural Silk",
          "Free Gift": "Embroidered Cotton Bead Bag"
        },
        tags: ['Tulasi', 'Japa', 'Meditation', 'Prayer Beads'],
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-003',
        name: 'Pure Ahimsa Silk Kurta & Handloom Dhoti Set',
        slug: 'ahimsa-silk-kurta-dhoti-set',
        description: 'Hand-spun cruelty-free Ahimsa silk crafted by traditional Mayapur artisans. Light, breathable, and deeply auspicious for spiritual festivals, temple ceremonies, and daily devotion.',
        short_description: 'Pure handloom raw silk blend with subtle zari borders and tailored comfortable fit.',
        price: 2899.00,
        compare_price: 3899.00,
        sku: 'AP-SLK-SET-01',
        stock: 22,
        category_id: catApparel,
        brand_id: brandMayapur,
        status: 'active',
        featured: true,
        trending: false,
        rating: 4.9,
        reviews_count: 45,
        specifications: {
          "Fabric": "100% Ahimsa Silk & Khadi Cotton",
          "Care": "Dry Clean or Gentle Handwash",
          "Set Contains": "1 Kurta + 1 4.5m Dhoti with Angavastram",
          "Color": "Natural Golden Sandalwood / Ivory"
        },
        tags: ['Apparel', 'Kurta', 'Dhoti', 'Ahimsa Silk'],
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-004',
        name: 'Solid Brass 5-Step Pancha Pradipa Aarti Lamp',
        slug: 'solid-brass-pancha-pradipa-aarti-lamp',
        description: 'Exquisite hand-cast heavy brass Pancha Pradipa lamp. Features traditional peacock handle and five tiered flame holders designed to retain warm clarified butter (ghee) or sesame oil during arati.',
        short_description: 'Heavily weighted solid virgin brass with ornate hand-engraved peacock handle.',
        price: 1599.00,
        compare_price: 2199.00,
        sku: 'PJ-BRS-LMP-01',
        stock: 18,
        category_id: catPuja,
        brand_id: brandVedaSoul,
        status: 'active',
        featured: true,
        trending: true,
        rating: 4.7,
        reviews_count: 38,
        specifications: {
          "Material": "100% Solid Brass (Virgin Casting)",
          "Weight": "1.25 Kilograms",
          "Dimensions": "8.5 inches x 6 inches",
          "Finish": "Antique Lustre Polish"
        },
        tags: ['Puja', 'Aarti', 'Brass', 'Altar Decor'],
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-005',
        name: 'Pure Vrindavan Chandan Sandalwood Paste & Stone',
        slug: 'pure-vrindavan-sandalwood-paste-stone',
        description: 'Sustainably sourced old-growth Mysore sandalwood block paired with a natural granite rubbing stone (Chandan pata). Delivers an intoxicating celestial aroma and deep cooling sensation when applied as tilak.',
        short_description: 'Authentic 100g Sandalwood root piece + Traditional hand-carved stone slab.',
        price: 799.00,
        compare_price: 999.00,
        sku: 'WL-CHND-100-01',
        stock: 40,
        category_id: catWellness,
        brand_id: brandVrindavan,
        status: 'active',
        featured: false,
        trending: true,
        rating: 4.9,
        reviews_count: 67,
        specifications: {
          "Contents": "100g Sandalwood Log + 4-inch Granite Pata",
          "Aroma Profile": "Sweet, woody, therapeutic calming scent",
          "Use": "Tilak, Puja Offering, Meditation Aid"
        },
        tags: ['Chandan', 'Sandalwood', 'Tilak', 'Wellness'],
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-006',
        name: 'Hand-Beaten Bell Metal Bengali Kartals (Medium)',
        slug: 'hand-beaten-bell-metal-bengali-kartals',
        description: 'Forged from authentic Kansa (bell metal bronze alloy) by multi-generational metalsmiths in Nabadwip. Produces a sustained, crystal-clear, melodious ringing pitch essential for sankirtan and home bhajan.',
        short_description: 'Hand-forged resonant Bell Metal cymbals with braided cotton cords.',
        price: 1450.00,
        compare_price: 1899.00,
        sku: 'MS-KRT-BLM-01',
        stock: 25,
        category_id: catMusic,
        brand_id: brandVedaSoul,
        status: 'active',
        featured: true,
        trending: true,
        rating: 4.8,
        reviews_count: 51,
        specifications: {
          "Alloy": "78% Copper, 22% Tin (Traditional Kansa)",
          "Diameter": "3.5 inches per cup",
          "Weight": "580 grams pair",
          "Tone": "High Bright Resonance (Sankirtan standard)"
        },
        tags: ['Kartals', 'Kirtan', 'Instruments', 'Sankirtan'],
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-007',
        name: 'Srimad Bhagavatam 18-Volume Complete Set',
        slug: 'srimad-bhagavatam-18-volume-complete-set',
        description: 'The encyclopedic masterpiece of transcendental wisdom composed by Sage Vyasadeva. Contains the complete 12 Cantos with full transliterations, translations, and purports.',
        short_description: '18 deluxe hardbound volumes with gold gilded edges and silk ribbon bookmarks.',
        price: 14999.00,
        compare_price: 18500.00,
        sku: 'BK-SB-SET-18',
        stock: 8,
        category_id: catBooks,
        brand_id: brandBBT,
        status: 'active',
        featured: true,
        trending: false,
        rating: 5.0,
        reviews_count: 88,
        specifications: {
          "Volumes": "18 Hardcover Books",
          "Language": "English & Sanskrit",
          "Publisher": "Bhaktivedanta Book Trust",
          "Weight": "16.5 Kilograms"
        },
        tags: ['Bhagavatam', 'Scripture', 'Books', 'Collector Set'],
        created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-008',
        name: 'Organic Vedic A2 Gir Cow Ghee (Glass Jar 1000ml)',
        slug: 'organic-vedic-a2-gir-cow-ghee-1000ml',
        description: 'Cultured using the traditional Vedic Bilona method from curd of free-grazing indigenous Gir cows. Golden, granular, aromatic, and rich in medicinal nutrients and natural antioxidants.',
        short_description: 'Handmade Bilona cultured A2 ghee in airtight UV-protective glass jar.',
        price: 1850.00,
        compare_price: 2200.00,
        sku: 'WL-GHE-A2-1000',
        stock: 30,
        category_id: catWellness,
        brand_id: brandVrindavan,
        status: 'active',
        featured: false,
        trending: true,
        rating: 4.9,
        reviews_count: 114,
        specifications: {
          "Volume": "1000 ml / 1 Litre",
          "Method": "Vedic Wooden Bilona Churned",
          "Cow Breed": "Desi Gir Cows (Grass Fed)",
          "Packaging": "Heavy Glass Jar"
        },
        tags: ['A2 Ghee', 'Ayurveda', 'Bilona', 'Wellness'],
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-009',
        name: 'Embroidered Silk Harinama Japa Bead Bag',
        slug: 'embroidered-silk-harinama-japa-bead-bag',
        description: 'Beautifully embroidered with Maha-Mantra and sacred lotus motifs. Features soft inner lining, sturdy index finger hole, inner zippered pocket for counter beads, and adjustable strap.',
        short_description: 'Velvet silk exterior with gold thread embroidery and counter pouch.',
        price: 349.00,
        compare_price: 499.00,
        sku: 'ML-BAG-SLK-01',
        stock: 60,
        category_id: catMala,
        brand_id: brandMayapur,
        status: 'active',
        featured: false,
        trending: false,
        rating: 4.7,
        reviews_count: 29,
        specifications: {
          "Material": "Raw Silk & Velvet",
          "Color Options": "Royal Saffron, Deep Blue, Emerald",
          "Features": "Index hole, counter zipper, strap"
        },
        tags: ['Japa Bag', 'Mala Bag', 'Accessories'],
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-010',
        name: 'Handcrafted Radha Krishna Brass Deity Set (7 Inches)',
        slug: 'handcrafted-radha-krishna-brass-deity-set-7-inch',
        description: 'Hand-sculpted in fine brass by heritage artisans with intricate facial features, ornaments, and peaceful divine smiles. Includes detachable flute and decorative peacock crown.',
        short_description: '7-inch pair of brass Sri Sri Radha Krishna with polished finish.',
        price: 4499.00,
        compare_price: 5999.00,
        sku: 'PJ-RK-7IN-01',
        stock: 12,
        category_id: catPuja,
        brand_id: brandVedaSoul,
        status: 'active',
        featured: true,
        trending: true,
        rating: 4.9,
        reviews_count: 34,
        specifications: {
          "Height": "7.0 Inches (18 cm)",
          "Net Weight": "2.4 Kilograms (Pair)",
          "Material": "Solid Brass with protective coating"
        },
        tags: ['Deity', 'Radha Krishna', 'Brass', 'Altar'],
        created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-011',
        name: 'Natural Vrindavan Kasturi & Rose Temple Dhoop Cones',
        slug: 'natural-vrindavan-kasturi-rose-dhoop-cones',
        description: '100% charcoal-free, made from sacred temple flower petals, cow dung ash, pure kasturi essential oils, and natural resins. Long lasting burning time of 40 minutes per cone with zero toxic smoke.',
        short_description: 'Box of 40 jumbo cones with ceramic burner plate. Pure aroma.',
        price: 299.00,
        compare_price: 399.00,
        sku: 'WL-DHP-40-01',
        stock: 80,
        category_id: catWellness,
        brand_id: brandVrindavan,
        status: 'active',
        featured: false,
        trending: false,
        rating: 4.6,
        reviews_count: 57,
        specifications: {
          "Count": "40 Luxury Dhoop Cones",
          "Burn Time": "35-45 Minutes",
          "Fragrance": "Vrindavan Kasturi & Damascus Rose",
          "Charcoal Free": "Yes (100% Organic)"
        },
        tags: ['Incense', 'Dhoop', 'Organic', 'Aroma'],
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-012',
        name: 'Authentic Clay Khol / Mridanga (Traditional Bengali)',
        slug: 'authentic-clay-khol-mridanga-traditional',
        description: 'Mastercrafted Bengali Khol with natural cured earthen body and double buffalo leather heads tuned for deep resonant bass (bayan) and sharp, crisp treble (dayan). Comes with padded gig bag.',
        short_description: 'Professional grade clay Mridanga with strap and deluxe travel bag.',
        price: 7800.00,
        compare_price: 9500.00,
        sku: 'MS-MRD-CLY-01',
        stock: 5,
        category_id: catMusic,
        brand_id: brandMayapur,
        status: 'active',
        featured: true,
        trending: false,
        rating: 4.8,
        reviews_count: 19,
        specifications: {
          "Body": "Terracotta Earthen Baked Clay",
          "Heads": "Triple layered buffalo and goat hide",
          "Tuning": "C / C# concert standard",
          "Includes": "Heavy Padded Gig Bag & Shoulder Belt"
        },
        tags: ['Mridanga', 'Khol', 'Kirtan', 'Instruments'],
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Product Images
    this.data.product_images = [
      { id: 'img-001', product_id: 'prod-001', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', alt_text: 'Bhagavad Gita Deluxe Book Cover', sort_order: 1, is_primary: true },
      { id: 'img-002', product_id: 'prod-001', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', alt_text: 'Bhagavad Gita Open Pages and Sanskrit Text', sort_order: 2, is_primary: false },
      { id: 'img-003', product_id: 'prod-002', image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80', alt_text: 'Tulasi Japa Mala Beads 108', sort_order: 1, is_primary: true },
      { id: 'img-004', product_id: 'prod-002', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', alt_text: 'Tulasi Japa Mala Close up Beads', sort_order: 2, is_primary: false },
      { id: 'img-005', product_id: 'prod-003', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', alt_text: 'Ahimsa Silk Kurta and Dhoti Set', sort_order: 1, is_primary: true },
      { id: 'img-006', product_id: 'prod-004', image_url: 'https://images.unsplash.com/photo-1609137144822-0d198f2371a5?auto=format&fit=crop&w=800&q=80', alt_text: 'Brass Pancha Pradipa Aarti Lamp', sort_order: 1, is_primary: true },
      { id: 'img-007', product_id: 'prod-005', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', alt_text: 'Pure Vrindavan Chandan and Stone', sort_order: 1, is_primary: true },
      { id: 'img-008', product_id: 'prod-006', image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', alt_text: 'Bell Metal Bengali Kartals', sort_order: 1, is_primary: true },
      { id: 'img-009', product_id: 'prod-007', image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', alt_text: 'Srimad Bhagavatam Complete Set', sort_order: 1, is_primary: true },
      { id: 'img-010', product_id: 'prod-008', image_url: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80', alt_text: 'Organic A2 Gir Cow Ghee Jar', sort_order: 1, is_primary: true },
      { id: 'img-011', product_id: 'prod-009', image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', alt_text: 'Embroidered Japa Bead Bag', sort_order: 1, is_primary: true },
      { id: 'img-012', product_id: 'prod-010', image_url: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80', alt_text: 'Radha Krishna Brass Deity Set', sort_order: 1, is_primary: true },
      { id: 'img-013', product_id: 'prod-011', image_url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80', alt_text: 'Kasturi Rose Dhoop Cones', sort_order: 1, is_primary: true },
      { id: 'img-014', product_id: 'prod-012', image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', alt_text: 'Clay Khol Mridanga Instrument', sort_order: 1, is_primary: true }
    ];

    // Product Variants (for apparel, mala size, etc.)
    this.data.product_variants = [
      { id: 'var-001', product_id: 'prod-003', sku: 'AP-SLK-M-IVR', size: 'M (38-40)', color: 'Ivory Sandal', price: 2899.00, stock: 8 },
      { id: 'var-002', product_id: 'prod-003', sku: 'AP-SLK-L-IVR', size: 'L (42-44)', color: 'Ivory Sandal', price: 2899.00, stock: 9 },
      { id: 'var-003', product_id: 'prod-003', sku: 'AP-SLK-XL-GLD', size: 'XL (46)', color: 'Golden Saffron', price: 2999.00, stock: 5 },
      { id: 'var-004', product_id: 'prod-002', sku: 'ML-TLS-8MM', size: '8mm Regular', color: 'Natural Tulasi', price: 1250.00, stock: 20 },
      { id: 'var-005', product_id: 'prod-002', sku: 'ML-TLS-10MM', size: '10mm Bold', color: 'Natural Tulasi', price: 1450.00, stock: 15 }
    ];

    // Coupons
    this.data.coupons = [
      {
        id: 'cp-001',
        code: 'WELCOME10',
        description: 'Flat 10% discount on your first spiritual purchase.',
        discount_type: 'percentage',
        discount_value: 10.00,
        minimum_order: 499.00,
        maximum_discount: 500.00,
        start_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 180 * 86400000).toISOString(),
        usage_limit: 500,
        times_used: 12,
        status: 'active'
      },
      {
        id: 'cp-002',
        code: 'FESTIVE20',
        description: 'Special 20% off for holy festivals on orders above ₹1500.',
        discount_type: 'percentage',
        discount_value: 20.00,
        minimum_order: 1500.00,
        maximum_discount: 1000.00,
        start_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 60 * 86400000).toISOString(),
        usage_limit: 250,
        times_used: 48,
        status: 'active'
      },
      {
        id: 'cp-003',
        code: 'HARINAMA100',
        description: 'Flat ₹100 instant discount on orders above ₹999.',
        discount_type: 'fixed',
        discount_value: 100.00,
        minimum_order: 999.00,
        maximum_discount: 100.00,
        start_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 90 * 86400000).toISOString(),
        usage_limit: 1000,
        times_used: 89,
        status: 'active'
      }
    ];

    // Sample Address for Demo Customer
    this.data.addresses = [
      {
        id: 'addr-001',
        user_id: customerId,
        name: 'Gauranga Das',
        phone: '+91 91234 56789',
        address_line_1: 'Flat 402, Radharani Kripa Apartments',
        address_line_2: 'Near ISKCON Temple Road, Raman Reti',
        city: 'Vrindavan',
        state: 'Uttar Pradesh',
        postal_code: '281121',
        country: 'India',
        address_type: 'Home',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Sample Reviews
    this.data.reviews = [
      {
        id: 'rev-001',
        product_id: 'prod-001',
        user_id: customerId,
        rating: 5,
        title: 'Life changing scripture with immaculate commentary',
        comment: 'Srila Prabhupadas purports make each verse crystal clear. The gold gilded cover and illustrations are breathtakingly beautiful.',
        is_verified_purchase: true,
        status: 'approved',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'rev-002',
        product_id: 'prod-002',
        user_id: customerId,
        rating: 5,
        title: 'Authentic pure Tulasi aroma and smooth finish',
        comment: 'Very pleasant in hands. The beads glide effortlessly while chanting the Mahamantra. Highly recommend!',
        is_verified_purchase: true,
        status: 'approved',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 'rev-003',
        product_id: 'prod-006',
        user_id: customerId,
        rating: 5,
        title: 'Pure bell metal ringing tone',
        comment: 'The sweet sustain of these kartals elevates our home sankirtan completely. Supreme quality.',
        is_verified_purchase: true,
        status: 'approved',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];

    // Sample Wishlist
    this.data.wishlists = [
      { id: 'wl-001', user_id: customerId, product_id: 'prod-004', created_at: new Date().toISOString() },
      { id: 'wl-002', user_id: customerId, product_id: 'prod-007', created_at: new Date().toISOString() }
    ];

    // Sample Orders
    const sampleOrder1Id = 'ord-001';
    this.data.orders = [
      {
        id: sampleOrder1Id,
        order_number: 'HN-2026-98124',
        user_id: customerId,
        subtotal: 2149.00,
        discount: 214.90,
        coupon_code: 'WELCOME10',
        shipping_fee: 0.00,
        tax: 96.70,
        total: 2030.80,
        payment_status: 'paid',
        payment_method: 'razorpay',
        order_status: 'delivered',
        shipping_address: this.data.addresses[0],
        billing_address: this.data.addresses[0],
        tracking_number: 'ECOM-EXP-772910',
        tracking_url: 'https://harinama.store/track/HN-2026-98124',
        notes: 'Delivered safely with blessings.',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];

    this.data.order_items = [
      {
        id: 'oi-001',
        order_id: sampleOrder1Id,
        product_id: 'prod-001',
        product_name: 'Srimad Bhagavad Gita As It Is (Deluxe Edition)',
        product_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        sku: 'BK-BG-DLX-01',
        quantity: 1,
        price: 899.00,
        total: 899.00,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'oi-002',
        order_id: sampleOrder1Id,
        product_id: 'prod-002',
        product_name: 'Authentic Vrindavan Tulasi Japa Mala (108 Beads)',
        product_image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80',
        sku: 'ML-TLS-108-01',
        quantity: 1,
        price: 1250.00,
        total: 1250.00,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ];

    this.data.payments = [
      {
        id: 'pay-001',
        order_id: sampleOrder1Id,
        payment_provider: 'razorpay',
        transaction_id: 'pay_sim_98274102941',
        payment_order_id: 'order_sim_88192731',
        amount: 2030.80,
        currency: 'INR',
        status: 'captured',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ];

    // Notifications
    this.data.notifications = [
      {
        id: 'notif-001',
        user_id: customerId,
        title: 'Order Delivered Successfully 🎉',
        message: 'Your order #HN-2026-98124 containing Bhagavad Gita and Tulasi Mala has been delivered.',
        type: 'order',
        link: '/order-tracking.html?order=HN-2026-98124',
        is_read: false,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'notif-002',
        user_id: customerId,
        title: 'Special Holy Festival Discount Available 🌸',
        message: 'Use coupon code FESTIVE20 for 20% off on all divine Puja & Altar items!',
        type: 'promo',
        link: '/shop.html?category=puja-altar-decor',
        is_read: true,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ];

    this.save();
    console.log('[DatabaseStore] Initial seed data created successfully.');
  }

  migrateMarketplaceData() {
    let modified = false;

    // Ensure all collections exist
    const collections = [
      'users', 'seller_profiles', 'seller_applications', 'categories', 'brands',
      'products', 'product_images', 'product_variants', 'carts', 'cart_items',
      'wishlists', 'addresses', 'coupons', 'orders', 'seller_orders', 'order_items',
      'payments', 'payouts', 'reviews', 'seller_reviews', 'chats', 'messages',
      'seller_follows', 'reports', 'disputes', 'notifications'
    ];

    collections.forEach(col => {
      if (!Array.isArray(this.data[col])) {
        this.data[col] = [];
        modified = true;
      }
    });

    if (!this.data.platform_settings || typeof this.data.platform_settings !== 'object') {
      this.data.platform_settings = {
        id: 'settings-global',
        commission_rate: 10,
        auto_approve_products: false,
        currency: 'INR',
        currency_symbol: '₹',
        payout_threshold: 1000,
        marketplace_name: 'Art, Antiques & Heritage Crafts Marketplace'
      };
      modified = true;
    }

    const salt = bcrypt.genSaltSync(10);
    const adminUser = this.data.users.find(u => u.role === 'admin') || this.data.users[0];
    const customerUser = this.data.users.find(u => u.role === 'customer') || this.data.users[1];

    // Ensure Platform Seller Profile exists
    let platformSeller = this.data.seller_profiles.find(s => s.id === 'seller-platform');
    if (!platformSeller) {
      platformSeller = {
        id: 'seller-platform',
        user_id: adminUser ? adminUser.id : 'a1111111-1111-4111-8111-111111111111',
        store_name: 'Platform Heritage Curations',
        slug: 'platform-heritage-curations',
        tagline: 'Official Marketplace Collection of Sacred Art & Fine Crafts',
        bio: 'Directly sourced and curated by our master archivists and heritage conservators. Every piece represents authenticated sacred tradition, museum-grade craftsmanship, and timeless spiritual heritage.',
        specialization: 'Fine Art, Scriptures & Sacred Sculptures',
        experience_years: 15,
        rating: 4.9,
        reviews_count: 240,
        sales_count: 512,
        is_verified: true,
        verification_badge: 'Verified Platform Store',
        location: 'Vrindavan / Mayapur, India',
        address: 'Bhakti Marg, Raman Reti, Vrindavan, UP 281121',
        phone: '+91 98765 43210',
        email: 'admin@harinama.com',
        website: 'https://harinama.store',
        status: 'approved',
        banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
        available_balance: 85000.00,
        pending_balance: 14500.00,
        total_earned: 340000.00,
        bank_details: {
          account_holder: 'Platform Heritage Trust',
          bank_name: 'State Bank of India',
          account_number: '••••••••8912',
          ifsc_code: 'SBIN0001234',
          upi_id: 'heritage@sbi'
        },
        social_links: {
          instagram: 'https://instagram.com/heritage_crafts',
          twitter: 'https://twitter.com/heritage_art'
        },
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.seller_profiles.push(platformSeller);
      modified = true;
    }

    // Seed Verified Tradesman Users & Profiles
    const seller1Id = 'u-seller-001';
    let userSeller1 = this.data.users.find(u => u.id === seller1Id || u.email === 'seller1@harinama.com');
    if (!userSeller1) {
      userSeller1 = {
        id: seller1Id,
        name: 'Ravi Varma',
        email: 'seller1@harinama.com',
        password_hash: bcrypt.hashSync('seller123', salt),
        phone: '+91 98450 11223',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        role: 'tradesman',
        status: 'active',
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(userSeller1);
      modified = true;
    }

    let sellerProfile1 = this.data.seller_profiles.find(s => s.id === 'seller-ravi-arts');
    if (!sellerProfile1) {
      sellerProfile1 = {
        id: 'seller-ravi-arts',
        user_id: userSeller1.id,
        store_name: 'Ravi Arts Studio',
        slug: 'ravi-arts-studio',
        tagline: 'Master Tanjore, Pattachitra & Classical Indian Paintings',
        bio: 'Third-generation traditional painter specializing in 22K gold foil Tanjore masterpieces, organic natural-dye Pattachitra scrolls, and miniature Vedic paintings with strict canonical fidelity.',
        specialization: 'Traditional Indian Paintings & Gold Leaf Art',
        experience_years: 18,
        rating: 4.9,
        reviews_count: 88,
        sales_count: 142,
        is_verified: true,
        verification_badge: 'Verified Master Tradesman',
        location: 'Hyderabad, Telangana, India',
        address: 'Artisans Enclave, Banjara Hills, Hyderabad 500034',
        phone: '+91 98450 11223',
        email: 'seller1@harinama.com',
        website: 'https://raviartstudio.com',
        status: 'approved',
        banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        available_balance: 38500.00,
        pending_balance: 9200.00,
        total_earned: 165000.00,
        bank_details: {
          account_holder: 'Ravi Varma Arts',
          bank_name: 'HDFC Bank',
          account_number: '••••••••4321',
          ifsc_code: 'HDFC0000543',
          upi_id: 'raviarts@hdfcbank'
        },
        social_links: {
          instagram: 'https://instagram.com/raviarts_studio',
          portfolio: 'https://raviartstudio.com/gallery'
        },
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.seller_profiles.push(sellerProfile1);
      modified = true;
    }

    const seller2Id = 'u-seller-002';
    let userSeller2 = this.data.users.find(u => u.id === seller2Id || u.email === 'seller2@harinama.com');
    if (!userSeller2) {
      userSeller2 = {
        id: seller2Id,
        name: 'Mahaveer Sharma',
        email: 'seller2@harinama.com',
        password_hash: bcrypt.hashSync('seller223', salt),
        phone: '+91 98290 55667',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
        role: 'tradesman',
        status: 'active',
        created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(userSeller2);
      modified = true;
    }

    let sellerProfile2 = this.data.seller_profiles.find(s => s.id === 'seller-heritage-antiques');
    if (!sellerProfile2) {
      sellerProfile2 = {
        id: 'seller-heritage-antiques',
        user_id: userSeller2.id,
        store_name: 'Heritage Antiquities & Metalcrafts',
        slug: 'heritage-antiquities-metalcrafts',
        tagline: 'Authenticated Vintage Brass, Lost-Wax Bronzes & Historic Relics',
        bio: 'Heritage antique collector and restorer certified in South Asian antiquities. We source, authenticate, and preserve 18th-20th century brass sculptures, sanctum bells, and vintage architectural carvings.',
        specialization: 'Antiques, Vintage Bronzes & Temple Relics',
        experience_years: 24,
        rating: 4.8,
        reviews_count: 64,
        sales_count: 98,
        is_verified: true,
        verification_badge: 'Verified Antiquarian',
        location: 'Jaipur, Rajasthan, India',
        address: 'Johari Bazaar, Pink City, Jaipur, Rajasthan 302003',
        phone: '+91 98290 55667',
        email: 'seller2@harinama.com',
        website: 'https://jaipurheritageantiques.com',
        status: 'approved',
        banner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
        available_balance: 52000.00,
        pending_balance: 12000.00,
        total_earned: 218000.00,
        bank_details: {
          account_holder: 'Heritage Antiquities LLP',
          bank_name: 'ICICI Bank',
          account_number: '••••••••7789',
          ifsc_code: 'ICIC0000128',
          upi_id: 'heritageantiques@icici'
        },
        social_links: {
          instagram: 'https://instagram.com/heritage_antiques_jaipur'
        },
        created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.seller_profiles.push(sellerProfile2);
      modified = true;
    }

    // Migrate existing products to have seller_id and approval_status
    this.data.products.forEach(p => {
      if (!p.seller_id) {
        p.seller_id = 'seller-platform';
        modified = true;
      }
      if (!p.approval_status) {
        p.approval_status = 'approved';
        modified = true;
      }
      if (!p.item_type) {
        p.item_type = p.category_id === 'cat-001' ? 'scripture' : (p.category_id === 'cat-004' ? 'craft' : 'general');
        modified = true;
      }
    });

    // Seed marketplace products for Tradesmen if not present
    const artisanProd1Id = 'prod-art-001';
    if (!this.data.products.some(p => p.id === artisanProd1Id)) {
      this.data.products.push({
        id: artisanProd1Id,
        name: 'Hand-Painted 22K Gold Leaf Tanjore Krishna & Yashoda (Framed)',
        slug: 'tanjore-painting-krishna-yashoda-22k-gold',
        description: 'Magnificent traditional Tanjore masterpiece rendered with genuine 22-Karat gold leaf foil and certified Jaipur gemstones over seasoned teakwood base. Handcrafted with traditional natural gesso paste relief work, showcasing divine maternal affection between Mother Yashoda and Baby Krishna.',
        short_description: 'Authentic 22K gold foil Tanjore painting in ornate teakwood Chettinad frame with Certificate of Authenticity.',
        price: 18500.00,
        compare_price: 24000.00,
        sku: 'ART-TNJ-KY-01',
        stock: 4,
        category_id: 'cat-004',
        brand_id: 'br-004',
        seller_id: 'seller-ravi-arts',
        approval_status: 'approved',
        status: 'active',
        featured: true,
        trending: true,
        rating: 5.0,
        reviews_count: 22,
        artist_name: 'Master Ravi Varma',
        year_created: '2025',
        origin_region: 'Thanjavur, Tamil Nadu / Hyderabad',
        material: '22K Gold Foil, Natural Gum, Jaipur Semiprecious Stones, Teakwood',
        technique: 'Traditional Gesso Relief & Gold Foil Embossing',
        dimensions: '20 x 16 x 2.5 Inches',
        weight: '4.2 kg (Framed)',
        condition: 'Mint / Fresh from Studio',
        authenticity_type: 'Verified by Platform & Artist Certificate',
        has_certificate: true,
        signed_by_artist: true,
        is_handmade: true,
        edition_info: 'Original Masterpiece #1 of 5',
        specifications: {
          "Artist": "Master Ravi Varma",
          "Gold Purity": "22 Karat Certified Gold Foil",
          "Frame": "Heritage Chettinad Teak Wood",
          "Includes": "Tamper-proof Certificate of Authenticity",
          "Preservation": "Museum-grade UV-filtering Acrylic Glass"
        },
        tags: ['Tanjore', 'Painting', 'Gold Foil', 'Krishna', 'Original Art', 'Handmade'],
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      });

      this.data.product_images.push(
        {
          id: 'img-art-001-1',
          product_id: artisanProd1Id,
          image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
          is_primary: true,
          sort_order: 1
        },
        {
          id: 'img-art-001-2',
          product_id: artisanProd1Id,
          image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
          is_primary: false,
          sort_order: 2
        }
      );
      modified = true;
    }

    const antiqueProd2Id = 'prod-ant-002';
    if (!this.data.products.some(p => p.id === antiqueProd2Id)) {
      this.data.products.push({
        id: antiqueProd2Id,
        name: 'Vintage 19th-Century Lost-Wax Bronze Ganesha Lamp (Deepam)',
        slug: 'vintage-bronze-ganesha-deepam-lamp',
        description: 'Rare collectible antique brass & bronze hanging temple lamp (Deepam) depicting Lord Ganesha seated on a floral lotus throne flanked by divine peacocks. Cast in the ancient Madhuchista Vidhana (lost-wax casting) method in early 20th century Tamil Nadu, displaying authentic natural aged patina.',
        short_description: 'Authentic 19th-century lost-wax bronze temple lamp with natural aged patina and documented provenance.',
        price: 26000.00,
        compare_price: 32500.00,
        sku: 'ANT-BRZ-GN-02',
        stock: 1,
        category_id: 'cat-004',
        brand_id: 'br-004',
        seller_id: 'seller-heritage-antiques',
        approval_status: 'approved',
        status: 'active',
        featured: true,
        trending: true,
        rating: 4.9,
        reviews_count: 14,
        artist_name: 'Heritage Temple Guild (Swamimalai)',
        estimated_age: 'Circa 1910 (115+ Years Old)',
        year_created: 'c. 1910',
        origin_region: 'Swamimalai, Tamil Nadu / Jaipur Archive',
        material: 'Ashta-Dhatu Bronze & Bell Metal',
        technique: 'Cire Perdue (Lost Wax Casting) & Hand Chiseling',
        dimensions: '14.5 x 8.0 x 6.5 Inches',
        weight: '6.8 kg',
        condition: 'Fine Antique Condition with Untouched Original Patina',
        authenticity_type: 'Verified by Antiquarian Expert',
        has_certificate: true,
        signed_by_artist: false,
        is_handmade: true,
        provenance: 'Acquired from private Chettiar estate collection, Madurai (1978)',
        specifications: {
          "Era": "Early 20th Century (c. 1910)",
          "Composition": "Eight Metal Sacred Bronze Alloy (Ashtadhatu)",
          "Provenance": "Documented Private Estate Collection",
          "Verification": "Laboratory Tested Alloy & Antiquarian Certificate"
        },
        tags: ['Antique', 'Bronze', 'Ganesha', 'Temple Lamp', 'Collectibles', 'Rare'],
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      });

      this.data.product_images.push(
        {
          id: 'img-ant-002-1',
          product_id: antiqueProd2Id,
          image_url: 'https://images.unsplash.com/photo-1609137144822-0d198f2371a5?auto=format&fit=crop&w=800&q=80',
          is_primary: true,
          sort_order: 1
        },
        {
          id: 'img-ant-002-2',
          product_id: antiqueProd2Id,
          image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          is_primary: false,
          sort_order: 2
        }
      );
      modified = true;
    }

    // Seed sample Seller Applications
    if (this.data.seller_applications.length === 0) {
      this.data.seller_applications.push({
        id: 'app-001',
        user_id: customerUser ? customerUser.id : 'c2222222-2222-4222-8222-222222222222',
        applicant_name: 'Gauranga Das',
        shop_name: 'Vrindavan Sacred Woodworks',
        email: customerUser ? customerUser.email : 'user@harinama.com',
        phone: '+91 91234 56789',
        location: 'Mathura & Vrindavan, Uttar Pradesh',
        address: 'Raman Reti Road, Vrindavan, UP 281121',
        specialization: 'Hand-carved Teakwood Altars & Japa Malas',
        experience_years: 7,
        bio: 'Carving traditional wooden singhasans and sacred neem/tulasi meditation accessories with ethical wood sourcing.',
        portfolio_url: 'https://vrindavanwoodcrafts.example.com',
        social_links: { instagram: '@vrindavan_woodworks' },
        id_document_type: 'Aadhaar / National ID',
        id_document_number: '•••• •••• 8821',
        bank_details: {
          account_holder: 'Gauranga Das',
          bank_name: 'SBI Vrindavan',
          account_number: '••••••••9012',
          ifsc_code: 'SBIN0000492'
        },
        status: 'pending',
        notes: 'Application submitted for platform verification.',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      });
      modified = true;
    }

    // Seed sample Buyer <-> Seller Chats and Messages
    if (this.data.chats.length === 0) {
      const sampleChatId = 'chat-001';
      this.data.chats.push({
        id: sampleChatId,
        buyer_id: customerUser ? customerUser.id : 'c2222222-2222-4222-8222-222222222222',
        seller_id: 'seller-ravi-arts',
        product_id: artisanProd1Id,
        order_id: null,
        last_message: 'Yes, it comes with the certified 22K gold authenticity certificate and insured wooden crate shipping.',
        last_message_at: new Date(Date.now() - 3600000).toISOString(),
        buyer_unread: 0,
        seller_unread: 0,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      });

      this.data.messages.push(
        {
          id: 'msg-001',
          chat_id: sampleChatId,
          sender_id: customerUser ? customerUser.id : 'c2222222-2222-4222-8222-222222222222',
          sender_role: 'buyer',
          message: 'Hello Master Ravi! Is this Tanjore Krishna painting available with customized dedication framing?',
          attachment_url: null,
          created_at: new Date(Date.now() - 5 * 3600000).toISOString()
        },
        {
          id: 'msg-002',
          chat_id: sampleChatId,
          sender_id: userSeller1.id,
          sender_role: 'seller',
          message: 'Namaste! Yes, we can engrave a brass nameplate on the teakwood frame with your personalized dedication at no extra charge.',
          attachment_url: null,
          created_at: new Date(Date.now() - 4 * 3600000).toISOString()
        },
        {
          id: 'msg-003',
          chat_id: sampleChatId,
          sender_id: customerUser ? customerUser.id : 'c2222222-2222-4222-8222-222222222222',
          sender_role: 'buyer',
          message: 'Wonderful! Does it include the official Certificate of Authenticity for the 22K gold?',
          attachment_url: null,
          created_at: new Date(Date.now() - 2 * 3600000).toISOString()
        },
        {
          id: 'msg-004',
          chat_id: sampleChatId,
          sender_id: userSeller1.id,
          sender_role: 'seller',
          message: 'Yes, it comes with the certified 22K gold authenticity certificate and insured wooden crate shipping.',
          attachment_url: null,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      );
      modified = true;
    }

    // Seed sample Seller Reviews
    if (this.data.seller_reviews.length === 0) {
      this.data.seller_reviews.push({
        id: 'srev-001',
        seller_id: 'seller-ravi-arts',
        user_id: customerUser ? customerUser.id : 'c2222222-2222-4222-8222-222222222222',
        rating: 5,
        title: 'Master craftsmanship and museum-level packaging',
        comment: 'The 22K gold foil shines with mesmerizing luminescence. Arrived in a reinforced custom wooden crate with the stamped Certificate of Authenticity.',
        is_verified_buyer: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      });
      modified = true;
    }

    // Seed sample Seller Follows
    if (this.data.seller_follows.length === 0 && customerUser) {
      this.data.seller_follows.push({
        id: 'fol-001',
        user_id: customerUser.id,
        seller_id: 'seller-ravi-arts',
        created_at: new Date().toISOString()
      });
      modified = true;
    }

    // Seed sample Payouts
    if (this.data.payouts.length === 0) {
      this.data.payouts.push({
        id: 'pay-req-001',
        payout_number: 'PAY-2026-0018',
        seller_id: 'seller-ravi-arts',
        amount: 25000.00,
        currency: 'INR',
        status: 'paid',
        payment_method: 'bank_transfer',
        transaction_reference: 'NEFT_SBIN_998127391',
        bank_details: sellerProfile1.bank_details,
        processed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 8 * 86400000).toISOString()
      });
      modified = true;
    }

    if (modified) {
      this.save();
      console.log('[DatabaseStore] Marketplace data migration & collections initialized successfully.');
    }
  }

  // Generic helpers
  findAll(collection) {
    return [...(this.data[collection] || [])];
  }

  findById(collection, id) {
    return (this.data[collection] || []).find(item => item.id === id) || null;
  }

  findOne(collection, predicate) {
    return (this.data[collection] || []).find(predicate) || null;
  }

  filter(collection, predicate) {
    return (this.data[collection] || []).filter(predicate);
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    const record = {
      id: item.id || uuidv4(),
      ...item,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    };
    this.data[collection].push(record);
    this.save();
    return record;
  }

  update(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    if (!this.data[collection]) return false;
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }
}

const db = new DatabaseStore();

module.exports = db;
