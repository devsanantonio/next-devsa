export default {
  providers: [
    {
      // IMPORTANT: Set SITE_URL in your Convex environment variables
      // For development: npx convex env set SITE_URL http://localhost:3000
      // For production: npx convex env set SITE_URL https://devsa.community
      domain: process.env.SITE_URL,
      applicationID: "convex",
    },
  ],
};
