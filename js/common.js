document.addEventListener('DOMContentLoaded', () => {
  // 1. Authentication Status
  const token = localStorage.getItem('token');
  const loginLinks = document.querySelectorAll('a[href="login.html"]');
  const signupLinks = document.querySelectorAll('a[href="role-selection.html"]');
  
  if (token) {
    loginLinks.forEach(link => {
      link.textContent = 'My Dashboard';
      // Attempt to route properly based on stored user
      const mockUser = JSON.parse(localStorage.getItem('mockUser') || '{"role": "customer"}');
      link.href = mockUser.role === 'staff' ? 'expert-dashboard.html' : 'customer-dashboard.html';
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
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 4px solid var(--dash-${type === 'accent' ? 'accent' : (type === 'success' ? 'accent' : 'border')});
      color: white;
      padding: 1.25rem 2rem;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      animation: toastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    `;

    // Icon based on type
    let icon = '<i class="fas fa-satellite-dish" style="color: var(--dash-accent)"></i>';
    if (type === 'success') icon = '<i class="fas fa-check-circle" style="color: #10b981"></i>';
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
