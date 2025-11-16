import React, { useState } from 'react';
import { CircleList, CreateCircleModal, CircleDetails } from '@/components/community';
import { CommunityCircle } from '@/types/community';

export const CommunityPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<CommunityCircle | null>(null);

  // Debug logging
  React.useEffect(() => {
    if (selectedCircle) {
      console.log('CommunityPage: Selected circle:', selectedCircle);
      console.log('CommunityPage: Circle ID:', selectedCircle._id);
    }
  }, [selectedCircle]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Community Circles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with others and share your habit journey
        </p>
      </div>

      {/* Content */}
      {selectedCircle ? (
        <CircleDetails
          circleId={selectedCircle._id}
          onBack={() => setSelectedCircle(null)}
        />
      ) : (
        <CircleList
          onSelectCircle={setSelectedCircle}
          onCreateCircle={() => setShowCreateModal(true)}
        />
      )}

      <CreateCircleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default CommunityPage;
