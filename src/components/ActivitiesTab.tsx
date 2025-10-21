'use client';

import { useState, useEffect } from 'react';
import { SupabaseActivitiesService } from '@/lib/supabase-service';

interface ActivityParticipant {
  id: string;
  participant_name: string;
  participant_email?: string;
  participant_phone?: string;
  is_external: boolean;
  user_id?: string;
  user?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
}

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  date: string;
  duration_minutes?: number;
  location?: string;
  participants: any[];
  notes?: string;
  created_at: string;
  activity_participants: ActivityParticipant[];
}

interface ActivityStats {
  totalActivities: number;
  activitiesThisMonth: number;
  activitiesThisYear: number;
  activityTypes: Record<string, number>;
  totalDuration: number;
}

interface ActivitiesTabProps {
  userId: string;
  isOwnProfile?: boolean;
}

const ACTIVITY_TYPES = {
  coffee: { label: 'Coffee', icon: '☕', color: '#8B4513' },
  lunch: { label: 'Lunch', icon: '🍽️', color: '#FF6B6B' },
  dinner: { label: 'Dinner', icon: '🍽️', color: '#4ECDC4' },
  golf: { label: 'Golf', icon: '⛳', color: '#45B7D1' },
  tennis: { label: 'Tennis', icon: '🎾', color: '#96CEB4' },
  hiking: { label: 'Hiking', icon: '🥾', color: '#6C5CE7' },
  event: { label: 'Event', icon: '🎉', color: '#A29BFE' },
  conference: { label: 'Conference', icon: '🎤', color: '#FD79A8' },
  meeting: { label: 'Meeting', icon: '💼', color: '#FDCB6E' },
  phone_call: { label: 'Phone Call', icon: '📞', color: '#E17055' },
  video_call: { label: 'Video Call', icon: '📹', color: '#74B9FF' },
  other: { label: 'Other', icon: '📝', color: '#636E72' }
};

export default function ActivitiesTab({ userId, isOwnProfile = false }: ActivitiesTabProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const [activitiesData, statsData] = await Promise.all([
          SupabaseActivitiesService.getActivitiesByUserId(userId),
          SupabaseActivitiesService.getActivityStats(userId)
        ]);
        
        setActivities(activitiesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [userId]);

  const filteredActivities = selectedFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.activity_type === selectedFilter);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalActivities}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.activitiesThisMonth}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.activitiesThisYear}</div>
            <div className="text-sm text-gray-600">This Year</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalDuration > 0 ? formatDuration(stats.totalDuration) : '0m'}
            </div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </div>
      )}

      {/* Activity Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {Object.entries(ACTIVITY_TYPES).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === type
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedFilter === 'all' ? 'No activities yet' : `No ${ACTIVITY_TYPES[selectedFilter as keyof typeof ACTIVITY_TYPES]?.label.toLowerCase()} activities`}
            </h3>
            <p className="text-gray-500">
              {isOwnProfile 
                ? 'Start tracking your networking activities to build your professional network!'
                : 'This person hasn\'t shared any activities yet.'
              }
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const activityConfig = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES] || ACTIVITY_TYPES.other;
            
            return (
              <div key={activity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: activityConfig.color }}
                    >
                      {activityConfig.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activityConfig.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{formatDate(activity.date)}</div>
                    {activity.duration_minutes && (
                      <div className="text-sm text-gray-600">{formatDuration(activity.duration_minutes)}</div>
                    )}
                  </div>
                </div>

                {activity.description && (
                  <p className="text-gray-700 mb-4">{activity.description}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  {activity.location && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>

                {/* Participants */}
                {activity.activity_participants && activity.activity_participants.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Participants:</h4>
                    <div className="flex flex-wrap gap-2">
                      {activity.activity_participants.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1">
                          {participant.user?.profile_picture_url ? (
                            <img
                              src={participant.user.profile_picture_url}
                              alt={participant.participant_name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                              {participant.participant_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-700">{participant.participant_name}</span>
                          {participant.is_external && (
                            <span className="text-xs text-gray-500">(external)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activity.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                    <p className="text-sm text-gray-600">{activity.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
