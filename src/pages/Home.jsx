import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Compass, 
  Users, 
  BarChart3, 
  Sparkles, 
  MapPin, 
  Calendar,
  ArrowRight,
  Globe,
  Heart,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: Compass,
      title: 'Mood Discovery',
      description: 'Upload images, enter emojis, or describe your mood to get personalized destination suggestions.',
      link: '/mood-discovery',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Group Travel',
      description: 'Create or join travel groups, vote on activities, and plan together with friends.',
      link: '/group-travel',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: BarChart3,
      title: 'Trip Dashboard',
      description: 'Track your bookings, get weather updates, daily tips, and manage your travel plans.',
      link: '/dashboard',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const highlights = [
    { icon: Globe, text: 'AI-Powered Recommendations' },
    { icon: Heart, text: 'Mood-Based Discovery' },
    { icon: Star, text: 'Group Planning Made Easy' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Welcome Message */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Welcome back, {currentUser?.displayName || 'Traveler'}!
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Plan Your Trip with
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                TRAVEL-WIZARD
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover destinations based on your mood, plan with friends through group voting, 
              and get AI-powered assistance for the perfect travel experience.
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center text-white/90">
                  <highlight.icon className="h-5 w-5 mr-2 text-yellow-400" />
                  <span className="text-sm font-medium">{highlight.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link to="/mood-discovery">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-gray-50 font-semibold px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                data-testid="get-started-btn"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" fill="none" className="w-full h-20">
            <path d="M0,100 C300,20 900,20 1200,100 L1200,120 L0,120 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Our Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for intelligent travel planning in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white overflow-hidden"
                data-testid={`feature-card-${index}`}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <CardDescription className="text-gray-600 mb-6 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Link to={feature.link}>
                    <Button 
                      variant="outline" 
                      className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 rounded-xl"
                      data-testid={`feature-btn-${index}`}
                    >
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-indigo-600">50k+</div>
              <div className="text-gray-600">Destinations</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-indigo-600">100k+</div>
              <div className="text-gray-600">Happy Travelers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-indigo-600">25k+</div>
              <div className="text-gray-600">Group Trips</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-indigo-600">99%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;