# Stack Overflow Clone for CI/CD SPA Hosting Services with Serverless Capabilities

## [Link to Website](https://stack2-illuminatus66.netlify.app/)

### Development Build

This project began with the setup of an Express.js server on a local environment. It included routes to handle various actions executed on a MongoDB Atlas cluster.

The server processed HTTP requests using Axios, an intuitive and fast API interface. During the Express.js phase, the endpoints had a different appearance. Connecting to the database and applying JWT middleware for authentication was more straightforward.

While considering SEO trade-offs, it's worth noting that the application initially loads the skeleton of the page before fetching the question list. There's room for improvement, such as rendering an initial HTML-only snapshot on the server-side to improve crawlability by headless browsers.

If you're interested, you can explore techniques for generating an initial HTML-only snapshot while JavaScript loads, although I lack expertise in this area.

### Hosting on Separate Platforms

You have the option to host the serverless functions separately on platforms like AWS Lambda, Azure, Vercel, or Netlify. Keep in mind that some syntax adjustments may be necessary based on your chosen platform.

The front-end is a React SPA, offering ample flexibility. I opted to host it on Netlify to leverage their free-tier services.

In case you decide to host the React app and functions separately, remember to configure CORS settings. I, however, chose to host them under a single domain to simplify header management.

### Build Command

The build command remains the familiar "npm run build".

### Cold-Start Issues

I acknowledge that the application may appear slow during startup. I plan to host it on AWS to compare request speeds, as AWS is reputed for superior performance.

### Sharing Links to Questions

Due to the structure of serverless functions, I've encountered challenges in naming app URLs so that relevant functions can execute independently when someone pastes the URL of a question details page. If you have insights to offer on this matter, please reach out.
