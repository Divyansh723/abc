import React from 'react';
import { PublicLayout } from '../components/layout';
import { Card, FloatingElements } from '../components/ui';
import { FileText, Scale, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: 'By accessing and using HabitForge, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.'
    },
    {
      icon: FileText,
      title: 'Use of Service',
      items: [
        'You must be at least 13 years old to use HabitForge',
        'You are responsible for maintaining the security of your account',
        'You agree to provide accurate and complete information',
        'You will not use the service for any illegal or unauthorized purpose',
        'You will not interfere with or disrupt the service or servers'
      ]
    },
    {
      icon: Shield,
      title: 'User Content',
      items: [
        'You retain all rights to the content you create and share',
        'You grant us a license to use your content to provide the service',
        'You are responsible for the content you post',
        'We reserve the right to remove content that violates our policies',
        'You will not post harmful, offensive, or illegal content'
      ]
    },
    {
      icon: Scale,
      title: 'Intellectual Property',
      content: 'All content, features, and functionality of HabitForge are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.'
    },
    {
      icon: XCircle,
      title: 'Prohibited Activities',
      items: [
        'Attempting to gain unauthorized access to our systems',
        'Using automated systems to access the service',
        'Impersonating another user or person',
        'Transmitting viruses or malicious code',
        'Collecting user information without consent',
        'Engaging in any activity that disrupts the service'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Disclaimers and Limitations',
      content: 'HabitForge is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.'
    }
  ];

  const additionalTerms = [
    {
      title: 'Account Termination',
      description: 'We reserve the right to suspend or terminate your account if you violate these terms or engage in harmful behavior.'
    },
    {
      title: 'Changes to Terms',
      description: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.'
    },
    {
      title: 'Governing Law',
      description: 'These terms are governed by the laws of the United States. Any disputes will be resolved in the courts of California.'
    },
    {
      title: 'Contact Us',
      description: 'If you have questions about these terms, please contact us at legal@habitforge.com'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <FloatingElements variant="terms" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-6">
              <Scale className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Terms of
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using HabitForge. By using our service, you agree to these terms.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Last updated: January 2024
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-24">
        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center border-0 bg-white dark:bg-gray-800 animate-fade-in-up">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fair Use</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use our service responsibly and respectfully</p>
          </Card>
          <Card className="p-6 text-center border-0 bg-white dark:bg-gray-800 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Rights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">You own your content and data</p>
          </Card>
          <Card className="p-6 text-center border-0 bg-white dark:bg-gray-800 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Stay Informed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">We'll notify you of any changes</p>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 mb-16">
          {sections.map((section, index) => (
            <Card 
              key={index} 
              className="p-8 border-0 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h2>
                  
                  {section.content && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <span className="text-primary-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalTerms.map((term, index) => (
            <Card 
              key={index} 
              className="p-6 border-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${1200 + index * 100}ms` }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {term.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {term.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="p-8 mt-12 bg-gradient-to-r from-primary-600 to-secondary-600 text-white border-0 animate-fade-in-up" style={{ animationDelay: '1600ms' }}>
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-3">
              Questions About These Terms?
            </h3>
            <p className="text-primary-100 mb-4 max-w-2xl mx-auto">
              We're here to help clarify anything you need. Don't hesitate to reach out to our legal team.
            </p>
            <a 
              href="mailto:legal@habitforge.com" 
              className="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              Contact Legal Team
            </a>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default TermsPage;
