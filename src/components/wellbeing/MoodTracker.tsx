import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Zap, AlertTriangle, Smile, CheckCircle2 } from 'lucide-react';
import { Card, Button, Textarea } from '@/components/ui';
import { useWellbeing } from '@/hooks/useWellbeing';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

interface MoodTrackerProps {
  className?: string;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ className }) => {
  const { moodEntries, fetchMoodEntries, createMoodEntry } = useWellbeing();
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(3);
  const [selectedStress, setSelectedStress] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  // Fetch mood entries on component mount
  useEffect(() => {
    fetchMoodEntries(30); // Get last 30 days
  }, [fetchMoodEntries]); // Include fetchMoodEntries in dependency array

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      await createMoodEntry({
        mood: selectedMood,
        energy: selectedEnergy,
        stress: selectedStress,
        notes: notes || undefined,
        date: new Date()
      });
      
      // Reset form
      setSelectedMood(0);
      setSelectedEnergy(3);
      setSelectedStress(3);
      setNotes('');
      setSubmitMessage('Mood entry saved successfully! 🎉');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save mood entry:', error);
      setSubmitMessage('Failed to save mood entry. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodOptions = [
    { id: 5, label: 'Very Happy', icon: '😄', color: 'bg-green-100 text-green-800 border-green-300' },
    { id: 4, label: 'Happy', icon: '😊', color: 'bg-green-50 text-green-700 border-green-200' },
    { id: 3, label: 'Neutral', icon: '😐', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { id: 2, label: 'Sad', icon: '😔', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { id: 1, label: 'Very Sad', icon: '😢', color: 'bg-red-50 text-red-700 border-red-200' }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Today's Mood Entry */}
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                How are you feeling today?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your mood, energy, and stress levels
              </p>
            </div>
          </div>
          <Smile className="h-8 w-8 text-gray-300 dark:text-gray-600" />
        </div>

        <div className="space-y-8">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              How's your mood?
            </label>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map((option) => (
                <button
                  key={`mood-${option.id}`}
                  onClick={() => setSelectedMood(option.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md',
                    selectedMood === option.id
                      ? `${option.color} shadow-lg scale-105`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  )}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span className="text-xs font-semibold text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Energy Level: <span className="text-yellow-600 dark:text-yellow-400">{selectedEnergy}/5</span>
            </label>
            <div className="flex gap-3 items-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={`energy-${level}`}
                  onClick={() => setSelectedEnergy(level)}
                  className={cn(
                    'flex-1 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105',
                    selectedEnergy >= level
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-500 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <span className={cn(
                    'text-xs font-bold',
                    selectedEnergy >= level ? 'text-white' : 'text-gray-400'
                  )}>
                    {level}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Stress Level: <span className="text-red-600 dark:text-red-400">{selectedStress}/5</span>
            </label>
            <div className="flex gap-3 items-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={`stress-${level}`}
                  onClick={() => setSelectedStress(level)}
                  className={cn(
                    'flex-1 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105',
                    selectedStress >= level
                      ? 'bg-gradient-to-br from-red-400 to-pink-500 border-red-500 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <span className={cn(
                    'text-xs font-bold',
                    selectedStress >= level ? 'text-white' : 'text-gray-400'
                  )}>
                    {level}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your day? Any thoughts or observations..."
              rows={3}
            />
          </div>

          {submitMessage && (
            <div className={cn(
              'p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2',
              submitMessage.includes('successfully') 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400 dark:border-green-800'
                : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-2 border-red-200 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-400 dark:border-red-800'
            )}>
              {submitMessage.includes('successfully') && (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              )}
              {submitMessage}
            </div>
          )}

          <Button
            onClick={handleSaveMood}
            disabled={selectedMood === 0 || isSubmitting}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            loading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : '✨ Save Mood Entry'}
          </Button>
        </div>
      </Card>

      {/* Recent Mood History */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Mood History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your last 5 mood entries
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {Array.isArray(moodEntries) && moodEntries.slice(0, 5).map((entry, index) => {
            const moodOption = moodOptions.find(m => m.id === entry.mood);
            return (
              <div
                key={entry.id || `mood-entry-${index}`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-2xl">{moodOption?.icon || '😐'}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {entry.date ? format(new Date(entry.date), 'MMM dd, yyyy') : 'Unknown date'}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-semibold text-yellow-700 dark:text-yellow-300">{entry.energy || 0}/5</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="font-semibold text-red-700 dark:text-red-300">{entry.stress || 0}/5</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {(!Array.isArray(moodEntries) || moodEntries.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No mood entries yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Start tracking your mood above to see your history!
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};