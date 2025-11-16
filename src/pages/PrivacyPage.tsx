import React from 'react';
import { PublicLayout } from '../components/layout';
import { Card, FloatingElements } from '../components/ui';
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, Mail, FileText } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        { subtitle: 'Personal Information', items: ['Name and email address', 'Profile information and preferences', 'Habit data and completion records', 'Mood and wellbeing entries', 'Community interactions and messages'] },
        { subtitle: 'Automatically Collected', items: ['Device information and browser type', 'IP address and location data', 'Usage patterns and analytics', 'Cookies and similar tracking technologies'] }
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      items: ['Provide, maintain, and improve our services', 'Send you notifications and reminders', 'Generate personalized insights and recommendations', 'Enable community features and interactions', 'Respond to your requests and support needs', 'Analyze usage patterns and optimize performance', 'Protect against fraud and abuse']
    },
    {
      icon: Lock,
      title: 'Data Security',
      description: 'We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.'
    },
    {
      icon: UserCheck,
      title: 'Your Rights and Choices',
      items: ['Access and download your data', 'Correct inaccurate information', 'Delete your account and data', 'Opt-out of marketing communications', 'Disable AI features', 'Control community visibility settings']
    }
  ];

  const additionalInfo = [
    {
      icon: FileText,
      title: 'Data Retention',
      description: 'We retain your data for as long as your account is active or as needed to provide services. You can request deletion at any time.'
    },
    {
      icon: Shield,
      title: 'Third-Party Services',
      description: 'We may share data with trusted third-party services that help us operate. They are bound by strict confidentiality agreements.'
    },
    {
      icon: AlertCircle,
      title: 'Policy Updates',
      description: 'We may update this policy from time to time. We\'ll notify you of significant changes via email or in-app notification.'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <FloatingElements variant="privacy" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-6">
              <Shield className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Your Privacy</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Privacy
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your privacy matters to us. Here's how we protect and handle your data with transparency and care.
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
          <Card className="p-6 text-center border-0 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Encrypted & Secure</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your data is encrypted and stored securely</p>
          </Card>
          <Card className="p-6 text-center border-0 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-4">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">You're in Control</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access, export, or delete your data anytime</p>
          </Card>
          <Card className="p-6 text-center border-0 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mb-4">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Data Selling</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">We never sell your personal information</p>
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
                  
                  {section.description && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  
                  {section.content && section.content.map((subsection, idx) => (
                    <div key={idx} className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {subsection.subtitle}
                      </h3>
                      <ul className="space-y-2">
                        {subsection.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-primary-500 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                          <span className="text-primary-500 mt-1">✓</span>
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

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {additionalInfo.map((info, index) => (
            <Card 
              key={index} 
              className="p-6 border-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${1000 + index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <info.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {info.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {info.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="p-8 bg-gradient-to-r from-primary-600 to-secondary-600 text-white border-0 animate-fade-in-up" style={{ animationDelay: '1300ms' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">
                Questions About Your Privacy?
              </h3>
              <p className="text-primary-100 mb-4">
                We're here to help. If you have any questions about how we handle your data, please don't hesitate to reach out.
              </p>
              <a 
                href="mailto:privacy@habitforge.com" 
                className="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Contact Privacy Team
              </a>
            </div>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPage;
