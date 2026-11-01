import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group" title="Return to ASGARD-IRI Home">
            <img src="/logo.png" alt="ASGARD-IRI" className="h-20 w-20 mx-auto mb-4 object-contain rounded-full drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
          </Link>
          {title && (
            <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
          )}
          {subtitle && (
            <p className="text-grey-600 text-sm mt-2">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card-md border border-grey-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
