'use client';

import React from 'react';
import { createEventAction } from '@/lib/actions/events';
import EventForm from '@/components/admin/EventForm';

import { NewEventModel } from '@/lib/types';

export default function NewEventPage() {
  const handleCreate = async (data: Omit<NewEventModel, 'displayOrder'>) => {
    return createEventAction(data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Create New Event</h2>
        <p className="text-gray-500 text-sm mt-1">Publish a brand new event panel onto the club registry.</p>
      </div>

      <EventForm onSubmit={handleCreate} submitLabel="Create Event" />
    </div>
  );
}
