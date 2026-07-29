import { initBotId } from 'botid/client/core';

// Public, unauthenticated POST endpoints that write to Firestore or send mail.
// A path listed here MUST also call checkBotId() server-side, and a route that
// calls checkBotId() MUST be listed here — the client is what attaches the
// classification headers, so a missing entry makes the server check fail closed
// and reject real users.
initBotId({
  protect: [
    { path: '/api/newsletter', method: 'POST' },
    { path: '/api/rsvp', method: 'POST' },
    { path: '/api/access-request', method: 'POST' },
    { path: '/api/call-for-speakers', method: 'POST' },
    { path: '/api/coworking-space/ping-admin', method: 'POST' },
  ],
});
