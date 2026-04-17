import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'AI Itinerary', href: '/ai-itinerary' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' },
    ],
    support: [
      { label: 'Help Center', href: '/help-center' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
    ],
  };

  return (
    <footer className="relative bg-foreground text-background overflow-hidden">
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-display">TripSync</span>
            </div>
            <p className="text-background/60 mb-6 max-w-sm leading-relaxed">
              AI-powered social travel platform. Find your tribe, plan smart itineraries, and explore the world with confidence.
            </p>
            <div className="space-y-3 text-background/60">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=dipanshukaranjekar2003@gmail.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:text-background transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-background/8 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>hello@tripsync.com</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background/8 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+91 8103146100</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-5 text-background/90 font-display">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                    <Link to={link.href} className="text-background/50 hover:text-background transition-colors text-sm">
                    {link.label}
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-5 text-background/90 font-display">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                    <Link to={link.href} className="text-background/50 hover:text-background transition-colors text-sm">
                    {link.label}
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-5 text-background/90 font-display">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                    <Link to={link.href} className="text-background/50 hover:text-background transition-colors text-sm">
                    {link.label}
                    </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-start items-center gap-4">
            <p className="text-background/40 text-sm flex items-center gap-1.5">
              © 2026 TripSync. Made with <Heart className="w-3.5 h-3.5 text-secondary fill-secondary" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
