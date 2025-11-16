import React from 'react';
import { PublicLayout } from '../components/layout';
import { Card, FloatingElements } from '../components/ui';
import { Button } from '../components/ui';
import { Check, Zap, Star, HelpCircle, DollarSign } from 'lucide-react';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with habit tracking',
      features: [
        'Up to 5 active habits',
        'Basic habit tracking',
        'Streak tracking',
        'Daily reminders',
        'Basic analytics',
        'Mobile responsive'
      ],
      cta: 'Get Started',
      highlighted: false,
      gradient: 'from-gray-500 to-gray-700'
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For serious habit builders who want more',
      features: [
        'Unlimited habits',
        'Advanced analytics & insights',
        'AI coaching & recommendations',
        'Community circles',
        'Custom challenges',
        'Forgiveness tokens',
        'Priority support',
        'Export data'
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      gradient: 'from-primary-600 to-secondary-600'
    },
    {
      name: 'Team',
      price: '$29',
      period: 'per month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        'Team analytics dashboard',
        'Admin controls',
        'Custom branding',
        'Dedicated support',
        'API access',
        'SSO integration'
      ],
      cta: 'Contact Sales',
      highlighted: false,
      gradient: 'from-purple-600 to-pink-600'
    }
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and Apple Pay.'
    },
    {
      question: 'Is there a refund policy?',
      answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans.'
    },
    {
      question: 'Do you offer discounts for annual plans?',
      answer: 'Yes! Save 20% when you choose annual billing instead of monthly.'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <FloatingElements variant="pricing" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-6">
              <DollarSign className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Simple Pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Start free and upgrade as you grow. All plans include a 14-day free trial with no credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`group relative p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 animate-fade-in-up ${
                plan.highlighted ? 'ring-2 ring-purple-500 shadow-xl scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                    <Star className="h-4 w-4" fill="currentColor" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Zap className="h-8 w-8 text-white" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.highlighted ? 'primary' : 'outline'}
                className={`w-full transition-all duration-300 hover:scale-105 ${
                  plan.highlighted ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700' : ''
                }`}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="inline-flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-4">
              <HelpCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FAQ</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className="p-6 border-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${1000 + index * 100}ms` }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 ml-8">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Build Better Habits?
          </h2>
          <p className="text-xl text-primary-100 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PricingPage;
