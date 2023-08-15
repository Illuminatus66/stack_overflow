# Clone of Stack Overflow built for CI/CD SPA hosting services, offering serverless capacities

##Link - https://stack-illuminatus66.netlify.app/

## Development build

This project was initially developed on localhost by setting up an Express.js server 
and routes to accompany different actions that were executed on a MongoDB Atlas cluster.

The server listened to HTTP requests from Axios' intuitive, simple and fast API interface.
The endpoints obviously looked very different when Express.js was being used.
The connection to the database was simpler. The applcation of JWT middleware for 
authentication purposes was simpler, too.

Of course, SEO tradeoffs need to be taken into consideration but the nature of the
website is such that the question list needs to be requested after the skeleton of
the application loads. Maybe someone could try rendering an entire initial landing page on 
the server-side so headless browsers could crawl the home page.

If you want, you could try your hand at generating an initial HTML-only snapshot of
the current build while the Javascript loads ( I do not possess enough knowledge for that). 


## Hosting on separate platforms

If you want you could separately host the serverless functions on something like 
AWS Lambda, Azure, Vercel or ##Netlify, though some changes might need to be done
regarding the syntax based on the platform of your choice.

The front-end is a React SPA, so you can go crazy with that. I hosted it on Netlify 
to take advantage of their free-tier services.

If you do decide to host the React app and the functions separately, don't forget to 
allow CORS but I hosted them under one domain so that I don't have to worry about the 
request headers too much.

## Build command

The build command, as always, is "npm run build"

### Cold-start issues

Yes, I realise the application seems really slow when starting-up, I will try hosting it 
on AWS to compare the speed of the requests, I hear it is much better than it's competitors

### Cannot share links to questions

Due to the nomenclature of serverless functions, I still haven't been able to figure out 
a way to name the app urls in a manner such that, the relevant function could execute all
on it's own if someone simply pastes the URL of the question details page. If you would like
to help, please let me know.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://react.dev/learn).
