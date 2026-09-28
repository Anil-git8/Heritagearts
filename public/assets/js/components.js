/**
 * CRESCENDO / HERITAGE MARKETPLACE - Reusable Components & Layout Renderers
 */

const formatPrice = (num) => {
  const amount = Number(num) || 0;
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const renderRatingStars = (rating = 5.0, count = 124) => {
  const rounded = Math.round(Number(rating) || 5);
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<i class="bi bi-star${i <= rounded ? '-fill' : ''} text-warning"></i>`;
  }
  return `
    <div class="cres-product-rating d-inline-flex align-items-center">
      ${starsHtml}
      <span class="text-muted ms-1 small fw-semibold">(${count || 0})</span>
    </div>
  `;
};

const showToast = (message, type = 'success') => {
  let container = document.getElementById('cres-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cres-toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '2000';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-bg-dark border-0 show shadow-lg mb-2 rounded-4';
  toastEl.role = 'alert';
  toastEl.ariaLive = 'assertive';
  toastEl.ariaAtomic = 'true';
  toastEl.style.background = 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)';
  toastEl.style.color = '#FFFFFF';
  toastEl.innerHTML = `
    <div class="d-flex p-2 align-items-center">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill text-info fs-5"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
    </div>
  `;
  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.remove();
  }, 3500);
};

// Global Side Dock Toggle Function
window.toggleSideDock = (e, forceState) => {
  if (e) {
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }
  const dock = document.getElementById('cres-side-dock');
  const backdrop = document.getElementById('cres-dock-backdrop');
  if (!dock) return;

  const isExpanded = dock.classList.contains('expanded');
  const shouldExpand = typeof forceState === 'boolean' ? forceState : !isExpanded;

  if (shouldExpand) {
    dock.classList.add('expanded');
    if (backdrop) backdrop.classList.add('active');
  } else {
    dock.classList.remove('expanded');
    if (backdrop) backdrop.classList.remove('active');
  }
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const dock = document.getElementById('cres-side-dock');
    const backdrop = document.getElementById('cres-dock-backdrop');
    if (dock && dock.classList.contains('expanded')) {
      dock.classList.remove('expanded');
      if (backdrop) backdrop.classList.remove('active');
    }
  }
});

// Global Header Component
const renderHeader = (activePage = '') => {
  const container = document.getElementById('cres-header-placeholder') || document.getElementById('hn-header-placeholder');
  if (!container) return;

  const currentPath = window.location.pathname;
  let active = activePage;
  if (!active) {
    if (currentPath.includes('products') || currentPath.includes('product-details')) active = 'products';
    else if (currentPath.includes('sellers') || currentPath.includes('seller.')) active = 'sellers';
    else if (currentPath.includes('become-tradesman')) active = 'become-tradesman';
    else if (currentPath.includes('about')) active = 'about';
    else if (currentPath.includes('contact')) active = 'contact';
    else if (currentPath === '/' || currentPath.includes('index')) active = 'home';
  }

  const cart = JSON.parse(localStorage.getItem('cres_cart') || '[]');
  const wishlist = JSON.parse(localStorage.getItem('cres_wishlist') || '[]');
  const cartCount = cart.reduce((acc, i) => acc + (i.qty || 1), 0);
  const wishCount = Array.isArray(wishlist) ? wishlist.length : 0;

  const userProfile = JSON.parse(localStorage.getItem('hn_user_profile') || 'null');
  const isTradesman = userProfile && (userProfile.role === 'tradesman' || userProfile.role === 'admin');
  const isAdmin = userProfile && userProfile.role === 'admin';

  container.innerHTML = `
    <!-- Left Organic Curved Sidebar Dock (5 Core Navigation Links) -->
    <aside class="cres-side-dock" id="cres-side-dock" aria-label="Main Navigation Dock">
      <!-- 1. Explore (Launcher Card / Toggle Expand) -->
      <button type="button" class="cres-dock-launcher ${active === 'home' ? 'active' : ''}" id="cres-dock-toggle-btn" data-tooltip="Explore / Expand Menu" title="Explore / Expand Menu" onclick="toggleSideDock(event)">
        <i class="bi bi-grid-fill"></i>
        <span class="cres-dock-label">Explore</span>
      </button>

      <!-- 2. Art & Antiques -->
      <a href="/products.html" class="cres-dock-item ${active === 'products' ? 'active' : ''}" data-tooltip="Art &amp; Antiques" title="Art &amp; Antiques">
        <i class="bi bi-palette"></i>
        <span class="cres-dock-label">Art &amp; Antiques</span>
      </a>

      <!-- 3. Tradesmen (Verified Badge) -->
      <a href="/sellers.html" class="cres-dock-item ${active === 'sellers' ? 'active' : ''}" data-tooltip="Tradesmen" title="Tradesmen">
        <i class="bi bi-patch-check"></i>
        <span class="cres-dock-label">Tradesmen</span>
      </a>

      <!-- 4. Our Story -->
      <a href="/about.html" class="cres-dock-item ${active === 'about' ? 'active' : ''}" data-tooltip="Our Story" title="Our Story">
        <i class="bi bi-book"></i>
        <span class="cres-dock-label">Our Story</span>
      </a>

      <!-- 5. Contact -->
      <a href="/contact.html" class="cres-dock-item ${active === 'contact' ? 'active' : ''}" data-tooltip="Contact" title="Contact">
        <i class="bi bi-envelope"></i>
        <span class="cres-dock-label">Contact</span>
      </a>
    </aside>

    <!-- Click-outside Backdrop for Expanded Dock -->
    <div id="cres-dock-backdrop" class="cres-dock-backdrop" onclick="toggleSideDock(event, false)"></div>

    <!-- Top Header Bar -->
    <header class="cres-header">
      <div class="container-fluid px-3 px-lg-4">
        <div class="d-flex align-items-center justify-content-between gap-3">
          
          <!-- Left: Brand Logo -->
          <a href="/index.html" class="cres-brand text-decoration-none d-flex align-items-center gap-2">
            <span class="cres-brand-dot"></span>
            <div class="d-flex flex-column">
              <span class="fw-extrabold tracking-wide" style="font-family: var(--cres-font-heading); font-size: 1.25rem; letter-spacing: -0.5px; color: var(--cres-secondary);">HERITAGE</span>
              <span class="badge px-1 py-0 text-uppercase" style="font-size: 0.6rem; letter-spacing: 1.5px; background: var(--cres-primary-light); color: var(--cres-primary); font-weight: 700;">Marketplace</span>
            </div>
          </a>

          <!-- Center: Search Input Bar (Leaving Top Space Open & Clean) -->
          <div class="d-none d-md-flex align-items-center flex-grow-1 mx-lg-4" style="max-width: 480px;">
            <div class="input-group">
              <span class="input-group-text bg-light border-0 ps-3 text-muted rounded-start-pill" style="background: #F4F1FD !important;"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control border-0 py-2 rounded-end-pill small" placeholder="Search creations, master artists, or antique eras..." style="background: #F4F1FD !important;" onkeydown="if(event.key==='Enter') window.location.href='/products.html?search='+encodeURIComponent(this.value)">
            </div>
          </div>

          <!-- Right: Action Buttons -->
          <div class="d-flex align-items-center gap-2">
            
            ${!isTradesman ? `
              <a href="/become-tradesman.html" class="btn btn-sm d-none d-sm-inline-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-bold text-decoration-none" style="background: var(--cres-primary-light); color: var(--cres-primary); border: 1px solid rgba(91, 66, 243, 0.2); font-size: 0.82rem;">
                <i class="bi bi-gem"></i> Become a Tradesman
              </a>
            ` : `
              <a href="/seller-dashboard.html" class="btn btn-sm btn-primary d-none d-sm-inline-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-bold shadow-sm text-decoration-none" style="font-size: 0.82rem;">
                <i class="bi bi-speedometer2"></i> Tradesman Studio
              </a>
            `}

            <a href="/chat.html" class="cres-icon-btn d-none d-sm-inline-flex" title="Marketplace Inquiries">
              <i class="bi bi-chat-dots"></i>
            </a>

            <a href="/wishlist.html" class="cres-icon-btn d-none d-sm-inline-flex" title="Wishlist">
              <i class="bi bi-heart"></i>
              <span class="cres-badge-pill" id="cres-wishlist-badge">${wishCount}</span>
            </a>

            <a href="/cart.html" class="cres-icon-btn" title="Shopping Cart">
              <i class="bi bi-bag"></i>
              <span class="cres-badge-pill" id="cres-cart-badge">${cartCount}</span>
            </a>

            <!-- User Dropdown Menu -->
            <div class="dropdown">
              <a href="#" class="cres-icon-btn dropdown-toggle no-caret" data-bs-toggle="dropdown" aria-expanded="false" title="Account Menu">
                <i class="bi bi-person"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 p-2 rounded-4" style="min-width: 220px;">
                <li class="dropdown-header text-uppercase small fw-bold text-muted px-3 pt-2">Collector Account</li>
                <li><a class="dropdown-item py-2 rounded-3" href="/orders.html"><i class="bi bi-box-seam me-2 text-primary"></i>My Orders</a></li>
                <li><a class="dropdown-item py-2 rounded-3" href="/chat.html"><i class="bi bi-chat-dots me-2 text-primary"></i>Inquiries &amp; Messages</a></li>
                <li><a class="dropdown-item py-2 rounded-3" href="/wishlist.html"><i class="bi bi-heart me-2 text-danger"></i>Saved Collections</a></li>
                <li><hr class="dropdown-divider"></li>
                <li class="dropdown-header text-uppercase small fw-bold text-muted px-3">Tradesman Portal</li>
                <li><a class="dropdown-item py-2 rounded-3 fw-semibold text-primary" href="/become-tradesman.html"><i class="bi bi-gem me-2"></i>Apply as Tradesman</a></li>
                <li><a class="dropdown-item py-2 rounded-3 fw-semibold text-primary" href="/seller-dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Tradesman Dashboard</a></li>
                ${isAdmin ? `
                  <li><hr class="dropdown-divider"></li>
                  <li class="dropdown-header text-uppercase small fw-bold text-muted px-3">Admin Portal</li>
                  <li><a class="dropdown-item py-2 rounded-3 fw-bold text-dark" href="/admin.html"><i class="bi bi-shield-lock me-2 text-primary"></i>Admin Center</a></li>
                  <li><a class="dropdown-item py-2 rounded-3 fw-bold text-dark" href="/admin-sellers.html"><i class="bi bi-person-badge me-2 text-primary"></i>Review Applications</a></li>
                  <li><a class="dropdown-item py-2 rounded-3 fw-bold text-dark" href="/admin-payouts.html"><i class="bi bi-wallet2 me-2 text-primary"></i>Manage Payouts</a></li>
                ` : ''}
              </ul>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="cres-icon-btn d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#cresMobileNav" aria-label="Toggle navigation">
              <i class="bi bi-list"></i>
            </button>
          </div>

        </div>

        <!-- Mobile Navigation Dropdown -->
        <div class="collapse d-lg-none mt-3 pt-3 border-top" id="cresMobileNav">
          <div class="d-flex flex-column gap-2 p-2 bg-light rounded-4">
            <a href="/index.html" class="cres-nav-link ${active === 'home' ? 'active' : ''}"><i class="bi bi-house me-2"></i>Marketplace Home</a>
            <a href="/products.html" class="cres-nav-link ${active === 'products' ? 'active' : ''}"><i class="bi bi-palette me-2"></i>Artworks &amp; Antiques</a>
            <a href="/sellers.html" class="cres-nav-link ${active === 'sellers' ? 'active' : ''}"><i class="bi bi-patch-check text-primary me-2"></i>Verified Tradesmen</a>
            <a href="/chat.html" class="cres-nav-link"><i class="bi bi-chat-text me-2"></i>Messages &amp; Inquiries</a>
            <a href="/become-tradesman.html" class="cres-nav-link text-primary fw-bold"><i class="bi bi-gem me-2"></i>Become a Tradesman</a>
            <a href="/seller-dashboard.html" class="cres-nav-link text-primary fw-bold"><i class="bi bi-shop me-2"></i>Tradesman Dashboard</a>
            <a href="/wishlist.html" class="cres-nav-link"><i class="bi bi-heart me-2"></i>Saved Items (${wishCount})</a>
            <a href="/cart.html" class="cres-nav-link"><i class="bi bi-bag me-2"></i>Shopping Cart (${cartCount})</a>
            <a href="/account.html" class="cres-nav-link"><i class="bi bi-person me-2"></i>My Account &amp; Orders</a>
            ${isAdmin ? `<a href="/admin.html" class="cres-nav-link text-danger fw-bold"><i class="bi bi-shield-lock me-2"></i>Admin Control Center</a>` : ''}
          </div>
        </div>
      </div>
    </header>
  `;

  // Attach direct click handler to the 4-box dock launcher
  const toggleBtn = container.querySelector('#cres-dock-toggle-btn');
  if (toggleBtn) {
    toggleBtn.onclick = (e) => {
      window.toggleSideDock(e);
    };
  }
};

// Global Footer Component
const renderFooter = () => {
  const container = document.getElementById('cres-footer-placeholder') || document.getElementById('hn-footer-placeholder');
  if (!container) return;

  container.innerHTML = `
    <footer class="cres-footer">
      <div class="container">
        <div class="row g-4">
          <!-- Col 1 -->
          <div class="col-lg-4">
            <a href="/index.html" class="cres-brand mb-3 d-inline-block text-decoration-none">
              <span class="cres-brand-dot"></span>
              <span class="fw-bold" style="font-family: var(--cres-font-heading); color: var(--cres-secondary);">HERITAGE MARKETPLACE</span>
            </a>
            <p class="text-muted small mb-4 pe-lg-4">
              A premier multi-vendor marketplace connecting passionate art collectors, spiritual seekers, and connoisseurs directly with master artisans, verified antiquarians, and traditional craftsmen.
            </p>
            <div class="d-flex gap-2">
              <a href="#" class="cres-icon-btn"><i class="bi bi-instagram"></i></a>
              <a href="#" class="cres-icon-btn"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="cres-icon-btn"><i class="bi bi-youtube"></i></a>
              <a href="#" class="cres-icon-btn"><i class="bi bi-facebook"></i></a>
            </div>
          </div>

          <!-- Col 2 -->
          <div class="col-6 col-lg-2">
            <h6>Marketplace</h6>
            <a href="/products.html?category=cat-004">Paintings &amp; Gold Art</a>
            <a href="/products.html?category=cat-004">Temple Bronzes &amp; Antiques</a>
            <a href="/products.html?category=cat-003">Handloom Ahimsa Silks</a>
            <a href="/products.html?category=cat-001">Rare Scriptures &amp; Books</a>
            <a href="/sellers.html">Verified Tradesmen</a>
          </div>

          <!-- Col 3 -->
          <div class="col-6 col-lg-2">
            <h6>Tradesmen</h6>
            <a href="/become-tradesman.html" class="text-primary fw-semibold">Become a Tradesman</a>
            <a href="/seller-dashboard.html">Seller Dashboard</a>
            <a href="/seller-dashboard.html#orders">Order Fulfillment</a>
            <a href="/seller-dashboard.html#payouts">Payouts &amp; Balance</a>
            <a href="/terms.html">Seller Policy &amp; Curation</a>
          </div>

          <!-- Col 4 -->
          <div class="col-lg-4">
            <h6>Marketplace Newsletter</h6>
            <p class="text-muted small mb-3">Subscribe for notifications about rare antique drops, master art exhibitions, and verified tradesman spotlights.</p>
            <form onsubmit="handleCrescendoNewsletter(event)" class="d-flex gap-2">
              <input type="email" required class="form-control rounded-pill px-3" placeholder="Enter your email address">
              <button type="submit" class="btn cres-btn-primary px-4">Subscribe</button>
            </form>
          </div>
        </div>

        <hr class="my-4 text-muted opacity-25">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted">
          <div>© ${new Date().getFullYear()} HERITAGE MULTI-VENDOR MARKETPLACE. All rights reserved.</div>
          <div class="d-flex gap-3">
            <a href="/terms.html" class="text-muted">Provenance Standards</a>
            <a href="/terms.html" class="text-muted">Privacy Policy</a>
            <a href="/terms.html" class="text-muted">Terms of Service</a>
            <a href="/faq.html" class="text-muted">Support</a>
          </div>
        </div>
      </div>
    </footer>
  `;
};

// Render Product Card Component (Matching Reference Theme with Seller Badges)
const renderProductCard = (p) => {
  const badgeClass = p.badge_type === 'pink' ? 'cres-badge-pink' : (p.badge_type === 'blue' ? 'cres-badge-blue' : 'cres-badge-purple');
  const wishlist = JSON.parse(localStorage.getItem('cres_wishlist') || '[]');
  const isWish = Array.isArray(wishlist) && (wishlist.includes(p.id) || wishlist.some(item => (typeof item === 'object' ? item.id === p.id : item === p.id)));

  const sellerName = p.seller_name || 'Platform Store';
  const sellerSlug = p.seller_slug || p.seller_id || 'seller-platform';
  const isVerified = p.seller_verified !== false;
  const hasCert = p.has_certificate || p.authenticity_type;
  const isHandmade = p.is_handmade;

  return `
    <div class="cres-product-card d-flex flex-column justify-content-between h-100" data-product-id="${p.id}">
      <div>
        ${p.has_certificate ? `<span class="cres-product-badge cres-badge-pink"><i class="bi bi-patch-check-fill me-1"></i>Certified</span>` : (p.is_handmade ? `<span class="cres-product-badge cres-badge-blue">Handmade</span>` : '')}
        
        <button class="cres-card-wishlist ${isWish ? 'active' : ''}" onclick="toggleWishlist('${p.id}', this)" title="Add to Wishlist">
          <i class="bi ${isWish ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
        </button>

        <a href="/product-details.html?id=${p.id}" class="cres-product-img-box">
          <img src="${p.primary_image || p.image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80'}" alt="${p.name}" loading="lazy">
        </a>

        <!-- Seller Identification Card -->
        <div class="d-flex align-items-center justify-content-between px-1 mb-2">
          <a href="/seller.html?id=${sellerSlug}" class="text-decoration-none small text-muted d-inline-flex align-items-center gap-1 text-truncate" style="max-width: 75%;">
            <i class="bi bi-shop text-primary" style="font-size: 0.75rem;"></i>
            <span class="fw-semibold text-truncate">${sellerName}</span>
            ${isVerified ? `<i class="bi bi-patch-check-fill text-primary" style="font-size: 0.75rem;" title="Verified Tradesman"></i>` : ''}
          </a>
          <span class="badge rounded-pill bg-light text-dark border" style="font-size: 0.65rem;">${p.origin_region ? p.origin_region.split(',')[0] : 'Authentic'}</span>
        </div>

        <h6 class="cres-product-title mb-1">
          <a href="/product-details.html?id=${p.id}" class="text-decoration-none text-dark">${p.name}</a>
        </h6>

        ${renderRatingStars(p.rating, p.reviews_count)}
      </div>

      <div class="cres-product-price-row mt-3 pt-2 border-top">
        <div class="cres-product-price">${formatPrice(p.price)}</div>
        <div class="d-flex gap-1">
          <a href="/chat.html?seller_id=${p.seller_id || 'seller-platform'}&product_id=${p.id}" class="btn btn-sm btn-outline-secondary rounded-circle d-inline-flex align-items-center justify-content-center p-0" style="width: 34px; height: 34px;" title="Chat with Tradesman">
            <i class="bi bi-chat-text" style="font-size: 0.85rem;"></i>
          </a>
          <button class="cres-card-cart-btn" onclick="addToCart('${p.id}')" title="Add to Cart">
            <i class="bi bi-bag"></i>
          </button>
        </div>
      </div>
    </div>
  `;
};

// Cart & Wishlist local state helpers
window.findProductByIdOrSlug = (identifier) => {
  if (!identifier) return null;
  const idStr = String(identifier);

  // Check base catalog
  if (typeof CRESCENDO_DATA !== 'undefined' && Array.isArray(CRESCENDO_DATA.products)) {
    const found = CRESCENDO_DATA.products.find(p => p.id === idStr || p.slug === idStr || String(p.id) === idStr);
    if (found) return found;
  }

  // Check dynamically created admin products
  try {
    const adminProds = JSON.parse(localStorage.getItem('cres_admin_products') || '[]');
    const adminFound = adminProds.find(p => p.id === idStr || p.slug === idStr || String(p.id) === idStr);
    if (adminFound) return adminFound;
  } catch (e) {}

  return null;
};

window.addToCart = (productId, qty = 1, color = 'Standard') => {
  const p = window.findProductByIdOrSlug(productId) || (typeof activeProduct !== 'undefined' && activeProduct ? activeProduct : null);
  if (!p) {
    console.warn('Product not found:', productId);
    return;
  }

  const quantity = Math.max(1, parseInt(qty, 10) || 1);
  let cart = JSON.parse(localStorage.getItem('cres_cart') || '[]');
  const pId = p.id || productId;
  const existing = cart.find(i => (i.id === pId || i.id === p.slug) && (i.color === color || (!i.color && !color)));
  
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      id: pId,
      name: p.name || 'Sample Product',
      slug: p.slug || pId,
      price: Number(p.price) || 99.00,
      image: p.image || (p.gallery && p.gallery[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
      color: color || 'Standard',
      qty: quantity
    });
  }

  localStorage.setItem('cres_cart', JSON.stringify(cart));
  if (window.cresUpdateCounters) window.cresUpdateCounters();

  showToast(`Added "${p.name || 'Item'}" to cart! 🛍️`, 'success');
};

window.buyNow = (productId, qty = 1, color = 'Standard') => {
  window.addToCart(productId, qty, color);
  setTimeout(() => {
    window.location.href = '/checkout.html';
  }, 200);
};

window.toggleWishlist = (productId, btnEl) => {
  const p = window.findProductByIdOrSlug(productId) || (typeof activeProduct !== 'undefined' && activeProduct ? activeProduct : null);
  const pId = p ? p.id : productId;
  if (!pId) return;

  let wishlist = JSON.parse(localStorage.getItem('cres_wishlist') || '[]');
  const index = wishlist.findIndex(item => (typeof item === 'object' ? item.id === pId : item === pId));
  let isAdded = false;

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`Removed "${p ? p.name : 'Item'}" from wishlist.`, 'info');
  } else {
    wishlist.push(pId);
    isAdded = true;
    showToast(`Added "${p ? p.name : 'Item'}" to wishlist! 💖`, 'success');
  }

  localStorage.setItem('cres_wishlist', JSON.stringify(wishlist));
  if (window.cresUpdateCounters) window.cresUpdateCounters();

  if (btnEl) {
    btnEl.classList.toggle('active', isAdded);
    const icon = btnEl.querySelector('i');
    if (icon) icon.className = isAdded ? 'bi bi-heart-fill text-danger' : 'bi bi-heart';
  }
};

window.cresAddToCart = window.addToCart;
window.cresToggleWishlist = window.toggleWishlist;
window.cresShowToast = showToast;
window.cresUpdateCounters = () => {
  const cart = JSON.parse(localStorage.getItem('cres_cart') || '[]');
  const wishlist = JSON.parse(localStorage.getItem('cres_wishlist') || '[]');
  const cartBadge = document.getElementById('cres-cart-badge');
  const wishBadge = document.getElementById('cres-wishlist-badge');
  if (cartBadge) cartBadge.textContent = cart.reduce((acc, i) => acc + (i.qty || 1), 0);
  if (wishBadge) wishBadge.textContent = wishlist.length;
};

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
});
