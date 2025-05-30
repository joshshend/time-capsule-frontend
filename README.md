**Digital Time Capsule**

A full-stack web app to write messages to your future self.
Sign in with user authentication, set a time and date, and write your message!

**Live Site:** [https://digitaltimecapsule.net](https://digitaltimecapsule.net)

**Features**
- Save messages with future unlock dates (down to the minute)
- Confetti, animations, dark mode toggle 
- Search, sort, and delete messages
- User accounts with JWT auth
- MongoDB database for full persistence

🛠️ **Tech Stack**
- Frontend: HTML, CSS, JS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT
- Hosting: GitHub Pages + Render

**Structure**
/client → Frontend
/server → Backend (Express)
/models → MongoDB Schemas

**Create .env in /server:**
- MONGO_URI=your_mongo_uri
- JWT_SECRET=your_secret

**Start the server (TERMINAL):**
- node index.js
- Open /client/index.html in browser.

**Contribute**
- PRs welcome! Open issues for bugs or suggestions.

**To-Do / Roadmap**
- Add mobile responsiveness
- Enable edit functionality for saved messages
- Add user profile page
- Export capsule as downloadable .txt

Made by Joshua Shen shenjoshua.com(coming)
