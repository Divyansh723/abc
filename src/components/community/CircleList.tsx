import React, { useState, useEffect } from 'react';
import { Users, Lock, Plus, Search } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { useCommunity } from '@/hooks/useCommunity';
import { CommunityCircle } from '@/types/community';
import { cn } from '@/utils/cn';

interface CircleListProps {
  onSelectCircle?: (circle: CommunityCircle) => void;
  onCreateCircle?: () => void;
  className?: string;
}

export const CircleList: React.FC<CircleListProps> = ({
  onSelectCircle,
  onCreateCircle,
  className
}) => {
  const { circles, loading, error, fetchCircles } = useCommunity();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCircles().catch(console.error);
  }, [fetchCircles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCircles(searchQuery);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search circles by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        {onCreateCircle && (
          <Button onClick={onCreateCircle} className="whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Create Circle
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Error loading circles</p>
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => fetchCircles()} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading circles...</p>
        </div>
      )}

      {/* Circles Grid */}
      {!loading && circles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => (
            <div
              key={circle._id}
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400 rounded-xl bg-white dark:bg-gray-800 shadow-md"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    {circle.isPrivate && (
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  {circle.userIsMember && (
                    <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-sm">
                      ✓ Joined
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {circle.name}
                </h3>

                {/* Description */}
                {circle.description ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {circle.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 italic min-h-[2.5rem]">
                    No description
                  </p>
                )}

                {/* Footer */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(3, circle.memberCount))].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-semibold text-white"
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {circle.memberCount} / {circle.maxMembers}
                      </span>
                    </div>
                    
                    {circle.availableSpots > 0 && !circle.userIsMember && (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-md">
                        {circle.availableSpots} spots
                      </span>
                    )}
                    {circle.availableSpots === 0 && !circle.userIsMember && (
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                        Full
                      </span>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  {circle.userIsMember ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full group-hover:bg-primary-600 group-hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('CircleList: Selecting circle:', circle);
                        console.log('CircleList: Circle ID:', circle._id);
                        onSelectCircle?.(circle);
                      }}
                    >
                      View Circle
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('CircleList: Selecting circle:', circle);
                        console.log('CircleList: Circle ID:', circle._id);
                        onSelectCircle?.(circle);
                      }}
                      disabled={circle.availableSpots === 0}
                    >
                      {circle.availableSpots === 0 ? 'Circle Full' : 'Join Circle'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && circles.length === 0 && (
        <Card className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-purple-50 dark:from-primary-900/10 dark:via-transparent dark:to-purple-900/10" />
          
          <div className="relative p-12 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 shadow-lg mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {searchQuery ? 'No circles found' : 'Start Your Community Journey'}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms or create a new circle'
                : 'Create a circle to connect with others, share progress, and stay motivated together!'}
            </p>
            
            {/* Features */}
            {!searchQuery && (
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
                  <div className="text-2xl mb-2">🤝</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Stay Accountable</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Build habits together</p>
                </div>
              </div>
            )}
            
            {/* Action Button */}
            {onCreateCircle && (
              <Button 
                onClick={onCreateCircle}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="w-5 h-5 mr-2" />
                {searchQuery ? 'Create New Circle' : 'Create Your First Circle'}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
