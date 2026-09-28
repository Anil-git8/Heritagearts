const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticate, optionalAuth, requireTradesman } = require('../middleware/auth');

// Public Marketplace Seller Endpoints
router.get('/', sellerController.getSellers);
router.get('/directory', sellerController.getSellers);

// Authenticated Customer Endpoints
router.post('/apply', authenticate, sellerController.applyForTradesman);
router.get('/my-status', authenticate, sellerController.getMySellerProfile);
router.post('/follow', authenticate, sellerController.toggleFollowSeller);
router.post('/reviews', authenticate, sellerController.createSellerReview);

// Protected Tradesman Dashboard Endpoints
router.put('/profile', authenticate, requireTradesman, sellerController.updateSellerProfile);
router.get('/dashboard-stats', authenticate, requireTradesman, sellerController.getSellerDashboardStats);
router.get('/dashboard/stats', authenticate, requireTradesman, sellerController.getSellerDashboardStats);
router.get('/products', authenticate, requireTradesman, sellerController.getSellerProducts);
router.post('/products', authenticate, requireTradesman, sellerController.createSellerProduct);
router.put('/products/:id', authenticate, requireTradesman, sellerController.updateSellerProduct);
router.delete('/products/:id', authenticate, requireTradesman, sellerController.deleteSellerProduct);
router.get('/orders', authenticate, requireTradesman, sellerController.getSellerOrders);
router.put('/orders/:id/status', authenticate, requireTradesman, sellerController.updateSellerOrderStatus);
router.get('/payouts', authenticate, requireTradesman, sellerController.getSellerPayouts);
router.post('/payouts/request', authenticate, requireTradesman, sellerController.requestPayout);

// Public Storefront (Placed last so it does not intercept specific subpaths)
router.get('/profile/:identifier', optionalAuth, sellerController.getPublicSellerProfile);
router.get('/:identifier', optionalAuth, sellerController.getPublicSellerProfile);

module.exports = router;
