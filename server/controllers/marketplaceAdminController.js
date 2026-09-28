const db = require('../models/db');
const bcrypt = require('bcryptjs');

// 1. Get Seller Applications
exports.getSellerApplications = (req, res, next) => {
  try {
    const { status } = req.query;
    let apps = db.findAll('seller_applications');
    if (status) {
      apps = apps.filter(a => a.status === status);
    }
    apps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: apps });
  } catch (err) {
    next(err);
  }
};

// 2. Review / Approve / Reject Seller Application
exports.reviewSellerApplication = (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason, notes } = req.body; // action: 'approve' | 'reject' | 'under_review'

    const app = db.findById('seller_applications', id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Seller application not found.' });
    }

    if (action === 'approve') {
      // 1. Update application status
      db.update('seller_applications', id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: notes || 'Application approved by platform curator.'
      });

      // 2. Update user role to 'tradesman'
      db.update('users', app.user_id, { role: 'tradesman' });

      // 3. Create or activate seller profile
      const slug = app.shop_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
      let profile = db.findOne('seller_profiles', s => s.user_id === app.user_id);
      if (!profile) {
        profile = db.insert('seller_profiles', {
          user_id: app.user_id,
          store_name: app.shop_name,
          slug,
          tagline: `Master ${app.specialization}`,
          bio: app.bio || `Specialist in authentic handmade ${app.specialization}.`,
          specialization: app.specialization,
          experience_years: app.experience_years || 1,
          rating: 5.0,
          reviews_count: 0,
          sales_count: 0,
          is_verified: true,
          verification_badge: 'Verified Tradesman',
          location: app.location || 'India',
          address: app.address || '',
          phone: app.phone || '',
          email: app.email || '',
          website: app.website || '',
          status: 'approved',
          banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          available_balance: 0.00,
          pending_balance: 0.00,
          total_earned: 0.00,
          bank_details: app.bank_details || {},
          social_links: app.social_links || {}
        });
      } else {
        db.update('seller_profiles', profile.id, { status: 'approved', is_verified: true });
      }

      // 4. Notify applicant
      db.insert('notifications', {
        user_id: app.user_id,
        title: '🎉 Congratulations! You are now a Verified Tradesman',
        message: `Your storefront "${app.shop_name}" has been approved. You can now access the Tradesman Dashboard and list your artworks/antiques.`,
        type: 'seller_application',
        link: '/seller-dashboard.html',
        is_read: false
      });

      return res.json({
        success: true,
        message: `Tradesman application for "${app.shop_name}" approved successfully! Storefront created.`,
        data: profile
      });
    } else if (action === 'reject') {
      db.update('seller_applications', id, {
        status: 'rejected',
        rejection_reason: rejection_reason || 'Application did not meet our current curation criteria.',
        rejected_at: new Date().toISOString()
      });

      db.insert('notifications', {
        user_id: app.user_id,
        title: 'Tradesman Application Update',
        message: `Your application for "${app.shop_name}" was not approved: ${rejection_reason || 'Does not meet curation guidelines.'}`,
        type: 'seller_application',
        link: '/account.html',
        is_read: false
      });

      return res.json({
        success: true,
        message: 'Application rejected.'
      });
    } else {
      db.update('seller_applications', id, { status: 'under_review', notes });
      return res.json({ success: true, message: 'Application moved to under review.' });
    }
  } catch (err) {
    next(err);
  }
};

// 3. Get All Tradesmen (Admin management)
exports.getAdminSellers = (req, res, next) => {
  try {
    const sellers = db.findAll('seller_profiles')
      .map(s => {
        const user = db.findById('users', s.user_id);
        const prods = db.filter('products', p => p.seller_id === s.id);
        const orders = db.filter('seller_orders', o => o.seller_id === s.id);
        return {
          ...s,
          user_email: user?.email,
          user_name: user?.name,
          products_count: prods.length,
          orders_count: orders.length
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: sellers });
  } catch (err) {
    next(err);
  }
};

// 4. Update Tradesman Status (Suspend / Verify / Feature)
exports.updateSellerStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, is_verified, verification_badge } = req.body;

    const seller = db.findById('seller_profiles', id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Tradesman not found.' });
    }

    const updates = {};
    if (status && ['approved', 'pending', 'suspended', 'rejected'].includes(status)) {
      updates.status = status;
      // If suspending, update products status as well
      if (status === 'suspended') {
        const prods = db.filter('products', p => p.seller_id === id);
        prods.forEach(p => db.update('products', p.id, { status: 'inactive' }));
      }
    }
    if (is_verified !== undefined) updates.is_verified = Boolean(is_verified);
    if (verification_badge) updates.verification_badge = verification_badge;

    const updated = db.update('seller_profiles', id, updates);

    res.json({
      success: true,
      message: `Tradesman status updated to ${status || 'updated'}.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// 5. Product Approval Queue & Moderation
exports.getPendingProducts = (req, res, next) => {
  try {
    const pendingProducts = db.filter('products', p => p.approval_status === 'pending')
      .map(p => {
        const seller = db.findById('seller_profiles', p.seller_id);
        const images = db.filter('product_images', i => i.product_id === p.id);
        return {
          ...p,
          seller_name: seller ? seller.store_name : 'Unknown Seller',
          images
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: pendingProducts });
  } catch (err) {
    next(err);
  }
};

exports.moderateProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body; // action: 'approve' | 'reject' | 'feature' | 'unfeature'

    const product = db.findById('products', id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const seller = db.findById('seller_profiles', product.seller_id);

    if (action === 'approve') {
      db.update('products', id, {
        approval_status: 'approved',
        status: 'active',
        approved_at: new Date().toISOString()
      });

      if (seller && seller.user_id) {
        db.insert('notifications', {
          user_id: seller.user_id,
          title: `Product Approved: "${product.name}" 🎨`,
          message: 'Your product listing has passed curation review and is now live on the marketplace.',
          type: 'product_approval',
          link: `/product-details.html?id=${product.id}`,
          is_read: false
        });
      }

      return res.json({ success: true, message: `Product "${product.name}" approved and published to marketplace!` });
    } else if (action === 'reject') {
      db.update('products', id, {
        approval_status: 'rejected',
        status: 'inactive',
        rejection_reason: rejection_reason || 'Does not comply with artwork provenance or authenticity standards.'
      });

      if (seller && seller.user_id) {
        db.insert('notifications', {
          user_id: seller.user_id,
          title: `Product Review Update: "${product.name}"`,
          message: `Listing was rejected: ${rejection_reason || 'Did not meet curation standards.'}`,
          type: 'product_approval',
          link: '/seller-dashboard.html#products',
          is_read: false
        });
      }

      return res.json({ success: true, message: `Product "${product.name}" rejected.` });
    } else if (action === 'feature') {
      db.update('products', id, { featured: true });
      return res.json({ success: true, message: `Product featured on homepage.` });
    } else if (action === 'unfeature') {
      db.update('products', id, { featured: false });
      return res.json({ success: true, message: `Product unfeatured.` });
    }
  } catch (err) {
    next(err);
  }
};

// 6. Marketplace Payouts Processing
exports.getAdminPayouts = (req, res, next) => {
  try {
    const payouts = db.findAll('payouts')
      .map(p => {
        const seller = db.findById('seller_profiles', p.seller_id);
        return {
          ...p,
          seller_name: seller ? seller.store_name : 'Tradesman',
          seller_location: seller?.location
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: payouts });
  } catch (err) {
    next(err);
  }
};

exports.processPayout = (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, transaction_reference, notes } = req.body; // action: 'complete' | 'reject'

    const payout = db.findById('payouts', id);
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout request not found.' });
    }

    const seller = db.findById('seller_profiles', payout.seller_id);

    if (action === 'complete') {
      if (!transaction_reference) {
        return res.status(400).json({ success: false, message: 'Bank/UPI transaction reference is required to complete payout.' });
      }

      db.update('payouts', id, {
        status: 'paid',
        transaction_reference,
        notes: notes || 'Payout processed via direct bank wire.',
        processed_at: new Date().toISOString()
      });

      // Update seller total earned
      if (seller) {
        db.update('seller_profiles', seller.id, {
          total_earned: Math.round(((seller.total_earned || 0) + payout.amount) * 100) / 100
        });

        if (seller.user_id) {
          db.insert('notifications', {
            user_id: seller.user_id,
            title: `Payout Processed: ₹${payout.amount} 💳`,
            message: `Your withdrawal #${payout.payout_number} has been transferred. Ref: ${transaction_reference}`,
            type: 'payout',
            link: '/seller-dashboard.html#payouts',
            is_read: false
          });
        }
      }

      return res.json({ success: true, message: `Payout #${payout.payout_number} marked as completed!` });
    } else if (action === 'reject') {
      // Refund back to seller available balance
      if (seller) {
        const refunded = Math.round(((seller.available_balance || 0) + payout.amount) * 100) / 100;
        db.update('seller_profiles', seller.id, { available_balance: refunded });

        if (seller.user_id) {
          db.insert('notifications', {
            user_id: seller.user_id,
            title: `Payout Request Rejected #${payout.payout_number}`,
            message: `Amount ₹${payout.amount} has been refunded to your available balance. Reason: ${notes || 'Bank account details mismatch.'}`,
            type: 'payout',
            link: '/seller-dashboard.html#payouts',
            is_read: false
          });
        }
      }

      db.update('payouts', id, {
        status: 'rejected',
        notes: notes || 'Rejected by finance admin.',
        rejected_at: new Date().toISOString()
      });

      return res.json({ success: true, message: `Payout request rejected and balance restored to seller.` });
    }
  } catch (err) {
    next(err);
  }
};

// 7. Platform Marketplace Settings (Commission, Currency, Policies)
exports.getPlatformSettings = (req, res, next) => {
  try {
    const settings = db.data.platform_settings || {
      commission_rate: 10,
      auto_approve_products: false,
      currency: 'INR',
      currency_symbol: '₹',
      payout_threshold: 1000
    };
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

exports.updatePlatformSettings = (req, res, next) => {
  try {
    const { commission_rate, auto_approve_products, payout_threshold, marketplace_name } = req.body;

    const current = db.data.platform_settings || {};
    db.data.platform_settings = {
      ...current,
      commission_rate: commission_rate !== undefined ? parseFloat(commission_rate) : (current.commission_rate || 10),
      auto_approve_products: auto_approve_products !== undefined ? Boolean(auto_approve_products) : (current.auto_approve_products || false),
      payout_threshold: payout_threshold !== undefined ? parseFloat(payout_threshold) : (current.payout_threshold || 1000),
      marketplace_name: marketplace_name ? marketplace_name.trim() : (current.marketplace_name || 'Art & Heritage Marketplace')
    };
    db.save();

    res.json({
      success: true,
      message: 'Platform marketplace settings saved successfully.',
      data: db.data.platform_settings
    });
  } catch (err) {
    next(err);
  }
};

// 8. Disputes and Moderation Reports
exports.getDisputes = (req, res, next) => {
  try {
    const reports = db.findAll('reports')
      .map(r => {
        const reporter = db.findById('users', r.user_id);
        const chat = r.chat_id ? db.findById('chats', r.chat_id) : null;
        return {
          ...r,
          reporter_name: reporter ? reporter.name : 'User',
          chat_info: chat
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

exports.resolveDispute = (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution_notes, status = 'resolved' } = req.body;

    const report = db.findById('reports', id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const updated = db.update('reports', id, {
      status,
      resolution_notes: resolution_notes || 'Resolved by moderator.',
      resolved_at: new Date().toISOString()
    });

    res.json({ success: true, message: 'Report resolved.', data: updated });
  } catch (err) {
    next(err);
  }
};
