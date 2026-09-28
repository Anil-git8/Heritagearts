const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const marketplaceAdminController = require('../controllers/marketplaceAdminController');
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

// Standard Store Admin Stats & Customers
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/customers', adminController.getCustomers);
router.put('/customers/:id/status', adminController.updateCustomerStatus);
router.patch('/customers/:id/status', adminController.updateCustomerStatus);

// Marketplace Tradesmen & Applications
router.get('/sellers/applications', marketplaceAdminController.getSellerApplications);
router.get('/seller-applications', marketplaceAdminController.getSellerApplications);
router.put('/sellers/applications/:id', marketplaceAdminController.reviewSellerApplication);
router.patch('/sellers/applications/:id', marketplaceAdminController.reviewSellerApplication);
router.put('/seller-applications/:id', marketplaceAdminController.reviewSellerApplication);
router.patch('/seller-applications/:id', marketplaceAdminController.reviewSellerApplication);

router.get('/sellers', marketplaceAdminController.getAdminSellers);
router.put('/sellers/:id/status', marketplaceAdminController.updateSellerStatus);
router.patch('/sellers/:id/status', marketplaceAdminController.updateSellerStatus);

// Marketplace Product Moderation Queue & Admin Catalog
router.get('/products', productController.getProducts);
router.get('/pending-products', marketplaceAdminController.getPendingProducts);
router.put('/products/:id/moderate', marketplaceAdminController.moderateProduct);
router.patch('/products/:id/moderate', marketplaceAdminController.moderateProduct);

// Marketplace Payout Processing
router.get('/payouts', marketplaceAdminController.getAdminPayouts);
router.put('/payouts/:id/process', marketplaceAdminController.processPayout);
router.patch('/payouts/:id/process', marketplaceAdminController.processPayout);
router.put('/payouts/:id', marketplaceAdminController.processPayout);
router.patch('/payouts/:id', marketplaceAdminController.processPayout);

// Marketplace Platform Settings & Commission
router.get('/settings', marketplaceAdminController.getPlatformSettings);
router.put('/settings', marketplaceAdminController.updatePlatformSettings);
router.patch('/settings', marketplaceAdminController.updatePlatformSettings);

// Disputes & Moderation
router.get('/disputes', marketplaceAdminController.getDisputes);
router.put('/disputes/:id/resolve', marketplaceAdminController.resolveDispute);
router.patch('/disputes/:id/resolve', marketplaceAdminController.resolveDispute);

module.exports = router;
