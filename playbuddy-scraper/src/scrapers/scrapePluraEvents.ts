import axios from "axios";
import { Event, SourceMetadata } from "../commonTypes.js";
import { fillInEndTime } from "../helpers/partifulDateUtils.js";
import TurndownService from 'turndown';

const apiUrl = "https://api.joinbloom.community/events?perPage=10000";

// We skip the params because it's self contained to the site in one json
export const scrapePluraEvents = async ({
  sourceMetadata,
}: {
  sourceMetadata: SourceMetadata;
}): Promise<Event[]> => {
  const response = await axios.get(apiUrl);
  const data = response.data;

  // Initialize Turndown service
  const turndownService = new TurndownService();

  // Convert HTML to Markdown

  const events: Event[] = data.hangouts
    .filter((event: any) => event.location?.city === "New York")
    .map((event: any) => {
      const descriptionsMarkdown = turndownService.turndown(event.details);

      return {
        original_id: `plura-${event.id}`,
        organizer: {
          name: event.organization?.name,
          url: event.organization?.referral?.url,
        },

        name: event.eventName,
        start_date: event.eventStartsAt,
        end_date: fillInEndTime(event.eventStartsAt, event.eventEndsAt),

        ticket_url: event.shareUrl,
        event_url: event.shareUrl,
        image_url: event.image.urls["600x300"], // Assuming we need the 600x300 size
        location:
          `${event.location.address1 || ""} ${event.location.address2 || ""}, ${event.location.city}, ${event.location.region} ${event.location.postalCode || ""}`.trim(),

        price: "", // Assuming the price can be blank
        description: descriptionsMarkdown,
        tags: [],
        source_ticketing_platform: "Plura",
        ...sourceMetadata,
      };
    });
  return events;
};