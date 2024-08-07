import { Event, SourceMetadata } from '../types';
import scrapePartifulEvent from '../scrapers/scrapePartifulEvent';
import scrapeEventbriteAllOrganizerEventsFromEventPage from '../scrapers/eventbrite/scrapeEventbriteAllOrganizerEventsFromEventPage';

type ScrapersConfig = {
  [domain: string]: {
    scraper: (
      eventId: string,
      sourceMetadata: SourceMetadata,
    ) => Promise<Event[] | null>;
    eventRegex: RegExp;
    eventRegexIndex: number;
  };
};

const SCRAPERS: ScrapersConfig = {
  'partiful.com': {
    scraper: scrapePartifulEvent,
    eventRegex: /partiful\.com\/e\/([^\/?#]+)/,
    eventRegexIndex: 1,
  },
  'eventbrite.com': {
    scraper: scrapeEventbriteAllOrganizerEventsFromEventPage,
    eventRegex: /.*/,
    eventRegexIndex: 0,
  },
};

// Timeout function that returns a promise that rejects after a specified time
const timeout = (ms: number) =>
  new Promise<null>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });

const dedupeByLink = (arr: SourceMetadata[]): SourceMetadata[] => {
  const seen = new Set();
  return arr.filter((item) => {
    const duplicate = seen.has(item.url);
    seen.add(item.url);
    return !duplicate;
  });
};

export const scrapeURLs = async (links: SourceMetadata[]): Promise<Event[]> => {
  const events: Event[] = [];

  // Remove duplicate URLs
  const dedupedLinks = dedupeByLink(links);

  console.log({
    links,
    dedupedLinks,
  });

  // Process each link sequentially
  for (let i = 0; i < dedupedLinks.length; i++) {
    const sourceMetadata = dedupedLinks[i];
    const url = sourceMetadata.url;
    console.log(`[${i}/${dedupedLinks.length}] Processing URL: ${url}`);
    const domain = new URL(url).hostname.replace('www.', '');

    const scraperConfig = SCRAPERS[domain];

    if (!scraperConfig) {
      console.log(`No scraper available for domain: ${domain}`);
      continue;
    }

    const { scraper, eventRegex, eventRegexIndex } = scraperConfig;
    const match = url.match(eventRegex);

    if (match && match[eventRegexIndex]) {
      const eventId = match[eventRegexIndex];
      console.log(`Scraping ${domain} URL: ${url} with event ID: ${eventId}`);
      try {
        // Set a timeout of 30 seconds (30000 milliseconds)
        const eventsScraped = await Promise.race([
          scraper(eventId, sourceMetadata),
          timeout(15000),
        ]);

        if (eventsScraped) {
          events.push(...eventsScraped);
        }
      } catch (error: any) {
        if (error?.message === 'Timeout') {
          console.warn(`Scraping ${url} timed out.`);
        } else {
          console.error(`Error scraping ${url}:`, error);
        }
      }
    } else {
      console.log(`No event ID found for URL: ${url}`);
    }
  }

  console.log(`Scraped ${events.length} events`);

  return events;
};

export default scrapeURLs;
