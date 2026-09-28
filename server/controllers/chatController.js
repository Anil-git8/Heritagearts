const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// 1. Get User's Conversations (Buyer or Seller)
exports.getConversations = (req, res, next) => {
  try {
    const userId = req.user.id;
    const seller = db.findOne('seller_profiles', s => s.user_id === userId);

    let chats = [];
    if (req.user.role === 'admin') {
      chats = db.findAll('chats');
    } else if (seller) {
      // User is a seller (can be involved as seller or buyer)
      chats = db.filter('chats', c => c.seller_id === seller.id || c.buyer_id === userId);
    } else {
      // User is a regular buyer
      chats = db.filter('chats', c => c.buyer_id === userId);
    }

    chats.sort((a, b) => new Date(b.last_message_at || b.updated_at) - new Date(a.last_message_at || a.updated_at));

    const hydrated = chats.map(chat => {
      const buyer = db.findById('users', chat.buyer_id);
      const sellerProfile = db.findById('seller_profiles', chat.seller_id);
      const product = chat.product_id ? db.findById('products', chat.product_id) : null;
      const order = chat.order_id ? db.findById('orders', chat.order_id) : null;

      const prodImg = product ? db.filter('product_images', i => i.product_id === product.id)[0]?.image_url : null;

      const isBuyer = chat.buyer_id === userId;

      return {
        id: chat.id,
        buyer_id: chat.buyer_id,
        seller_id: chat.seller_id,
        buyer_name: buyer ? buyer.name : 'Customer',
        buyer_avatar: buyer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        seller_name: sellerProfile ? sellerProfile.store_name : 'Tradesman',
        seller_avatar: sellerProfile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        seller_verified: sellerProfile?.is_verified || false,
        product_id: chat.product_id,
        product_name: product ? product.name : null,
        product_price: product ? product.price : null,
        product_image: prodImg,
        order_id: chat.order_id,
        order_number: order ? order.order_number : null,
        last_message: chat.last_message || 'Started conversation',
        last_message_at: chat.last_message_at || chat.created_at,
        unread_count: isBuyer ? (chat.buyer_unread || 0) : (chat.seller_unread || 0),
        created_at: chat.created_at
      };
    });

    res.json({ success: true, data: hydrated });
  } catch (err) {
    next(err);
  }
};

// 2. Start or Open Chat with a Seller
exports.startOrGetChat = (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { seller_id, product_id, order_id, initial_message } = req.body;

    if (!seller_id) {
      return res.status(400).json({ success: false, message: 'Seller ID is required to start a chat.' });
    }

    const seller = db.findById('seller_profiles', seller_id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Tradesman not found.' });
    }

    // Check if chat already exists for this buyer, seller, and product
    let chat = db.findOne('chats', c =>
      c.buyer_id === buyerId &&
      c.seller_id === seller_id &&
      (!product_id || c.product_id === product_id)
    );

    if (!chat) {
      chat = db.insert('chats', {
        buyer_id: buyerId,
        seller_id,
        product_id: product_id || null,
        order_id: order_id || null,
        last_message: initial_message || 'Inquiry started',
        last_message_at: new Date().toISOString(),
        buyer_unread: 0,
        seller_unread: initial_message ? 1 : 0
      });

      if (initial_message) {
        db.insert('messages', {
          chat_id: chat.id,
          sender_id: buyerId,
          sender_role: 'buyer',
          message: initial_message.trim(),
          attachment_url: null,
          is_read: false
        });

        // Notify Seller
        if (seller.user_id) {
          db.insert('notifications', {
            user_id: seller.user_id,
            title: `New Message from ${req.user.name} 💬`,
            message: initial_message.substring(0, 100),
            type: 'chat',
            link: `/seller-dashboard.html#messages`,
            is_read: false
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        id: chat.id,
        chat_id: chat.id,
        seller_name: seller.store_name,
        seller_avatar: seller.avatar,
        seller_verified: seller.is_verified
      }
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get Messages for a Chat
exports.getChatMessages = (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = db.findById('chats', chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const seller = db.findById('seller_profiles', chat.seller_id);
    const isSellerOwner = seller && seller.user_id === userId;
    const isBuyer = chat.buyer_id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSellerOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You cannot view this private chat.' });
    }

    const messages = db.filter('messages', m => m.chat_id === chatId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Clear unread count for the active reader
    if (isBuyer && chat.buyer_unread > 0) {
      db.update('chats', chatId, { buyer_unread: 0 });
    } else if (isSellerOwner && chat.seller_unread > 0) {
      db.update('chats', chatId, { seller_unread: 0 });
    }

    const buyer = db.findById('users', chat.buyer_id);
    const product = chat.product_id ? db.findById('products', chat.product_id) : null;
    const prodImg = product ? db.filter('product_images', i => i.product_id === product.id)[0]?.image_url : null;

    res.json({
      success: true,
      chat: {
        id: chat.id,
        buyer_id: chat.buyer_id,
        buyer_name: buyer?.name || 'Customer',
        buyer_avatar: buyer?.avatar,
        seller_id: chat.seller_id,
        seller_name: seller?.store_name || 'Tradesman',
        seller_avatar: seller?.avatar,
        seller_verified: seller?.is_verified,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image: prodImg
        } : null
      },
      messages
    });
  } catch (err) {
    next(err);
  }
};

// 4. Send Message in a Chat
exports.sendMessage = (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { message, attachment_url } = req.body;

    if (!message && !attachment_url) {
      return res.status(400).json({ success: false, message: 'Message content or attachment is required.' });
    }

    const chat = db.findById('chats', chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const seller = db.findById('seller_profiles', chat.seller_id);
    const isSellerOwner = seller && seller.user_id === userId;
    const isBuyer = chat.buyer_id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSellerOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You cannot send messages in this chat.' });
    }

    const senderRole = isBuyer ? 'buyer' : (isSellerOwner ? 'seller' : 'admin');

    const newMsg = db.insert('messages', {
      chat_id: chatId,
      sender_id: userId,
      sender_role: senderRole,
      message: (message || '').trim(),
      attachment_url: attachment_url || null,
      is_read: false
    });

    // Update conversation metadata & unread badges
    const updates = {
      last_message: (message || 'Sent an attachment').trim(),
      last_message_at: new Date().toISOString()
    };

    if (isBuyer) {
      updates.seller_unread = (chat.seller_unread || 0) + 1;
      // Send notification to seller
      if (seller && seller.user_id) {
        db.insert('notifications', {
          user_id: seller.user_id,
          title: `Message from ${req.user.name} 💬`,
          message: (message || 'Sent an image attachment').substring(0, 100),
          type: 'chat',
          link: `/seller-dashboard.html#messages`,
          is_read: false
        });
      }
    } else if (isSellerOwner) {
      updates.buyer_unread = (chat.buyer_unread || 0) + 1;
      // Send notification to buyer
      db.insert('notifications', {
        user_id: chat.buyer_id,
        title: `Reply from ${seller.store_name} 💬`,
        message: (message || 'Sent an image attachment').substring(0, 100),
        type: 'chat',
        link: `/chat.html?chat=${chat.id}`,
        is_read: false
      });
    }

    db.update('chats', chatId, updates);

    res.status(201).json({
      success: true,
      data: newMsg
    });
  } catch (err) {
    next(err);
  }
};

// 5. Report Conversation / Message for Moderation
exports.reportChat = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chat_id, message_id, reason, details } = req.body;

    if (!chat_id || !reason) {
      return res.status(400).json({ success: false, message: 'Chat ID and report reason are required.' });
    }

    const newReport = db.insert('reports', {
      user_id: userId,
      reporter_name: req.user.name,
      chat_id,
      message_id: message_id || null,
      reason: reason.trim(),
      details: details || '',
      status: 'pending',
      created_at: new Date().toISOString()
    });

    // Notify admins
    const admins = db.filter('users', u => u.role === 'admin');
    admins.forEach(admin => {
      db.insert('notifications', {
        user_id: admin.id,
        title: `New Chat Moderation Report 🚩`,
        message: `User ${req.user.name} reported a conversation for: ${reason}`,
        type: 'moderation',
        link: '/admin-disputes.html',
        is_read: false
      });
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will investigate promptly.',
      data: newReport
    });
  } catch (err) {
    next(err);
  }
};
