'use client';

import { useState, useEffect } from 'react';
import { SupabaseActivitiesService } from '@/lib/supabase-service';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  editingActivity?: any;
}

const ACTIVITY_TYPES = [
  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️' },
  { value: 'dinner', label: 'Dinner', icon: '🍽️' },
  { value: 'golf', label: 'Golf', icon: '⛳' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'hiking', label: 'Hiking', icon: '🥾' },
  { value: 'event', label: 'Event', icon: '🎉' },
  { value: 'conference', label: 'Conference', icon: '🎤' },
  { value: 'meeting', label: 'Meeting', icon: '💼' },
  { value: 'phone_call', label: 'Phone Call', icon: '📞' },
  { value: 'video_call', label: 'Video Call', icon: '📹' },
  { value: 'other', label: 'Other', icon: '📝' }
];

export default function AddActivityModal({ isOpen, onClose, onActivityAdded, editingActivity }: AddActivityModalProps) {
  const [formData, setFormData] = useState({
    activityType: 'coffee',
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });
  const [participants, setParticipants] = useState<Array<{name: string, email: string, phone: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingActivity) {
      setFormData({
        activityType: editingActivity.activity_type,
        date: editingActivity.date,
        location: editingActivity.location || '',
        notes: editingActivity.notes || ''
      });
      
      // Convert participants from database format
      const participantList = editingActivity.activity_participants?.map((p: any) => ({
        name: p.participant_name,
        email: p.participant_email || '',
        phone: p.participant_phone || ''
      })) || [];
      setParticipants(participantList);
    } else {
      // Reset form for new activity
      setFormData({
        activityType: 'coffee',
        date: new Date().toISOString().split('T')[0],
        location: '',
        notes: ''
      });
      setParticipants([]);
    }
  }, [editingActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (participants.length === 0) {
      alert('Please add at least one participant.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (editingActivity) {
        // Update existing activity
        await SupabaseActivitiesService.updateActivity(editingActivity.id, {
          activityType: formData.activityType,
          title: `${ACTIVITY_TYPES.find(t => t.value === formData.activityType)?.label} with ${participants.length > 0 ? participants[0].name : 'someone'}`,
          description: '',
          date: formData.date,
          durationMinutes: null,
          location: formData.location,
          notes: formData.notes,
          participants: participants
        });
      } else {
        // Create new activity
        await SupabaseActivitiesService.addActivity({
          activityType: formData.activityType,
          title: `${ACTIVITY_TYPES.find(t => t.value === formData.activityType)?.label} with ${participants.length > 0 ? participants[0].name : 'someone'}`,
          description: '',
          date: formData.date,
          durationMinutes: null,
          location: formData.location,
          notes: formData.notes,
          participants: participants
        });
      }

      onActivityAdded();
      onClose();
      
      // Reset form
      setFormData({
        activityType: 'coffee',
        date: new Date().toISOString().split('T')[0],
        location: '',
        notes: ''
      });
      setParticipants([]);
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '', email: '', phone: '' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingActivity ? 'Edit Activity' : 'Quick Add Activity'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Participants - At the top */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Participants *
                </label>
                <button
                  type="button"
                  onClick={addParticipant}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  + Add Participant
                </button>
              </div>
              {participants.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Add at least one participant to get started
                </div>
              )}
              {participants.map((participant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={participant.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={participant.email}
                    onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={participant.phone}
                      onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="ml-2 text-red-600 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type *
              </label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Starbucks Downtown"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Any additional notes about this activity..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? (editingActivity ? 'Updating...' : 'Adding...') : (editingActivity ? 'Update Activity' : 'Add Activity')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
