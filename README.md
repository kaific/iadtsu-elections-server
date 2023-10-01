# Introduction
 
A RESTful API backend server for an online voting system used by IADT Students' Union's for official officer elections.

React.js frontend application can be found  in a separate repository [here](https://github.com/kaific/iadtsu-elections).

## Languages & Libraries
JavaScript, [Node.js](https://nodejs.org/), [Express.js](https://www.npmjs.com/package/express), [Mongoose](https://www.npmjs.com/package/mongoose) (MongoDB), [Nodemailer](https://www.npmjs.com/package/nodemailer), [Firebase Cloud Functions SDK](https://www.npmjs.com/package/firebase-functions)

## Background
A project originally put together out of necessity ahead of the 2021 IADTSU by-elections. Following a hasty implementation and initial launch, the backend and frontend went through small improvements based on user feedback.

The system facilitated 4 separate elections over a period of 2 years.

In years prior, the student body's votes were cast at in-person stations using paper ballots and student ID verification. The need for this application arose due to the second state-wide lockdown during the COVID-19 outbreak in Ireland. The students' union's officer elections were to occur within a fast-approaching timeframe specified by its constitution.

In lieu of a suitable, internal alternative, time constraints and a limited budget, a web application was developed as a side project by the Vice President for Welfare & Equality at the time (the owner of this repository).

# Setup
[Node.js](https://nodejs.org) v16 or higher is required to run the server.

To run locally:
  1. Start from the `/functions` directory.
  2. Create `/src/config/config.env` using the provided template file in the same directory.
  3. Edit `/src/index.js` by uncommenting lines 62-64, and commenting out line 66, like so:
     
     <img src="https://github.com/kaific/iadtsu-elections-server/assets/32389531/3667a454-4c3f-4b42-a316-945110e27d0f" width="50%"/>
     
  5. Using a chosen CLI, run the following commands in succession, from within the `./functions/` directory:
     ```console
     npm install
     ```
     ```console
     node index.js
     ```
