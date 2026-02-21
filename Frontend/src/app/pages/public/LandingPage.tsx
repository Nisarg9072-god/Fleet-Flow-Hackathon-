import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Zap,
  Wrench,
  TrendingDown,
  ChevronRight,
  CheckCircle,
  BarChart3,
  Clock,
  Shield,
  Users,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const heroImages = [
    'https://images.pexels.com/photos/12418932/pexels-photo-12418932.jpeg',
    'https://images.unsplash.com/photo-1766561994067-dbd575e1cff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGVldCUyMHRydWNrJTIwaGlnaHdheSUyMGxvZ2lzdGljc3xlbnwxfHx8fDE3NzE2NTM2NDl8MA&ixlib=rb-4.1.0&q=80&w=1920',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAJal_MwnvJUy0mbBTERkjuGhIokN64yd4cg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAJal_MwnvJUy0mbBTERkjuGhIokN64yd4cg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLqI_OZr1WY3hSzRRloSrlc-6gJgDevu0hxA&s',
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Fleet Tracking',
      description: 'Monitor every vehicle in your fleet with precision GPS tracking and live updates.',
    },
    {
      icon: Zap,
      title: 'Intelligent Dispatch Engine',
      description: 'AI-powered routing and dispatch optimization for maximum efficiency.',
    },
    {
      icon: Wrench,
      title: 'Predictive Maintenance',
      description: 'Prevent breakdowns before they happen with intelligent maintenance alerts.',
    },
    {
      icon: TrendingDown,
      title: 'Cost & Fuel Optimization',
      description: 'Reduce operational costs with data-driven fuel consumption insights.',
    },
  ];

  const stats = [
    { value: '20%', label: 'Cost Reduction' },
    { value: '35%', label: 'Faster Dispatch' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Monitoring' },
  ];

  const testimonials = [
    {
      company: 'TransLogix Corp',
      quote:
        'Horizan transformed our operations. We reduced fuel costs by 23% in the first quarter alone.',
      name: 'Sarah Mitchell',
      role: 'VP of Operations',
    },
    {
      company: 'National Freight Solutions',
      quote:
        'The predictive maintenance feature has saved us from costly breakdowns. ROI was immediate.',
      name: 'Michael Chen',
      role: 'Fleet Director',
    },
    {
      company: 'Metro Delivery Services',
      quote:
        'Dispatch times cut in half. Our customers notice the difference, and so does our bottom line.',
      name: 'Jessica Rodriguez',
      role: 'Operations Manager',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, i) => (
            <motion.div
              key={`${i}-${src}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: i === heroIndex ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <ImageWithFallback
                src={src}
                alt="Fleet background"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400 rounded-full"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Operate Smarter<sup className="text-3xl">™</sup>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Lower operational costs and improve fleet safety with real-time intelligence and
              AI-driven dispatch.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:shadow-2xl hover:scale-105 flex items-center justify-center group"
                >
                  Go to Dashboard
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:shadow-2xl hover:scale-105 flex items-center justify-center group"
                >
                  Login
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-medium transition-all">
                See Demo
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-6 h-6 text-white rotate-90" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to manage your fleet
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed for modern fleet operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section id="solutions" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759752394755-1241472b589d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBzY3JlZW58ZW58MXx8fHwxNzcxNTYzODE2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Horizan Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Real-time insights that drive decisions
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our intelligent platform gives you complete visibility into your fleet operations
                with actionable insights that matter.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Live vehicle tracking and route optimization',
                  'Driver behavior monitoring and safety scores',
                  'Automated maintenance scheduling',
                  'Custom reporting and analytics',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircle className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{item}</span>
                  </motion.li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:shadow-xl inline-flex items-center group"
              >
                Explore Platform
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by enterprises worldwide
            </h2>
            <p className="text-xl text-gray-300">
              Real results from real fleet operations
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-indigo-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="resources" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What our customers say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of fleet managers who trust Horizan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-6">
                  <div className="flex text-indigo-600 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                  <div className="text-indigo-600 font-medium mt-1">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your fleet operations?
            </h2>
            <p className="text-xl text-indigo-100 mb-10">
              Join leading enterprises using Horizan to drive efficiency and reduce costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium transition-all hover:shadow-2xl inline-flex items-center justify-center group"
                >
                  Go to Dashboard
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium transition-all hover:shadow-2xl inline-flex items-center justify-center group"
                >
                  Get Started Now
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-full text-lg font-medium transition-all">
                Schedule a Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
