![MasterHead](https://www.designbolts.com/wp-content/uploads/2014/06/love-twitter-header-background.png)

<h1 align="center">Matcha 💻💕</h1>
<p align="center"> In this collaborative project, we delved into the realm of advanced web application development by harnessing the power of micro-frameworks. Our collective task involved crafting a dating site in a language of our choosing, placing a strong emphasis on user interactions as the project's focal point. This dynamic dating website enables users to create personalized profiles, explore other user profiles, express interest through likes, and initiate conversations through a chat feature when mutual interest is reciprocated.</p>

## 🛠️ Tech Stacks
- Back end technologies🖥️
   - JavaScript
   - node.js
      - npm v6.13.4 : https://www.npmjs.com/get-npm
      - Node v12.16.1 : https://nodejs.org/en/download/

- Front-end technologies🌐
    - bootstrap
    - HTML
    - CSS

- libraries/modules/dependencies📚
    - express-session

- Database management systems📊
    - mysql
    - phpmyadmin
    - MAMP : https://bitnami.com/stack/mamp
 
 ## ▶️ How to run the program

- run node entry to start the server
- navigate to localhost:3000 in your browser to open the website

## 🧩 Code Breakdown

- App folder structure
- views
  - layouts 
    - main.handlebars | This is where the overall structure of all of the views is defined including html tags, bootstrap configuration and any javascript files.
- partials
  - head.handlebars
    - nav.handlebars | This contains the structure of the nav bar which is consistent throughout application.
- routes | Handles the back end functionality and the rendering of views
  -  login.js | Handles user login by cross checking a users email and password.
  - signup.js | Handles user signup by taking 
