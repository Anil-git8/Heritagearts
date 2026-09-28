const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// Helper to find seller profile for a user
const getSellerByUser = (userId) => {
  return db.findOne('seller_profiles', s => s.user_id === userId);
};

// 1. Submit Tradesman Application
exports.applyForTradesman = (req, res, next) => {
  try {
    const userId = req.user.id;
    const shop_name = (req.body.shop_name || req.body.store_name || '').trim();
    const specialization = (req.body.specialization || req.body.craft_type || '').trim();
    const {
      applicant_name,
      phone,
      location,
      address,
      experience_years,
      bio,
      portfolio_url,
      website,
      social_links,
      id_document_type,
      id_document_number,
      bank_details
    } = req.body;

    if (!shop_name || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Shop name and craft/art specialization are required.'
      });
    }

    // Check if user already has an active application or profile
    const existingApp = db.findOne('seller_applications', a => a.user_id === userId && ['pending', 'under_review'].includes(a.status));
    if (existingApp) {
      return res.status(200).json({
        success: true,
        message: 'Your Tradesman application is already under active review.',
        data: existingApp
      });
    }

    const existingProfile = getSellerByUser(userId);
    if (existingProfile && existingProfile.status === 'approved') {
      return res.status(200).json({
        success: true,
        message: 'You are already an approved Tradesman.',
        data: existingProfile
      });
    }

    const newApp = db.insert('seller_applications', {
      user_id: userId,
      applicant_name: applicant_name || req.user.name,
      shop_name: shop_name.trim(),
      email: req.user.email,
      phone: phone || req.user.phone || '',
      location: location || '',
      address: address || '',
      specialization: specialization.trim(),
      experience_years: parseInt(experience_years, 10) || 0,
      bio: bio || '',
      portfolio_url: portfolio_url || '',
      website: website || '',
      social_links: social_links || {},
      id_document_type: id_document_type || 'National ID',
      id_document_number: id_document_number || 'Provided',
      bank_details: bank_details || {},
      status: 'pending',
      notes: 'New Tradesman application submitted.',
      created_at: new Date().toISOString()
    });

    // Notify admins
    const admins = db.filter('users', u => u.role === 'admin');
    admins.forEach(admin => {
      db.insert('notifications', {
        user_id: admin.id,
        title: `New Tradesman Application: ${shop_name} 🛠️`,
        message: `${applicant_name || req.user.name} applied to become a Tradesman specializing in ${specialization}.`,
        type: 'seller_application',
        link: '/admin-sellers.html',
        is_read: false
      });
    });

    // Notify applicant
    db.insert('notifications', {
      user_id: userId,
      title: 'Tradesman Application Received 📋',
      message: `Your application for "${shop_name}" has been received and is currently under platform review.`,
      type: 'account',
      link: '/account.html',
      is_read: false
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our curation team will review your portfolio.',
      data: newApp
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get My Tradesman Profile & Status
exports.getMySellerProfile = (req, res, next) => {
  try {
    const userId = req.user.id;
    let seller = getSellerByUser(userId);
    const application = db.findOne('seller_applications', a => a.user_id === userId);

    if (!seller && !application) {
      return res.json({
        success: true,
        is_seller: false,
        status: 'not_applied',
        profile: null,
        application: null
      });
    }

    if (!seller && application) {
      return res.json({
        success: true,
        is_seller: false,
        status: application.status,
        profile: null,
        application
      });
    }

    // Hydrate counts
    const products = db.filter('products', p => p.seller_id === seller.id);
    const orders = db.filter('seller_orders', o => o.seller_id === seller.id);
    const followers = db.filter('seller_follows', f => f.seller_id === seller.id);
    const reviews = db.filter('seller_reviews', r => r.seller_id === seller.id);

    res.json({
      success: true,
      is_seller: true,
      status: seller.status,
      profile: {
        ...seller,
        products_count: products.length,
        orders_count: orders.length,
        followers_count: followers.length,
        reviews_count: reviews.length
      },
      application
    });
  } catch (err) {
    next(err);
  }
};

// 3. Update Seller Profile
exports.updateSellerProfile = (req, res, next) => {
  try {
    const userId = req.user.id;
    const seller = getSellerByUser(userId);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Tradesman profile not found.' });
    }

    const {
      store_name,
      tagline,
      bio,
      specialization,
      experience_years,
      location,
      address,
      phone,
      website,
      avatar,
      banner,
      bank_details,
      social_links
    } = req.body;

    const updates = {};
    if (store_name) updates.store_name = store_name.trim();
    if (tagline !== undefined) updates.tagline = tagline.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (specialization !== undefined) updates.specialization = specialization.trim();
    if (experience_years !== undefined) updates.experience_years = parseInt(experience_years, 10) || 0;
    if (location !== undefined) updates.location = location.trim();
    if (address !== undefined) updates.address = address.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (website !== undefined) updates.website = website.trim();
    if (avatar) updates.avatar = avatar;
    if (banner) updates.banner = banner;
    if (bank_details) updates.bank_details = { ...(seller.bank_details || {}), ...bank_details };
    if (social_links) updates.social_links = { ...(seller.social_links || {}), ...social_links };

    const updated = db.update('seller_profiles', seller.id, updates);

    res.json({
      success: true,
      message: 'Seller profile updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// 4. Public Seller Profile (by slug or ID)
exports.getPublicSellerProfile = (req, res, next) => {
  try {
    const { identifier } = req.params;
    const seller = db.findOne('seller_profiles', s => (s.slug === identifier || s.id === identifier) && s.status === 'approved');

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Tradesman not found or storefront is inactive.' });
    }

    // Fetch approved active products
    const products = db.filter('products', p => p.seller_id === seller.id && p.status === 'active' && p.approval_status === 'approved');
    const hydratedProducts = products.map(p => {
      const images = db.filter('product_images', img => img.product_id === p.id);
      return {
        ...p,
        primary_image: images[0]?.image_url || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        images
      };
    });

    const reviews = db.filter('seller_reviews', r => r.seller_id === seller.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const followers = db.filter('seller_follows', f => f.seller_id === seller.id);

    let isFollowing = false;
    if (req.user) {
      isFollowing = db.findOne('seller_follows', f => f.seller_id === seller.id && f.user_id === req.user.id) !== null;
    }

    // Do NOT expose private bank details publicly
    const { bank_details, ...safeSeller } = seller;

    res.json({
      success: true,
      data: {
        ...safeSeller,
        followers_count: followers.length,
        is_following: isFollowing,
        products: hydratedProducts,
        products_count: hydratedProducts.length,
        reviews,
        reviews_count: reviews.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// 5. List All Approved Tradesmen (Marketplace Directory)
exports.getSellers = (req, res, next) => {
  try {
    const { search, specialization, location, sort = 'rating' } = req.query;
    let sellers = db.filter('seller_profiles', s => s.status === 'approved');

    if (search) {
      const q = search.toLowerCase();
      sellers = sellers.filter(s =>
        s.store_name.toLowerCase().includes(q) ||
        (s.specialization && s.specialization.toLowerCase().includes(q)) ||
        (s.bio && s.bio.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q))
      );
    }

    if (specialization) {
      sellers = sellers.filter(s => s.specialization && s.specialization.toLowerCase().includes(specialization.toLowerCase()));
    }

    if (location) {
      sellers = sellers.filter(s => s.location && s.location.toLowerCase().includes(location.toLowerCase()));
    }

    // Hydrate product counts & safe fields
    const hydratedSellers = sellers.map(s => {
      const prodCount = db.filter('products', p => p.seller_id === s.id && p.status === 'active' && p.approval_status === 'approved').length;
      const { bank_details, ...safe } = s;
      return {
        ...safe,
        products_count: prodCount
      };
    });

    if (sort === 'rating') {
      hydratedSellers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'sales') {
      hydratedSellers.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    } else if (sort === 'products') {
      hydratedSellers.sort((a, b) => b.products_count - a.products_count);
    }

    res.json({
      success: true,
      data: hydratedSellers,
      total: hydratedSellers.length
    });
  } catch (err) {
    next(err);
  }
};

// 6. Tradesman Dashboard Statistics
exports.getSellerDashboardStats = (req, res, next) => {
  try {
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Tradesman profile required.' });
    }

    const sellerOrders = db.filter('seller_orders', o => o.seller_id === seller.id);
    const sellerProducts = db.filter('products', p => p.seller_id === seller.id);
    const sellerReviews = db.filter('seller_reviews', r => r.seller_id === seller.id);

    const totalSalesRevenue = sellerOrders
      .filter(o => o.order_status !== 'cancelled')
      .reduce((acc, o) => acc + (parseFloat(o.seller_earnings) || parseFloat(o.subtotal) || 0), 0);

    const pendingOrdersCount = sellerOrders.filter(o => ['pending', 'processing'].includes(o.order_status)).length;
    const completedOrdersCount = sellerOrders.filter(o => o.order_status === 'delivered').length;

    // Recent 5 sub-orders
    const recentOrders = sellerOrders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(so => {
        const parent = db.findById('orders', so.order_id);
        return {
          id: so.id,
          seller_order_number: so.seller_order_number,
          order_id: so.order_id,
          parent_order_number: parent ? parent.order_number : 'N/A',
          customer_name: parent?.shipping_address?.name || 'Customer',
          items_count: (so.items || []).length,
          total: so.total,
          seller_earnings: so.seller_earnings,
          order_status: so.order_status,
          created_at: so.created_at
        };
      });

    // Recent 5 products
    const recentProducts = sellerProducts
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(p => {
        const img = db.filter('product_images', i => i.product_id === p.id)[0]?.image_url;
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          approval_status: p.approval_status || 'approved',
          status: p.status,
          image: img || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80'
        };
      });

    res.json({
      success: true,
      data: {
        store_name: seller.store_name,
        available_balance: seller.available_balance || 0,
        pending_balance: seller.pending_balance || 0,
        total_earned: seller.total_earned || totalSalesRevenue,
        rating: seller.rating || 5.0,
        total_products: sellerProducts.length,
        approved_products: sellerProducts.filter(p => p.approval_status === 'approved').length,
        pending_products: sellerProducts.filter(p => p.approval_status === 'pending').length,
        total_orders: sellerOrders.length,
        pending_orders: pendingOrdersCount,
        completed_orders: completedOrdersCount,
        reviews_count: sellerReviews.length,
        recent_orders: recentOrders,
        recent_products: recentProducts
      }
    });
  } catch (err) {
    next(err);
  }
};

// 7. Tradesman Products Management (CRUD)
exports.getSellerProducts = (req, res, next) => {
  try {
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Tradesman profile required.' });
    }

    const products = db.filter('products', p => p.seller_id === seller.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const hydrated = products.map(p => {
      const images = db.filter('product_images', img => img.product_id === p.id);
      const category = db.findById('categories', p.category_id);
      return {
        ...p,
        primary_image: images.find(i => i.is_primary)?.image_url || images[0]?.image_url || '',
        images,
        category_name: category ? category.name : 'General'
      };
    });

    res.json({ success: true, data: hydrated });
  } catch (err) {
    next(err);
  }
};

exports.createSellerProduct = (req, res, next) => {
  try {
    const seller = getSellerByUser(req.user.id);
    if (!seller || seller.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Only verified and approved Tradesmen can list products.' });
    }

    const {
      name,
      description,
      short_description,
      category_id,
      brand_id,
      price,
      compare_price,
      stock,
      sku,
      images = [],
      // Specialized Artwork & Antique Fields
      artist_name,
      creator,
      year_created,
      estimated_age,
      origin_region,
      material,
      technique,
      dimensions,
      weight,
      condition,
      authenticity_type,
      has_certificate,
      signed_by_artist,
      is_handmade,
      edition_info,
      provenance,
      specifications,
      tags
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ success: false, message: 'Product title, price, and category are required.' });
    }

    const settings = db.data.platform_settings || {};
    const autoApprove = settings.auto_approve_products === true;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const productSku = sku || `TRD-${seller.id.substring(0, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct = db.insert('products', {
      name: name.trim(),
      slug,
      description: description || '',
      short_description: short_description || '',
      price: parseFloat(price),
      compare_price: compare_price ? parseFloat(compare_price) : null,
      sku: productSku,
      stock: parseInt(stock, 10) || 1,
      category_id,
      brand_id: brand_id || 'br-004',
      seller_id: seller.id,
      status: 'active',
      approval_status: autoApprove ? 'approved' : 'pending',
      featured: false,
      trending: false,
      rating: 5.0,
      reviews_count: 0,
      // Artwork/Antique attributes
      artist_name: artist_name || seller.store_name,
      creator: creator || artist_name || seller.store_name,
      year_created: year_created || new Date().getFullYear().toString(),
      estimated_age: estimated_age || '',
      origin_region: origin_region || seller.location || '',
      material: material || '',
      technique: technique || '',
      dimensions: dimensions || '',
      weight: weight || '',
      condition: condition || 'New / Original Condition',
      authenticity_type: authenticity_type || (has_certificate ? 'Certificate Provided' : 'Seller Authenticated'),
      has_certificate: Boolean(has_certificate),
      signed_by_artist: Boolean(signed_by_artist),
      is_handmade: is_handmade !== undefined ? Boolean(is_handmade) : true,
      edition_info: edition_info || 'Original Piece',
      provenance: provenance || '',
      specifications: specifications || {},
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : ['Handcrafted', 'Marketplace'])
    });

    // Save product images
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((imgUrl, idx) => {
        if (imgUrl) {
          db.insert('product_images', {
            product_id: newProduct.id,
            image_url: imgUrl,
            is_primary: idx === 0,
            sort_order: idx + 1
          });
        }
      });
    } else {
      // Default placeholder
      db.insert('product_images', {
        product_id: newProduct.id,
        image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1
      });
    }

    // Notify admins for review
    if (!autoApprove) {
      const admins = db.filter('users', u => u.role === 'admin');
      admins.forEach(admin => {
        db.insert('notifications', {
          user_id: admin.id,
          title: `Product Pending Review: ${name} 🎨`,
          message: `${seller.store_name} added a new listing for review.`,
          type: 'product_approval',
          link: '/admin-products.html',
          is_read: false
        });
      });
    }

    res.status(201).json({
      success: true,
      message: autoApprove
        ? 'Product published to marketplace successfully!'
        : 'Product submitted for curator review. It will become visible once approved.',
      data: newProduct
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSellerProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const product = db.findById('products', id);
    if (!product || product.seller_id !== seller.id) {
      return res.status(404).json({ success: false, message: 'Product not found or does not belong to your store.' });
    }

    const {
      name,
      description,
      short_description,
      category_id,
      price,
      compare_price,
      stock,
      status,
      artist_name,
      origin_region,
      material,
      technique,
      dimensions,
      weight,
      condition,
      has_certificate,
      signed_by_artist,
      is_handmade,
      specifications
    } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (short_description !== undefined) updates.short_description = short_description;
    if (category_id) updates.category_id = category_id;
    if (price !== undefined) updates.price = parseFloat(price);
    if (compare_price !== undefined) updates.compare_price = compare_price ? parseFloat(compare_price) : null;
    if (stock !== undefined) updates.stock = parseInt(stock, 10);
    if (status && ['active', 'draft', 'inactive'].includes(status)) updates.status = status;
    if (artist_name !== undefined) updates.artist_name = artist_name;
    if (origin_region !== undefined) updates.origin_region = origin_region;
    if (material !== undefined) updates.material = material;
    if (technique !== undefined) updates.technique = technique;
    if (dimensions !== undefined) updates.dimensions = dimensions;
    if (weight !== undefined) updates.weight = weight;
    if (condition !== undefined) updates.condition = condition;
    if (has_certificate !== undefined) updates.has_certificate = Boolean(has_certificate);
    if (signed_by_artist !== undefined) updates.signed_by_artist = Boolean(signed_by_artist);
    if (is_handmade !== undefined) updates.is_handmade = Boolean(is_handmade);
    if (specifications !== undefined) updates.specifications = specifications;

    const updated = db.update('products', id, updates);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSellerProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const product = db.findById('products', id);
    if (!product || product.seller_id !== seller.id) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied.' });
    }

    db.delete('products', id);
    // Cleanup images
    const images = db.filter('product_images', i => i.product_id === id);
    images.forEach(img => db.delete('product_images', img.id));

    res.json({ success: true, message: 'Product deleted from store.' });
  } catch (err) {
    next(err);
  }
};

// 8. Tradesman Orders Management (Fulfillment of Sub-Orders)
exports.getSellerOrders = (req, res, next) => {
  try {
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const sellerOrders = db.filter('seller_orders', so => so.seller_id === seller.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const hydrated = sellerOrders.map(so => {
      const parent = db.findById('orders', so.order_id);
      return {
        ...so,
        parent_order_number: parent ? parent.order_number : 'N/A',
        shipping_address: parent ? parent.shipping_address : null,
        payment_status: parent ? parent.payment_status : 'pending',
        payment_method: parent ? parent.payment_method : 'cod'
      };
    });

    res.json({ success: true, data: hydrated });
  } catch (err) {
    next(err);
  }
};

exports.updateSellerOrderStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { order_status, tracking_number, courier_name, tracking_url } = req.body;
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const sellerOrder = db.findById('seller_orders', id);
    if (!sellerOrder || sellerOrder.seller_id !== seller.id) {
      return res.status(404).json({ success: false, message: 'Order not found or does not belong to your store.' });
    }

    const updates = {};
    if (order_status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order_status)) {
      updates.order_status = order_status;
    }
    if (tracking_number) updates.tracking_number = tracking_number;
    if (courier_name) updates.courier_name = courier_name;
    if (tracking_url) updates.tracking_url = tracking_url;

    // If delivered, move pending balance to available balance
    if (order_status === 'delivered' && sellerOrder.order_status !== 'delivered') {
      const earnings = parseFloat(sellerOrder.seller_earnings || sellerOrder.subtotal || 0);
      const newAvail = (seller.available_balance || 0) + earnings;
      const newPend = Math.max(0, (seller.pending_balance || 0) - earnings);
      db.update('seller_profiles', seller.id, {
        available_balance: Math.round(newAvail * 100) / 100,
        pending_balance: Math.round(newPend * 100) / 100,
        sales_count: (seller.sales_count || 0) + 1
      });
    }

    const updated = db.update('seller_orders', id, updates);

    // Notify Customer
    const parent = db.findById('orders', sellerOrder.order_id);
    if (parent && parent.user_id) {
      db.insert('notifications', {
        user_id: parent.user_id,
        title: `Order Update from ${seller.store_name} 🚚`,
        message: `Your package from order #${parent.order_number} is now ${order_status.toUpperCase()}.`,
        type: 'order',
        link: `/order-tracking.html?order=${parent.order_number}`,
        is_read: false
      });
    }

    res.json({
      success: true,
      message: `Seller order status updated to ${order_status}.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// 9. Tradesman Payouts & Balance Ledger
exports.getSellerPayouts = (req, res, next) => {
  try {
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const payouts = db.filter('payouts', p => p.seller_id === seller.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: {
        available_balance: seller.available_balance || 0,
        pending_balance: seller.pending_balance || 0,
        total_earned: seller.total_earned || 0,
        bank_details: seller.bank_details || {},
        payouts
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.requestPayout = (req, res, next) => {
  try {
    const seller = getSellerByUser(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const { amount, payment_method = 'bank_transfer', notes = '' } = req.body;
    const reqAmount = parseFloat(amount);
    const settings = db.data.platform_settings || {};
    const threshold = parseFloat(settings.payout_threshold || 1000);

    if (!reqAmount || reqAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payout withdrawal amount.' });
    }

    if (reqAmount < threshold) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout withdrawal amount is ₹${threshold}.`
      });
    }

    if (reqAmount > (seller.available_balance || 0)) {
      return res.status(400).json({
        success: false,
        message: `Requested amount (₹${reqAmount}) exceeds available balance (₹${seller.available_balance || 0}).`
      });
    }

    // Deduct from available balance immediately
    const updatedBalance = Math.round(((seller.available_balance || 0) - reqAmount) * 100) / 100;
    db.update('seller_profiles', seller.id, { available_balance: updatedBalance });

    const payoutNum = `PAY-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPayout = db.insert('payouts', {
      payout_number: payoutNum,
      seller_id: seller.id,
      amount: reqAmount,
      currency: 'INR',
      status: 'pending',
      payment_method,
      bank_details: seller.bank_details || {},
      notes,
      created_at: new Date().toISOString()
    });

    // Notify Admins
    const admins = db.filter('users', u => u.role === 'admin');
    admins.forEach(admin => {
      db.insert('notifications', {
        user_id: admin.id,
        title: `New Payout Request: ₹${reqAmount} 💰`,
        message: `${seller.store_name} requested a withdrawal of ₹${reqAmount}.`,
        type: 'payout',
        link: '/admin-payouts.html',
        is_read: false
      });
    });

    res.status(201).json({
      success: true,
      message: 'Payout withdrawal requested successfully. The transfer will be processed within 1-2 business days.',
      data: newPayout
    });
  } catch (err) {
    next(err);
  }
};

// 10. Buyer Follow / Unfollow Tradesman
exports.toggleFollowSeller = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { seller_id } = req.body;

    if (!seller_id) {
      return res.status(400).json({ success: false, message: 'Seller ID is required.' });
    }

    const seller = db.findById('seller_profiles', seller_id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Tradesman not found.' });
    }

    const existing = db.findOne('seller_follows', f => f.user_id === userId && f.seller_id === seller_id);
    let isFollowing = false;

    if (existing) {
      db.delete('seller_follows', existing.id);
      isFollowing = false;
    } else {
      db.insert('seller_follows', {
        user_id: userId,
        seller_id,
        created_at: new Date().toISOString()
      });
      isFollowing = true;
    }

    const totalFollowers = db.filter('seller_follows', f => f.seller_id === seller_id).length;

    res.json({
      success: true,
      message: isFollowing ? `You are now following ${seller.store_name}! 🌟` : `Unfollowed ${seller.store_name}.`,
      is_following: isFollowing,
      followers_count: totalFollowers
    });
  } catch (err) {
    next(err);
  }
};

// 11. Create Seller Review
exports.createSellerReview = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { seller_id, rating, title, comment } = req.body;

    if (!seller_id || !rating) {
      return res.status(400).json({ success: false, message: 'Seller ID and star rating are required.' });
    }

    const seller = db.findById('seller_profiles', seller_id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Tradesman not found.' });
    }

    const newReview = db.insert('seller_reviews', {
      seller_id,
      user_id: userId,
      user_name: req.user.name,
      rating: parseInt(rating, 10),
      title: title ? title.trim() : 'Tradesman Review',
      comment: comment ? comment.trim() : '',
      is_verified_buyer: true,
      created_at: new Date().toISOString()
    });

    // Recalculate seller rating
    const allReviews = db.filter('seller_reviews', r => r.seller_id === seller_id);
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    db.update('seller_profiles', seller_id, {
      rating: Math.round(avgRating * 10) / 10,
      reviews_count: allReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reviewing this Tradesman!',
      data: newReview
    });
  } catch (err) {
    next(err);
  }
};
