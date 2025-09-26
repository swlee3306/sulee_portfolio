// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuButton = document.querySelector('[aria-label="메뉴 열기"]');
  const navigation = document.querySelector('nav');
  
  if (mobileMenuButton && navigation) {
    // Create mobile menu overlay
    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    mobileMenuOverlay.innerHTML = `
      <div class="mobile-menu-content">
        <div class="mobile-menu-header">
          <span class="mobile-menu-title">메뉴</span>
          <button class="mobile-menu-close" aria-label="메뉴 닫기">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <nav class="mobile-menu-nav">
          <ul class="mobile-menu-list">
            ${Array.from(navigation.querySelectorAll('li')).map(li => li.outerHTML).join('')}
          </ul>
        </nav>
      </div>
    `;
    
    // Add overlay to body
    document.body.appendChild(mobileMenuOverlay);
    
    const closeButton = mobileMenuOverlay.querySelector('.mobile-menu-close');
    
    // Toggle mobile menu
    function toggleMobileMenu() {
      const isOpen = mobileMenuOverlay.classList.contains('active');
      
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }
    
    function openMobileMenu() {
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      mobileMenuButton.setAttribute('aria-expanded', 'true');
      mobileMenuButton.setAttribute('aria-label', '메뉴 닫기');
      
      // Update hamburger icon to X
      const svg = mobileMenuButton.querySelector('svg path');
      if (svg) {
        svg.setAttribute('d', 'M6 18L18 6M6 6l12 12');
      }
    }
    
    function closeMobileMenu() {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-label', '메뉴 열기');
      
      // Update X icon back to hamburger
      const svg = mobileMenuButton.querySelector('svg path');
      if (svg) {
        svg.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
      }
    }
    
    // Event listeners
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    closeButton.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking overlay
    mobileMenuOverlay.addEventListener('click', function(e) {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
        closeMobileMenu();
      }
    });
    
    // Close menu when clicking on mobile menu links
    mobileMenuOverlay.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') {
        closeMobileMenu();
      }
    });
  }
});
