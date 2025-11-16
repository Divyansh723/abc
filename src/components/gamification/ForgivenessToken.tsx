import React, { useState } from 'react';
import { Heart, Clock, AlertTriangle } from 'lucide-react';
import { Button, Card, Modal, ModalContent, ModalFooter, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

interface ForgivenessTokenProps {
  available: number;
  onUse?: (habitId: string, date: Date) => Promise<any>;
  className?: string;
}

interface UseTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitName: string;
  missedDate: string;
  isLoading: boolean;
}

const UseTokenModal: React.FC<UseTokenModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  habitName,
  missedDate,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Use Forgiveness Token" size="sm">
      <ModalContent>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-error-600 dark:text-error-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Forgive Missed Day?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use a forgiveness token to maintain your streak for <strong>{habitName}</strong> on {missedDate}?
            </p>
          </div>

          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warning-700 dark:text-warning-300">
                <p className="font-medium mb-1">Remember:</p>
                <ul className="space-y-1 text-xs">
                  <li>• You get 2 tokens per month</li>
                  <li>• Tokens can only be used within 24 hours</li>
                  <li>• No XP is earned for forgiven days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={onConfirm} 
          loading={isLoading}
          leftIcon={<Heart className="h-4 w-4" />}
        >
          Use Token
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export const ForgivenessToken: React.FC<ForgivenessTokenProps> = ({
  available,
  onUse,
  className,
}) => {
  const { user: _user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<{
    id: string;
    name: string;
    date: Date;
  } | null>(null);

  const handleUseToken = async () => {
    if (!selectedHabit || !onUse) return;
    
    setIsLoading(true);
    try {
      await onUse(selectedHabit.id, selectedHabit.date);
      setShowModal(false);
      setSelectedHabit(null);
    } catch (error) {
      console.error('Failed to use forgiveness token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function for opening token modal (kept for future use)
  // const openTokenModal = (habitId: string, habitName: string, date: Date) => {
  //   setSelectedHabit({ id: habitId, name: habitName, date });
  //   setShowModal(true);
  // };

  return (
    <>
      <Card className={cn('relative overflow-hidden', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/10 dark:to-red-900/10" />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Forgiveness Tokens
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Grace for missed days
                </p>
              </div>
            </div>
            
            <Badge 
              variant={available > 0 ? 'primary' : 'outline'}
              className="text-lg px-3 py-1"
            >
              {available}/2
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                    index < available
                      ? 'bg-gradient-to-br from-pink-500 to-red-500 border-pink-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  )}
                >
                  <Heart className="h-4 w-4" />
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span>Resets monthly</span>
              </div>
              <p>
                Use within 24 hours of missing a habit to maintain your streak.
              </p>
            </div>

            {available === 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No tokens available this month
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Tokens reset on the 1st of each month
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Use Token Modal */}
      {selectedHabit && (
        <UseTokenModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedHabit(null);
          }}
          onConfirm={handleUseToken}
          habitName={selectedHabit.name}
          missedDate={selectedHabit.date.toLocaleDateString()}
          isLoading={isLoading}
        />
      )}
    </>
  );
};