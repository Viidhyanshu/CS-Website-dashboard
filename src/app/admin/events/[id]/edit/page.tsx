'use client';

import React, { useEffect, useState } from 'react';
import { getEventByIdAction, updateEventAction } from '@/lib/actions/events';
import { NewEventModel, EventModel } from '@/lib/types';
import EventForm from '@/components/admin/EventForm';
import { useParams } from 'next/navigation';

export default function EditEventPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventModel | null>(null);

  useEffect(() => {
    if (id) {
      getEventByIdAction(id).then(data => {
        setEventData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleUpdate = async (data: Omit<NewEventModel, 'displayOrder'>) => {
    return updateEventAction(id, data);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading event data...</div>;
  if (!eventData) return <div className="text-center py-20 text-red-500">Event not found.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Edit Event</h2>
        <p className="text-gray-500 text-sm mt-1">Update existing details, date logs, or status for this event.</p>
      </div>

      <EventForm initialData={eventData} onSubmit={handleUpdate} submitLabel="Update Event" />
    </div>
  );
}
