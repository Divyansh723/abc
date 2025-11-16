import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle, BarChart3, Heart, Target } from 'lucide-react';
import { Card, Badge, Button, Select } from '@/components/ui';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/utils/cn';


interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: string;
  icon: React.ComponentType<any>;
  estimatedSize: string;
  includesTimezone: boolean;
}

interface DataExportProps {
  className?: string;
}

export const DataExport: React.FC<DataExportProps> = ({ className }) => {
  const { exportData } = useAnalytics();
  const [dateRange, setDateRange] = useState<string>('30_days');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<Record<string, 'success' | 'error'>>({});

  const exportOptions: ExportOption[] = [
    {
      id: 'habits_complete',
      name: 'Complete Habit Data',
      description: 'Full export including habits, completions, streaks, and metadata',
      format: 'csv',
      icon: Target,
      estimatedSize: '2-5 MB',
      includesTimezone: true
    },
    {
      id: 'completions_only',
      name: 'Completion Records',
      description: 'Simple completion tracking data for analysis',
      format: 'csv',
      icon: CheckCircle,
      estimatedSize: '500 KB',
      includesTimezone: true
    },
    {
      id: 'analytics_summary',
      name: 'Analytics Summary',
      description: 'Comprehensive analytics including trends, weekly stats, and per-habit breakdown',
      format: 'csv',
      icon: BarChart3,
      estimatedSize: '200 KB',
      includesTimezone: true
    },
    {
      id: 'wellbeing_data',
      name: 'Wellbeing & Mood Data',
      description: 'Mood tracking, stress levels, and wellbeing insights',
      format: 'csv',
      icon: Heart,
      estimatedSize: '1 MB',
      includesTimezone: true
    }
  ];

  const dateRangeOptions = [
    { value: '7_days', label: 'Last 7 days' },
    { value: '30_days', label: 'Last 30 days' },
    { value: '90_days', label: 'Last 3 months' },
    { value: '1_year', label: 'Last year' },
    { value: 'all_time', label: 'All time' }
  ];

  const handleExport = async (exportId: string) => {
    setExportingId(exportId);
    setExportStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[exportId];
      return newStatus;
    });
    
    try {
      await exportData(exportId, dateRange);
      setExportStatus(prev => ({ ...prev, [exportId]: 'success' }));
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setExportStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[exportId];
          return newStatus;
        });
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(prev => ({ ...prev, [exportId]: 'error' }));
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-green-500" />
          Data Export
        </h3>
        <Badge variant="outline" size="sm">
          CSV Format with UTC Timestamps
        </Badge>
      </div>

      {/* Date Range Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range for All Exports
          </label>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={dateRangeOptions}
            className="w-48"
          />
        </div>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isExporting = exportingId === option.id;
          const status = exportStatus[option.id];
          
          return (
            <Card 
              key={option.id}
              className="p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </h4>
                    <Badge variant="outline" size="sm">
                      {option.format.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {option.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-gray-500 dark:text-gray-500">
                      Est. size: {option.estimatedSize}
                    </span>
                    {option.includesTimezone && (
                      <Badge variant="outline" size="sm" className="text-xs">
                        Timezone Info
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {status && (
                <div className={cn(
                  'flex items-center gap-2 mb-3 p-2 rounded text-sm',
                  status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                )}>
                  {status === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Downloaded successfully!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>Export failed. Please try again.</span>
                    </>
                  )}
                </div>
              )}

              {/* Download Button */}
              <Button
                onClick={() => handleExport(option.id)}
                disabled={isExporting}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Downloading...' : 'Download CSV'}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Privacy Notice */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Privacy & Data Protection</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your exported data is processed locally and never sent to external servers during export. 
              All personal identifiers are anonymized while maintaining data utility for analysis.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};