document.addEventListener('DOMContentLoaded', () => {
  // 1. Authentication Status
  const token = localStorage.getItem('token');
  const loginLinks = document.querySelectorAll('.nav a[href="login.html"]');
  const signupLinks = document.querySelectorAll('.nav a[href="role-selection.html"]');
  
  if (token) {
    loginLinks.forEach(link => {
      link.textContent = 'Dashboard';
      // Attempt to route properly based on stored user
      const mockUser = JSON.parse(localStorage.getItem('mockUser') || '{"role": "customer"}');
      link.href = mockUser.role === 'staff' ? 'expert-dashboard.html' : 'customer-dashboard.html';
      link.classList.add('active');
    });

    signupLinks.forEach(link => {
      link.textContent = 'Logout';
      link.href = '#';
      link.classList.add('logout-link');
    });
  }

  // 1.5. Route Guards (Authentication Gates)
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const authPages = ['login.html', 'signup.html', 'role-selection.html'];
  const protectedPages = ['customer-dashboard.html', 'expert-dashboard.html'];

  if (token) {
    if (authPages.includes(page)) {
      const user = JSON.parse(localStorage.getItem('mockUser') || '{}');
      window.location.replace(user.role === 'staff' ? 'expert-dashboard.html' : 'customer-dashboard.html');
    }
    if (page === 'expert-dashboard.html') {
      const user = JSON.parse(localStorage.getItem('mockUser') || '{}');
      if (user.role !== 'staff') {
        window.location.replace('customer-dashboard.html');
      }
    }
  } else {
    if (protectedPages.includes(page)) {
      window.location.replace('login.html');
    }
  }

  // 2. Sign-out logic
  const logoutEls = document.querySelectorAll('.logout-link');
  logoutEls.forEach(el => el.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('mockUser');
    window.location.href = 'login.html';
  }));

  // 3. Mobile Hamburger Menu
  document.querySelectorAll('header').forEach(header => {
    const nav = header.querySelector('.nav');
    if (!nav) return;
    if (!header.querySelector('.menu-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'menu-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
      header.querySelector('.container').insertBefore(btn, nav);
      btn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        btn.classList.toggle('active', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Close menu on link click
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  });

  // 4. Mobile Dashboard Toggler (Upgraded for new dash classes)
  const dashboardSidebar = document.querySelector('.sidebar, .dash-sidebar, .side-panel');
  if (dashboardSidebar) {
    const dashToggle = document.createElement('button');
    dashToggle.className = 'dashboard-toggle';
    dashToggle.innerHTML = '<i class="fas fa-bars"></i> Manage';
    dashToggle.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1001;
      background: #000;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 50px;
      display: none;
      font-weight: 800;
      font-size: 0.9rem;
      text-transform: uppercase;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      align-items: center;
      gap: 10px;
    `;

    document.body.appendChild(dashToggle);

    const checkViewport = () => {
      if (window.innerWidth <= 1024) {
        dashToggle.style.display = 'flex';
      } else {
        dashToggle.style.display = 'none';
        dashboardSidebar.classList.remove('mobile-open');
        dashboardSidebar.style.transform = '';
      }
    };

    window.addEventListener('resize', checkViewport);
    checkViewport();

    dashToggle.addEventListener('click', () => {
      const isOpen = dashboardSidebar.classList.toggle('mobile-open');
      if (isOpen) {
        dashboardSidebar.style.position = 'fixed';
        dashboardSidebar.style.top = 'var(--header-height)';
        dashboardSidebar.style.left = '0';
        dashboardSidebar.style.width = '100%';
        dashboardSidebar.style.height = 'calc(100vh - var(--header-height))';
        dashboardSidebar.style.zIndex = '999';
        dashboardSidebar.style.transform = 'translateY(0)';
        dashboardSidebar.style.display = 'block';
        dashToggle.innerHTML = '<i class="fas fa-times"></i> Close';
      } else {
        dashboardSidebar.style.transform = 'translateY(100%)';
        setTimeout(() => {
          if (!dashboardSidebar.classList.contains('mobile-open')) {
             dashboardSidebar.style.display = 'none';
          }
        }, 300);
        dashToggle.innerHTML = '<i class="fas fa-bars"></i> Manage';
      }
    });

    // Initial state for mobile sidebar
    if (window.innerWidth <= 1024) {
      dashboardSidebar.style.display = 'none';
      dashboardSidebar.style.transition = 'transform 0.3s ease';
      dashboardSidebar.style.transform = 'translateY(100%)';
    }
  }

  // 5. Utility: Card Collapse
  document.querySelectorAll('.card').forEach(card => {
    const h3 = card.querySelector('h3');
    if (!h3) return;
    h3.style.cursor = 'pointer';
    h3.addEventListener('click', () => {
      card.classList.toggle('collapsed');
    });
  });

  // 6. Global Mock User access
  window.mockUser = JSON.parse(localStorage.getItem('mockUser') || '{"firstname": "stylists", "role": "staff"}');

  // 7. High-End Reveal Animations
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('section, .glass-card, .card, .service-item-card, .gallery-item, .stat-card').forEach(el => {
    el.classList.add('reveal-on-scroll');
    revealObserver.observe(el);
  });

  // 8. Smooth Page Entrance
  document.body.style.opacity = '1';

  // 10. Global Notification System (Signal Toast)
  window.showToast = (message, type = 'accent') => {
    const toast = document.createElement('div');
    toast.className = 'signal-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1A1A1A;
      color: #FDFBF7;
      padding: 1.25rem 2rem;
      border-radius: 4px;
      z-index: 9999;
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
      animation: toastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.95rem;
      font-weight: 300;
      letter-spacing: 0.5px;
    `;

    // Icon based on type
    let icon = '<i class="fas fa-info-circle" style="color: #d4af37"></i>';
    if (type === 'success') icon = '<i class="fas fa-check" style="color: #d4af37"></i>';
    if (type === 'error') icon = '<i class="fas fa-exclamation-triangle" style="color: #ef4444"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  };

  // Add Keyframes to document
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.innerHTML = `
      @keyframes toastIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes toastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(30px); } }
    `;
    document.head.appendChild(style);
  }

  // 9. Dashboard Profile Photo (Upload/Delete/Reset)
  const auraContainer = document.getElementById('dashboard-aura');
  if (auraContainer) {
    const trigger = document.getElementById('edit-aura-trigger');
    const menu = document.getElementById('aura-menu');
    const input = document.getElementById('aura-upload-input');
    const uploadBtn = document.getElementById('upload-aura-btn');
    const resetBtn = document.getElementById('reset-aura-btn');

    // Persistence: Load saved aura
    const auraKey = `dashboard_aura_${window.mockUser.role}`;
    const savedAura = localStorage.getItem(auraKey);
    if (savedAura) {
      auraContainer.style.backgroundImage = `url('${savedAura}')`;
    }

    // Toggle Menu
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    });

    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    // Handle Upload
    uploadBtn.addEventListener('click', () => input.click());

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target.result;
          auraContainer.style.backgroundImage = `url('${result}')`;
          localStorage.setItem(auraKey, result);
        };
        reader.readAsDataURL(file);
      }
    });

    // Handle Reset (Delete/Restore Default)
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(auraKey);
      // Revert to page default (embedded in CSS/HTML)
      auraContainer.style.backgroundImage = '';
      window.location.reload(); // Quick reset sync
    });
  }


});
// js/layout.js
// Centralized App Shell injection for Style Corner

const AppLayout = {
    headerHTML: `
        <header>
            <div class="container">
                <a href="index.html" class="logo">
                    <svg class="logo-icon" viewBox="0 0 100 100">
                        <path d="M30 20 H70 L80 50 L70 80 H30 L20 50 Z" fill="none" stroke="currentColor" stroke-width="4" />
                        <path d="M35 35 H65 L70 50 L65 65 H35 L30 50 Z" fill="currentColor" opacity="0.2" />
                        <circle cx="50" cy="50" r="5" fill="currentColor" />
                    </svg>
                    STYLE<span>CORNER</span>
                </a>
                <nav class="nav">
                    <a href="index.html" data-page="index.html">Home</a>
                    <a href="services.html" data-page="services.html">Services</a>
                    <a href="gallery.html" data-page="gallery.html">Gallery</a>
                    <a href="experts.html" data-page="experts.html">Our Team</a>
                    <a href="store.html" data-page="store.html">Store</a>
                    <a href="about.html" data-page="about.html">About</a>
                    <a href="login.html">Sign In</a>
                    <a href="role-selection.html" class="cta">Sign Up</a>
                </nav>
            </div>
        </header>
    `,

    footerHTML: `
        <footer style="background: #1A1A1A; color: #FDFBF7; padding-top: 5rem;">
            <div class="container footer-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; padding-bottom: 4rem;">
                <div>
                    <h3 style="color: #d4af37; font-size: 1.2rem; margin-bottom: 1.5rem;">Style Corner</h3>
                    <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.8;">The premier destination for professional grooming and expert styling.</p>
                </div>
                <div>
                    <h4 style="color: #FDFBF7; font-size: 1rem; margin-bottom: 1.5rem;">Quick Links</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.8rem;">
                        <li><a href="services.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.3s ease;">Services</a></li>
                        <li><a href="experts.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.3s ease;">Our Team</a></li>
                        <li><a href="store.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.3s ease;">Store</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="color: #FDFBF7; font-size: 1rem; margin-bottom: 1.5rem;">Contact</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.8rem; color: #94a3b8; font-size: 0.9rem;">
                        <li>123 Fashion Ave, NY 10001</li>
                        <li>info@stylecorner.com</li>
                        <li>+1 (555) 123-4567</li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding: 1.5rem 0; text-align: center; color: #64748b; font-size: 0.85rem;">
                <p>&copy; 2024 Style Corner. All rights reserved.</p>
            </div>
        </footer>
    `,

    init() {
        const existingHeader = document.querySelector('header');
        const existingFooter = document.querySelector('footer');

        if (existingHeader && !existingHeader.classList.contains('auth-header')) {
            existingHeader.outerHTML = this.headerHTML;
            this.setActiveNavLink();
        }
        
        if (existingFooter && !existingFooter.classList.contains('auth-footer')) {
            existingFooter.outerHTML = this.footerHTML;
        }
    },

    setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav a[data-page]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};

// Initialize before DOMContentLoaded so the layout parses quickly
document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
        AppLayout.init();
    }
});
