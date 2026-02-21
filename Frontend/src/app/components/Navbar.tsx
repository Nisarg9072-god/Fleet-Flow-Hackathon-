import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md backdrop-blur-sm bg-opacity-95'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className={`p-2 rounded-lg transition-colors ${
              isScrolled ? 'bg-indigo-600' : 'bg-white/10 backdrop-blur-sm'
            }`}>
              <Truck className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-white'}`} />
            </div>
            <span className={`text-xl font-semibold transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              Horizan
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#products"
              className={`transition-colors hover:text-indigo-600 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              Products
            </a>
            <a
              href="#solutions"
              className={`transition-colors hover:text-indigo-600 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              Solutions
            </a>
            <a
              href="#resources"
              className={`transition-colors hover:text-indigo-600 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              Resources
            </a>
            <a
              href="#about"
              className={`transition-colors hover:text-indigo-600 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              About
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <a
              href="#contact"
              className={`hidden md:block transition-colors hover:text-indigo-600 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              Contact
            </a>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/app/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full transition-all hover:shadow-lg hover:scale-105"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className={`hidden md:block transition-colors hover:text-indigo-600 ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full transition-all hover:shadow-lg hover:scale-105"
                >
                  Check Pricing
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
