import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import credentials from './credentials.json';

type GEvent = {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides: [{ method: 'popup' | 'email'; minutes: number }];
  };
  attendees: [{ email: string; comment: string }];
  sendUpdates: 'all' | 'externalOnly' | 'none';
};

const createGEvent = async (gEvent: GEvent) => {
  // create client that we can use to communicate with Google 
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [ // set the right scope
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  const calendar = google.calendar({ version: 'v3' });

  // We make a request to Google Calendar API.

  try {
    const res = await calendar.events.insert({
      calendarId: 'your calendar id',
      auth: client,
      requestBody: gEvent,
    });
    return res.data.htmlLink;
  } catch (error) {
    throw new Error(`Could not create event: ${(error as any).message}`);
  }
};