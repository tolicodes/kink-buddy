import { Event } from '../types';

import { supabase } from './supabaseClient';

// Function to upsert an organizer and return its ID
async function upsertOrganizer(organizerName: string, organizerUrl: string): Promise<string> {
  const { data, error } = await supabase
    .from('organizers')
    // @ts-ignore
    .upsert(
      { name: organizerName, url: organizerUrl },
      { onConflict: ['name'] }
    )
    .select('id')
    .single();

  if (error) {
    console.error('Error upserting organizer:', error);
    throw error;
  }

  return data?.id ?? '';
}

// Function to upsert an event
async function upsertEvent(event: Event): Promise<void> {
  try {
    if (!event.organizer || !event.organizerUrl) {
      console.error('Event is missing organizer or organizerUrl:', event);
      return;
    }

    // Upsert Organizer and get its ID
    const organizerId: string = await upsertOrganizer(event.organizer, event.organizerUrl);
    if (!organizerId) { return }

    // Check for existing event by original_id or by start_date and organizer_id
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .or(
        `original_id.eq.${event.original_id},and(start_date.eq.${event.start_date},organizer_id.eq.${organizerId})`
      )
      .single();

    if (!existingEvent) {
      // Insert new event if it doesn't exist
      const { error: insertError } = await supabase.from('events').insert({
        original_id: event.id,
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        price: event.price,
        imageurl: event.imageUrl,
        organizer_id: organizerId,
        eventurl: event.eventUrl,
        summary: event.summary,
        tags: event.tags,
        min_ticket_price: event.min_ticket_price,
        max_ticket_price: event.max_ticket_price,
        url: event.url,
        timestamp_scraped: event.timestamp_scraped,
        source_origination_group_id: event.source_origination_group_id,
        source_origination_group_name: event.source_origination_group_name,
        source_origination_platform: event.source_origination_platform,
        source_ticketing_platform: event.source_ticketing_platform,
        dataset: event.dataset,
      });

      if (insertError) {
        console.error('Error inserting event:', insertError);
      } else {
        console.log(`Event ${event.name} inserted successfully.`);
      }
    } else {
      console.log(`Event ${event.name} already exists.`);
    }
  } catch (error) {
    console.error('Error upserting event:', error);
  }
}

export const writeEventsToDB = async (events: Event[]): Promise<void> => {
  for (const event of events) {
    await upsertEvent(event);
  }
}