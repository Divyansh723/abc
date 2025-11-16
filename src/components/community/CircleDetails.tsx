import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Trophy, Flag, Eye, EyeOff, Users, UserMinus, Shield, Crown, Edit } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCircleDetails } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import communityService from '@/services/communityService';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import { CreateChallengeModal } from './CreateChallengeModal';
import { RemoveMemberModal } from './RemoveMemberModal';
import { EditCircleModal } from './EditCircleModal';
import { cn } from '@/utils/cn';

interface CircleDetailsProps {
  circleId: string;
  onBack?: () => void;
  className?: string;
}

export const CircleDetails: React.FC<CircleDetailsProps> = ({
  circleId,
  onBack,
  className
}) => {
  const { user } = useAuth();
  const {
    circle,
    leaderboard,
    loading,
    error,
    postMessage,
    toggleLeaderboardOptOut,
    reportMessage,
    refreshCircle,
    refreshLeaderboard
  } = useCircleDetails(circleId);

  const [messageContent, setMessageContent] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'leaderboard' | 'challenges' | 'announcements' | 'members'>('messages');
  const [removingMember, setRemovingMember] = useState<{ id: string; name: string } | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [joiningCircle, setJoiningCircle] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [showEditCircleModal, setShowEditCircleModal] = useState(false);
  const [showDeleteCircleConfirm, setShowDeleteCircleConfirm] = useState(false);
  const [showReportMessageConfirm, setShowReportMessageConfirm] = useState<string | null>(null);
  const [showDeleteAnnouncementConfirm, setShowDeleteAnnouncementConfirm] = useState<string | null>(null);
  const [showDeleteChallengeConfirm, setShowDeleteChallengeConfirm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear justJoined flag once circle data confirms membership
  React.useEffect(() => {
    if (circle?.userIsMember && justJoined) {
      console.log('Circle data confirmed membership, clearing justJoined flag');
      setJustJoined(false);
    }
  }, [circle?.userIsMember, justJoined]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (activeTab === 'messages' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [circle?.messages, activeTab]);

  // Debug admin status
  React.useEffect(() => {
    if (circle) {
      console.log('Circle admin status:', {
        userIsAdmin: circle.userIsAdmin,
        userIsMember: circle.userIsMember,
        userId: user?.id,
        createdBy: circle.createdBy
      });
    }
  }, [circle, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    setSendingMessage(true);
    try {
      await postMessage(messageContent);
      setMessageContent('');
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSendingMessage(false);
    }
  };

  const handleToggleLeaderboard = async () => {
    try {
      await toggleLeaderboardOptOut();
      // Refresh circle data to update the opt-out status
      await refreshCircle();
      // Refresh leaderboard to show/hide the user immediately
      await refreshLeaderboard();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleReportMessage = async (messageId: string) => {
    try {
      await reportMessage(messageId);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (loading && !circle) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading circle...</p>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Circle not found</p>
        {onBack && (
          <Button onClick={onBack} variant="secondary" className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  // Find the current user's member record
  const userMember = circle.members.find(m => {
    // Handle both populated (object with _id) and unpopulated (string) userId
    const memberId = typeof m.userId === 'object' && m.userId !== null 
      ? (m.userId as any)._id || (m.userId as any).id
      : m.userId;
    return memberId === user?.id;
  });
  const isOptedOut = userMember?.optOutOfLeaderboard || false;
  
  console.log('Leaderboard opt-out status:', { 
    userId: user?.id, 
    userMember, 
    isOptedOut 
  });
  // Check membership status - after joining, this should be true
  // Also check justJoined flag to handle the case where the API hasn't updated yet
  const isMember = circle.userIsMember || justJoined || false;
  const isFull = circle.availableSpots === 0;
  
  // Debug log
  console.log('Circle membership status:', { 
    userIsMember: circle.userIsMember, 
    justJoined,
    isMember, 
    memberCount: circle.memberCount,
    joiningCircle 
  });

  // Handle join circle
  const handleJoinCircle = async () => {
    if (joiningCircle || isFull) return;
    
    setJoiningCircle(true);
    try {
      // For private circles, we might need an invite code
      // For now, we'll just try to join without one
      await communityService.joinCircle(circleId);
      
      console.log('Join API call successful, refreshing circle data...');
      
      // Refresh the circle data to update membership status
      await refreshCircle();
      
      console.log('Circle refreshed, new membership status:', circle?.userIsMember);
      
      // Mark that user just joined (backup flag)
      setJustJoined(true);
    } catch (err) {
      console.error('Failed to join circle:', err);
      setJustJoined(false);
      // Error will be shown in the UI via the error state
    } finally {
      setJoiningCircle(false);
    }
  };

  // Handle delete circle (admin only)
  const handleDeleteCircle = async () => {
    try {
      await communityService.deleteCircle(circleId);
      console.log('Circle deleted successfully');
      // Navigate back to circle list
      if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error('Failed to delete circle:', err);
      alert('Failed to delete circle. Please try again.');
    }
  };

  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700" />
        
        <div className="relative p-4 sm:p-5 md:p-6">
          <div className="flex items-start gap-2 sm:gap-4">
            {onBack && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                  {circle.name}
                </h2>
                {circle.isPrivate && (
                  <span className="px-2 py-1 text-xs font-semibold bg-white/20 text-white rounded-md inline-block w-fit">
                    Private
                  </span>
                )}
              </div>
              {circle.description && (
                <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-2">
                  {circle.description}
                </p>
              )}
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  {circle.memberCount} / {circle.maxMembers}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Admin Controls - Outside Header */}
      {circle.userIsAdmin && isMember && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Admin Controls
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your community circle settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditCircleModal(true)}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-blue-600 dark:border-blue-500"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Circle
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteCircleConfirm(true)}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-red-600 dark:border-red-500"
              >
                🗑️ Delete Circle
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Circle Modal */}
      {showEditCircleModal && (
        <EditCircleModal
          isOpen={showEditCircleModal}
          onClose={() => setShowEditCircleModal(false)}
          circleId={circleId}
          currentName={circle.name}
          currentDescription={circle.description}
          onSuccess={() => {
            refreshCircle();
          }}
        />
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Join Prompt for Non-Members */}
      {!isMember && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
          
          <div className="relative p-4 sm:p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 shadow-lg mb-4 sm:mb-6">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Join {circle.name}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {circle.description || 'Connect with others, share progress, and stay motivated together!'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Share Updates</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Post messages and encourage others</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Compete</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Track progress on leaderboards</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">⭐</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Earn Points</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Complete challenges for rewards</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              {onBack && (
                <Button 
                  variant="secondary"
                  size="lg"
                  onClick={onBack}
                >
                  Go Back
                </Button>
              )}
              <Button 
                size="lg"
                onClick={handleJoinCircle}
                disabled={isFull || joiningCircle}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                {joiningCircle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Joining...
                  </>
                ) : isFull ? (
                  <>Circle Full ({circle.maxMembers} members)</>
                ) : (
                  <>Join Circle ({circle.availableSpots} spots left)</>
                )}
              </Button>
            </div>
            
            {circle.isPrivate && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                🔒 This is a private circle. You may need an invite code to join.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Tabs - Only show for members */}
      {isMember && (
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('messages')}
          className={cn(
            'flex-1 px-4 py-3 font-semibold text-sm rounded-md transition-all whitespace-nowrap',
            activeTab === 'messages'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          💬 Messages
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            'flex-1 px-4 py-3 font-semibold text-sm rounded-md transition-all whitespace-nowrap',
            activeTab === 'leaderboard'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={cn(
            'flex-1 px-4 py-3 font-semibold text-sm rounded-md transition-all whitespace-nowrap',
            activeTab === 'challenges'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          🎯 Challenges
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={cn(
            'flex-1 px-4 py-3 font-semibold text-sm rounded-md transition-all whitespace-nowrap',
            activeTab === 'announcements'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          📢 Announcements
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={cn(
            'flex-1 px-4 py-3 font-semibold text-sm rounded-md transition-all whitespace-nowrap',
            activeTab === 'members'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          👥 Members
        </button>
        </div>
      )}

      {/* Messages Tab - Only for members */}
      {isMember && activeTab === 'messages' && (
        <div className="space-y-4">
          {/* Message List */}
          <Card className="p-6 max-h-[300px] overflow-y-auto">
            {circle.messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No messages yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Be the first to say hello!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {circle.messages.map((message) => {
                  // Get user name and ID from populated userId field or fallback
                  const userName = typeof message.userId === 'object' && message.userId?.name
                    ? message.userId.name
                    : message.name || 'Anonymous';
                  const messageUserId = typeof message.userId === 'object' && message.userId !== null
                    ? (message.userId as any)._id || (message.userId as any).id
                    : message.userId;
                  const userInitial = userName[0].toUpperCase();
                  const isOwnMessage = messageUserId === user?.id;
                  
                  // Generate consistent color for each user based on their ID
                  const getUserColor = (userId: string) => {
                    const colors = [
                      { gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', bg: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)' }, // blue
                      { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', bg: '#10b981', light: 'rgba(16, 185, 129, 0.1)' }, // green
                      { gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', bg: '#a855f7', light: 'rgba(168, 85, 247, 0.1)' }, // purple
                      { gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', bg: '#ec4899', light: 'rgba(236, 72, 153, 0.1)' }, // pink
                      { gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', bg: '#f97316', light: 'rgba(249, 115, 22, 0.1)' }, // orange
                      { gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', bg: '#14b8a6', light: 'rgba(20, 184, 166, 0.1)' }, // teal
                      { gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', bg: '#6366f1', light: 'rgba(99, 102, 241, 0.1)' }, // indigo
                      { gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', bg: '#f43f5e', light: 'rgba(244, 63, 94, 0.1)' }, // rose
                    ];
                    // Simple hash function to get consistent color index
                    let hash = 0;
                    for (let i = 0; i < userId.length; i++) {
                      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    return colors[Math.abs(hash) % colors.length];
                  };
                  
                  const userColor = isOwnMessage 
                    ? null // Will use Tailwind classes for own messages
                    : getUserColor(messageUserId);
                  
                  return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex gap-3",
                      isOwnMessage ? "flex-row-reverse justify-start" : "flex-row justify-start"
                    )}
                  >
                    <div className="flex-shrink-0">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={isOwnMessage 
                          ? { background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }
                          : { background: userColor?.gradient }
                        }
                      >
                        {userInitial}
                      </div>
                    </div>
                    
                    <div className={cn(
                      "group max-w-[70%]",
                      isOwnMessage ? "flex flex-col items-end" : "flex flex-col items-start"
                    )}>
                      <div className={cn(
                        "flex items-center gap-2 mb-1",
                        isOwnMessage ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span className={cn(
                          "font-semibold text-sm",
                          isOwnMessage ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-white"
                        )}>
                          {isOwnMessage ? 'You' : userName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                        {!isOwnMessage && (
                          <button
                            onClick={() => setShowReportMessageConfirm(message._id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity"
                            title="Report message"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      <div 
                        className={cn(
                          "p-3 rounded-2xl",
                          isOwnMessage 
                            ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm" 
                            : "text-gray-900 dark:text-white rounded-tl-sm"
                        )}
                        style={!isOwnMessage && userColor ? {
                          background: userColor.light,
                          border: `1px solid ${userColor.bg}20`
                        } : undefined}
                      >
                        <p className="text-sm break-words">
                          {message.content}
                        </p>
                      </div>
                      
                      {message.reported && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
                          ⚠️ Reported
                        </span>
                      )}
                    </div>
                  </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </Card>

          {/* Message Input */}
          <Card className="p-4">
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  maxLength={500}
                  className="flex-1"
                  disabled={sendingMessage}
                />
                <Button
                  type="submit"
                  disabled={sendingMessage || !messageContent.trim()}
                  className="px-6"
                >
                  {sendingMessage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {messageContent.length} / 500 characters
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {circle.moderationSettings.maxMessagesPerDay} messages per day limit
                </span>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Leaderboard Tab - Only for members */}
      {isMember && activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Leaderboard Controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              {isOptedOut ? (
                <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isOptedOut ? 'Hidden from leaderboard' : 'Visible on leaderboard'}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleLeaderboard}
            >
              {isOptedOut ? 'Show Me' : 'Hide Me'}
            </Button>
          </div>

          {/* Leaderboard */}
          <Card className="p-4">
            {!leaderboard || leaderboard.leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No leaderboard data yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg',
                      index === 0 && 'bg-yellow-50 dark:bg-yellow-900/20',
                      index === 1 && 'bg-gray-100 dark:bg-gray-800',
                      index === 2 && 'bg-orange-50 dark:bg-orange-900/20',
                      index > 2 && 'bg-gray-50 dark:bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-700 font-bold text-sm">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {entry.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {entry.habitCount} active habits
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {entry.communityPoints || 0} ⭐
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          community pts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {entry.weeklyStreakAverage}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          avg streak
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Challenges Tab - Only for members */}
      {isMember && activeTab === 'challenges' && (
        <div className="space-y-4">
          {/* Admin Create Challenge Button */}
          {circle.userIsAdmin && (
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create Challenge</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engage members with new challenges</p>
                </div>
                <Button size="sm" onClick={() => setShowChallengeModal(true)}>
                  ➕ New Challenge
                </Button>
              </div>
            </Card>
          )}

          {/* Challenges List */}
          {circle.challenges && circle.challenges.length > 0 ? (
            <div className="space-y-3">
              {circle.challenges
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((challenge) => {
                  const startDate = new Date(challenge.startDate);
                  const endDate = new Date(challenge.endDate);
                  const now = new Date();
                  const isActive = now >= startDate && now <= endDate;
                  const isUpcoming = now < startDate;
                  const isEnded = now > endDate;
                  const userParticipant = challenge.participants.find(p => p.userId === user?.id);
                  const isJoined = !!userParticipant;

                  return (
                    <Card 
                      key={challenge._id} 
                      className={cn(
                        "p-4",
                        isActive && "border-l-4 border-l-green-500 dark:border-l-green-400"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {challenge.title}
                            </h3>
                            {isActive && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                Active
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                Upcoming
                              </span>
                            )}
                            {isEnded && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-full">
                                Ended
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {challenge.description && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                              {challenge.description}
                            </p>
                          )}

                          {/* Challenge Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">Type:</span>
                              <span className="font-medium text-gray-900 dark:text-white capitalize">{challenge.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">Target:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{challenge.target}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">Reward:</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">{challenge.pointsReward} pts</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">Participants:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{challenge.participants.length}</span>
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
                          </div>

                          {/* User Progress */}
                          {isJoined && userParticipant && (
                            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">Your Progress:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {userParticipant.progress} / {challenge.target}
                                  {userParticipant.completed && ' ✓'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {/* Join Button - Allow joining active or upcoming challenges, including admins */}
                          {!isJoined && !isEnded && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await communityService.joinChallenge(circleId, challenge._id);
                                  refreshCircle();
                                } catch (error) {
                                  console.error('Failed to join challenge:', error);
                                  alert('Failed to join challenge');
                                }
                              }}
                              variant={isUpcoming ? 'outline' : 'primary'}
                            >
                              {isUpcoming ? 'Pre-Join' : 'Join'}
                            </Button>
                          )}

                          {/* Admin Actions */}
                          {circle.userIsAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingChallenge(challenge);
                                  setShowChallengeModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Edit challenge"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setShowDeleteChallengeConfirm(challenge._id)}
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Delete challenge"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card className="p-6">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No challenges yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {circle.userIsAdmin ? 'Create the first challenge to engage members!' : 'Check back later for new challenges'}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Announcements Tab - Only for members */}
      {isMember && activeTab === 'announcements' && (
        <div className="space-y-4">
          {/* Admin Create Announcement Button */}
          {circle.userIsAdmin && (
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create Announcement</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Share important updates with members</p>
                </div>
                <Button size="sm" onClick={() => setShowAnnouncementModal(true)}>
                  ➕ New Announcement
                </Button>
              </div>
            </Card>
          )}

          {/* Announcements List */}
          {circle.announcements && circle.announcements.length > 0 ? (
            <div className="space-y-3">
              {circle.announcements
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((announcement) => {
                  const createdBy = typeof announcement.createdBy === 'object' 
                    ? announcement.createdBy.name 
                    : 'Unknown';
                  const createdAt = new Date(announcement.createdAt);
                  const isRecent = Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000; // Less than 24 hours

                  return (
                    <Card 
                      key={announcement._id} 
                      className={cn(
                        "p-4",
                        announcement.isImportant && "border-l-4 border-l-orange-500 dark:border-l-orange-400"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            {announcement.isImportant && (
                              <span className="text-orange-500 dark:text-orange-400 text-lg">⚠️</span>
                            )}
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {announcement.title}
                            </h3>
                            {isRecent && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                New
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap mb-3">
                            {announcement.content}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Posted by {createdBy}</span>
                            <span>•</span>
                            <span>{createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        {circle.userIsAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingAnnouncement(announcement);
                                setShowAnnouncementModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Edit announcement"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteAnnouncementConfirm(announcement._id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Delete announcement"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card className="p-6">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <span className="text-3xl">📢</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No announcements yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {circle.userIsAdmin ? 'Post the first announcement to keep members informed!' : 'Check back later for updates'}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Members Tab - Only for members */}
      {isMember && activeTab === 'members' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Circle Members ({circle.memberCount}/{circle.maxMembers})
            </h3>
            
            <div className="space-y-3">
              {circle.members && circle.members.length > 0 ? (
                circle.members.map((member: any) => {
                  const memberId = typeof member.userId === 'object' ? member.userId._id : member.userId;
                  const memberName = typeof member.userId === 'object' ? member.userId.name : 'Unknown User';
                  const isCurrentUser = memberId === user?.id;
                  const isAdmin = member.role === 'admin';
                  const isModerator = member.role === 'moderator';

                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {memberName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {memberName}
                              {isCurrentUser && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(You)</span>
                              )}
                            </span>
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded">
                                <Crown className="h-3 w-3" />
                                Admin
                              </span>
                            )}
                            {isModerator && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                                <Shield className="h-3 w-3" />
                                Moderator
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {circle.userIsAdmin && !isCurrentUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRemovingMember({ id: memberId, name: memberName })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No members found
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Remove Member Modal */}
      {removingMember && (
        <RemoveMemberModal
          isOpen={true}
          onClose={() => setRemovingMember(null)}
          onConfirm={async (reason) => {
            await communityService.removeMember(circleId, removingMember.id, reason);
            setRemovingMember(null);
            await refreshCircle();
          }}
          memberName={removingMember.name}
          circleName={circle.name}
        />
      )}

      {/* Create/Edit Announcement Modal */}
      {showAnnouncementModal && (
        <CreateAnnouncementModal
          circleId={circleId}
          announcement={editingAnnouncement}
          onClose={() => {
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
          }}
          onSuccess={() => {
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
            refreshCircle();
          }}
        />
      )}

      {/* Create/Edit Challenge Modal */}
      {showChallengeModal && (
        <CreateChallengeModal
          circleId={circleId}
          challenge={editingChallenge}
          onClose={() => {
            setShowChallengeModal(false);
            setEditingChallenge(null);
          }}
          onSuccess={() => {
            setShowChallengeModal(false);
            setEditingChallenge(null);
            refreshCircle();
          }}
        />
      )}

      {/* Delete Circle Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteCircleConfirm}
        onClose={() => setShowDeleteCircleConfirm(false)}
        onConfirm={() => {
          setShowDeleteCircleConfirm(false);
          handleDeleteCircle();
        }}
        title="Delete Circle"
        message={`Are you sure you want to delete "${circle.name}"? This action cannot be undone and all members will be notified.`}
        confirmText="Delete Circle"
        variant="danger"
      />

      {/* Report Message Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!showReportMessageConfirm}
        onClose={() => setShowReportMessageConfirm(null)}
        onConfirm={() => {
          if (showReportMessageConfirm) {
            handleReportMessage(showReportMessageConfirm);
            setShowReportMessageConfirm(null);
          }
        }}
        title="Report Message"
        message="Report this message as inappropriate? Admins will be notified."
        confirmText="Report"
        variant="danger"
      />

      {/* Delete Announcement Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!showDeleteAnnouncementConfirm}
        onClose={() => setShowDeleteAnnouncementConfirm(null)}
        onConfirm={async () => {
          if (showDeleteAnnouncementConfirm) {
            try {
              await communityService.deleteAnnouncement(circleId, showDeleteAnnouncementConfirm);
              refreshCircle();
            } catch (error) {
              console.error('Failed to delete announcement:', error);
              alert('Failed to delete announcement');
            }
            setShowDeleteAnnouncementConfirm(null);
          }
        }}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Delete Challenge Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!showDeleteChallengeConfirm}
        onClose={() => setShowDeleteChallengeConfirm(null)}
        onConfirm={async () => {
          if (showDeleteChallengeConfirm) {
            try {
              await communityService.deleteChallenge(circleId, showDeleteChallengeConfirm);
              refreshCircle();
            } catch (error) {
              console.error('Failed to delete challenge:', error);
              alert('Failed to delete challenge');
            }
            setShowDeleteChallengeConfirm(null);
          }
        }}
        title="Delete Challenge"
        message="Are you sure you want to delete this challenge? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
