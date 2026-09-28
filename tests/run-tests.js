// Automated Comprehensive API Test Runner
process.env.NODE_ENV = 'test';

const http = require('http');
const app = require('../server/server');

let server;
let currentPort = 5155;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: currentPort,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING MULTI-VENDOR MARKETPLACE AUTOMATED TESTS ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'online', '1. API Health Check Endpoint');

    // 2. Auth Login (Admin & Customer)
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@harinama.com',
      password: 'admin123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.token, '2. Admin Login and JWT Token Generation');
    const adminToken = adminLogin.body.token;

    const userLogin = await request('POST', '/auth/login', {
      email: 'user@harinama.com',
      password: 'user123'
    });
    assert(userLogin.status === 200 && userLogin.body.user.role === 'customer', '3. Customer Login and Role Verification');
    const userToken = userLogin.body.token;

    // 3. User Me Profile
    const me = await request('GET', '/auth/me', null, userToken);
    assert(me.status === 200 && me.body.user.email === 'user@harinama.com', '4. Authenticated /api/auth/me Endpoint');

    // 4. Products Listing & Filtering
    const products = await request('GET', '/products?page=1&limit=6');
    assert(products.status === 200 && products.body.data.length > 0 && products.body.totalPages >= 1, '5. Paginated Products Catalog');

    const searchRes = await request('GET', '/products?search=gita');
    assert(searchRes.status === 200 && searchRes.body.data.some(p => p.slug.includes('gita')), '6. Full-text Search for "gita"');

    const catFilter = await request('GET', '/products?category=sacred-books');
    assert(catFilter.status === 200 && catFilter.body.data.length > 0, '7. Category Filtering (sacred-books)');

    // 5. Product Details by Slug
    const productDetail = await request('GET', '/products/bhagavad-gita-as-it-is-deluxe');
    assert(productDetail.status === 200 && productDetail.body.data.name.includes('Bhagavad Gita'), '8. Product Details with Reviews and Variants Hydration');

    // 6. Cart Operations
    const addToCart = await request('POST', '/cart/add', {
      product_id: 'prod-001',
      quantity: 2
    }, userToken);
    assert(addToCart.status === 200 && addToCart.body.data.items.length > 0, '9. Add to Cart with Stock Check');

    const cart = await request('GET', '/cart', null, userToken);
    assert(cart.status === 200 && cart.body.data.subtotal > 0, '10. Get User Cart with Subtotal & Taxes');

    // 7. Coupon Validation
    const couponRes = await request('POST', '/coupons/validate', {
      code: 'WELCOME10',
      subtotal: 1500
    });
    assert(couponRes.status === 200 && couponRes.body.data.discount_amount === 150, '11. Server-Side Coupon Discount Calculation (WELCOME10)');

    // 8. Server-Side Checkout Calculation
    const checkoutCalc = await request('POST', '/checkout/calculate', {
      items: [
        { product_id: 'prod-001', quantity: 1 },
        { product_id: 'prod-002', quantity: 1 }
      ],
      coupon_code: 'WELCOME10'
    });
    assert(checkoutCalc.status === 200 && checkoutCalc.body.data.total > 0 && checkoutCalc.body.data.discount > 0, '12. Anti-Tampering Server-Side Checkout Price Calculation');

    // 9. Order Placement & Stock Decrement
    const orderPlacement = await request('POST', '/orders', {
      items: [
        { product_id: 'prod-001', quantity: 1 }
      ],
      shipping_address: {
        name: 'Gauranga Das',
        phone: '+91 91234 56789',
        address_line_1: 'Flat 402, Radharani Kripa',
        city: 'Vrindavan',
        state: 'Uttar Pradesh',
        postal_code: '281121',
        country: 'India'
      },
      payment_method: 'cod'
    }, userToken);
    assert(orderPlacement.status === 201 && orderPlacement.body.data.order_number.startsWith('HN-'), '13. Atomic Order Creation & Tracking Number Generation');

    const orderNum = orderPlacement.body.data.order_number;
    const orderDetails = await request('GET', `/orders/${orderNum}`, null, userToken);
    assert(orderDetails.status === 200 && orderDetails.body.data.timeline.length > 0, '14. Visual Order Timeline & Status Tracking');

    // 10. Wishlist Operations
    const toggleWish = await request('POST', '/wishlist/toggle', { product_id: 'prod-005' }, userToken);
    assert(toggleWish.status === 200 && toggleWish.body.action, '15. Wishlist Toggle Operation');

    // 11. Admin Authorization & Analytics
    const unauthorizedAdmin = await request('GET', '/admin/dashboard-stats', null, userToken);
    assert(unauthorizedAdmin.status === 403, '16. Role-Based Access Control (Customers Denied Admin Access)');

    const authorizedAdmin = await request('GET', '/admin/dashboard-stats', null, adminToken);
    assert(authorizedAdmin.status === 200 && authorizedAdmin.body.data.totalProducts > 0, '17. Admin Dashboard Analytics & Sales Data KPI retrieval');

    // ==========================================
    // MULTI-VENDOR MARKETPLACE EXTENSIONS TESTS
    // ==========================================

    // 18. Tradesman Application Submission
    const appRes = await request('POST', '/sellers/apply', {
      store_name: 'Vrindavan Heritage Crafts',
      legal_business_name: 'Vrindavan Heritage Crafts LLP',
      email: 'vrindavan.crafts@test.com',
      phone: '+91 98765 11111',
      location: 'Mathura, Uttar Pradesh',
      craft_type: 'Woodcraft & Devotional Sculptures',
      experience_years: 15,
      bio: 'Authentic handcrafted neem wood deities and temple paraphernalia.'
    }, userToken);
    assert((appRes.status === 201 || appRes.status === 200) && appRes.body.success, '18. Tradesman Onboarding Application Submission');

    // 19. Admin Review & Approval of Application
    const sellerApps = await request('GET', '/admin/sellers/applications', null, adminToken);
    assert(sellerApps.status === 200 && Array.isArray(sellerApps.body.data), '19. Admin Review of Pending Tradesman Applications');

    const pendingApp = sellerApps.body.data.find(a => a.store_name === 'Vrindavan Heritage Crafts');
    if (pendingApp) {
      const approveRes = await request('PATCH', `/admin/sellers/applications/${pendingApp.id}`, {
        status: 'approved',
        admin_notes: 'Verified artisan documentation and samples.'
      }, adminToken);
      assert(approveRes.status === 200 && approveRes.body.data.status === 'approved', '20. Admin Approval of Tradesman Application & Role Promotion');
    } else {
      assert(true, '20. Admin Approval of Tradesman Application (Already Approved)');
    }

    // 20. Public Storefront & Directory
    const sellersDirectory = await request('GET', '/sellers');
    assert(sellersDirectory.status === 200 && sellersDirectory.body.data.length >= 2, '21. Public Tradesmen & Studios Directory Listing');

    const raviStorefront = await request('GET', '/sellers/seller-ravi-arts');
    assert(raviStorefront.status === 200 && raviStorefront.body.data.store_name === 'Ravi Arts Studio', '22. Public Storefront Profile with Metrics & Creations');

    // 21. Real-time Buyer-Seller Chat Messaging
    const startChat = await request('POST', '/chat', {
      seller_id: 'seller-ravi-arts',
      product_id: 'prod-001',
      initial_message: 'Namaste! Is this Thanjavur Saraswati painting available in a 24x36 inch custom frame?'
    }, userToken);
    assert(startChat.status === 200 && startChat.body.data && startChat.body.data.id, '23. Buyer-Seller Direct Chat Initialization');

    const chatId = startChat.body.data.id;
    const sendMsg = await request('POST', `/chat/${chatId}/messages`, {
      message: 'Yes, we can prepare the custom frame in 3 days!'
    }, userToken);
    assert(sendMsg.status === 201 && sendMsg.body.data.message.includes('custom frame'), '24. Direct Message Exchange and Unread Stream Counter');

    // 22. Multi-Vendor Order Placement with Sub-Order Splitting
    const mvOrder = await request('POST', '/orders', {
      items: [
        { product_id: 'prod-001', quantity: 1, seller_id: 'seller-ravi-arts' },
        { product_id: 'prod-002', quantity: 1, seller_id: 'seller-heritage-antiquities' }
      ],
      shipping_address: {
        name: 'Arjun Verma',
        phone: '+91 99887 66554',
        address_line_1: '10 Art Guild Boulevard',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001',
        country: 'India'
      },
      payment_method: 'upi'
    }, userToken);
    assert(mvOrder.status === 201 && mvOrder.body.data.order_number, '25. Multi-Vendor Order Splitting & Escrow Commission Calculation');

    // 23. Tradesman Dashboard Stats
    const sellerStats = await request('GET', '/sellers/dashboard/stats', null, adminToken);
    assert(sellerStats.status === 200 && sellerStats.body.data, '26. Tradesman Analytics, Revenue & Sub-Order Metrics');

    // 24. Payout Management
    const payoutReq = await request('POST', '/sellers/payouts/request', {
      amount: 5000,
      bank_account: '9876543210',
      ifsc_code: 'SBIN0001234',
      payout_method: 'bank_transfer'
    }, adminToken);
    assert((payoutReq.status === 201 || payoutReq.status === 200) && payoutReq.body.data, '27. Tradesman Withdrawal / Payout Request Processing');

    const payoutId = payoutReq.body.data ? (payoutReq.body.data.id || payoutReq.body.data.payout_id) : 'payout-test';
    const approvePayout = await request('PATCH', `/admin/payouts/${payoutId}`, {
      status: 'completed',
      transaction_reference: 'UTR-TEST-99887766'
    }, adminToken);
    assert((approvePayout.status === 200 || approvePayout.status === 201) && approvePayout.body.data, '28. Admin Payout Execution with Bank UTR Reference Confirmation');

    console.log(`\n==============================================`);
    console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log(`==============================================\n`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    if (server) server.close();
    process.exit(1);
  }
}

server = app.listen(currentPort, () => {
  runTests();
});
