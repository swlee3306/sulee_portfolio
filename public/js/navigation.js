// Universal Navigation and Dark Mode
document.addEventListener('DOMContentLoaded', function() {
  // Navigation elements
  const menuToggle = document.getElementById('menu-toggle');
  const mainNavigation = document.getElementById('main-navigation');
  const hamburgerIcon = document.querySelector('.hamburger-icon');
  const closeIcon = document.querySelector('.close-icon');
  
  // Dark mode elements
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  const html = document.documentElement;
  
  // Initialize dark mode from localStorage or system preference
  function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
  }
  
  // Enable dark mode
  function enableDarkMode() {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
  
  // Enable light mode
  function enableLightMode() {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
  
  // Toggle dark mode
  function toggleDarkMode() {
    if (html.classList.contains('dark')) {
      enableLightMode();
    } else {
      enableDarkMode();
    }
  }
  
  // Navigation functions
  function openMenu() {
    mainNavigation.classList.remove('hidden');
    hamburgerIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    mainNavigation.classList.add('hidden');
    hamburgerIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
    document.body.style.overflow = '';
  }
  
  function toggleMenu() {
    if (mainNavigation.classList.contains('hidden')) {
      openMenu();
    } else {
      closeMenu();
    }
  }
  
  // Dynamic sizing based on device
  function adjustMenuForDevice() {
    const navContent = document.querySelector('.nav-content');
    if (!navContent) return;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Adjust for different mobile devices
    if (screenWidth <= 480) {
      // Small phones
      navContent.style.fontSize = '0.9rem';
      navContent.style.padding = '16px';
    } else if (screenWidth <= 768) {
      // Large phones / small tablets
      navContent.style.fontSize = '1rem';
      navContent.style.padding = '20px';
    } else {
      // Desktop
      navContent.style.fontSize = '1.1rem';
      navContent.style.padding = '24px';
    }
    
    // Adjust for landscape orientation on mobile
    if (screenWidth > screenHeight && screenWidth <= 768) {
      navContent.style.maxHeight = '60vh';
    } else {
      navContent.style.maxHeight = '80vh';
    }
  }
  
  // Event listeners
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }
  
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Close menu when clicking on navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!mainNavigation.contains(e.target) && 
        !menuToggle.contains(e.target) && 
        !mainNavigation.classList.contains('hidden')) {
      closeMenu();
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !mainNavigation.classList.contains('hidden')) {
      closeMenu();
    }
  });
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        enableDarkMode();
      } else {
        enableLightMode();
      }
    }
  });
  
  // Handle window resize for dynamic sizing
  window.addEventListener('resize', adjustMenuForDevice);
  
  // Initialize everything
  initDarkMode();
  adjustMenuForDevice();
  
  // Adjust menu on orientation change
  window.addEventListener('orientationchange', function() {
    setTimeout(adjustMenuForDevice, 100);
  });
});
