import React from "react";

const Footer = () => {
  return (
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-col brand">
          <div class="logo-row">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="logo"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
            </svg>
            <span class="brand-name">BreatheFree</span>
          </div>
          <p class="description">
            Supporting your journey to a smoke-free life with evidence-based
            tools and community support.
          </p>
        </div>

        <div class="footer-col">
          <h4>Platform</h4>
          <a href="#">Dashboard</a>
          <a href="#">Kế Hoạch Cai Thuốc</a>
          <a href="#">Theo Dõi</a>
          <a href="#">Blog</a>
        </div>

        <div class="footer-col">
          <h4>Company</h4>
          <a href="#">Contact</a>
          <a href="#">Careers</a>
        </div>

        <div class="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 BreatheFree. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
