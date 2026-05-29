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
