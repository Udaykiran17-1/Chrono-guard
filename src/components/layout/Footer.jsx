import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Explore Talent', to: '/explore' },
    { label: 'Find Projects', to: '/projects' },
    { label: 'Pricing', to: '/pricing' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact', to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg font-bold text-brand-indigo">
              SkillBridge
            </Link>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Connecting skilled professionals with meaningful project
              opportunities. Build your portfolio, grow your network.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
              <ul className="mt-3 space-y-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-slate-500 transition-colors hover:text-brand-cobalt"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-card-border pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SkillBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
