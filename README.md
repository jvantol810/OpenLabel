# Overview

Open Label is an open source chrome extension that acts as a Google News Feed reader. It will generate a label upon interacting with a given news article. Before you begin using and/or modifying the extension, there are a few topics to go over.

# Issues with the Plugin

There is a current technical issue with label displaing. The only functional label display method is hover labeling. These other labeling options, such as right clicking, do appear in the options menu but are not currently functional. Another issue is that, by default, the hover labeling will not work. You must go into the options menu of the extension and select the button "Reset to Default."

# Table Of Contents

- backend : Holds the files necessary for hosting the webserver, fetching, and accessing the database.
  contains:
- .env : Holds environmental variables for connecting to the database as well as the webserver port.
- backend.js : Opens the webserver and functionality for getting labels from it.
- dbService.js : Creates a connection to the database, and allows data to be returned from or added to the database.
- fetchNews.js : Has the functionality to fetch from news articles and perform analysis on the text, returning as a label in JSON.
- dist : The compiled file that can be loaded as an unpacked extension in chrome browsers.
  contains:
- build : Holds the compiled javascript components of the plugin
- manifest.json : Provides information about the plugin to the browser, as well as the permissions and components it has.
- options.html : The options page for the plugin.
- popup.html : The popup page that appears when clicking on the plugin icon.
- node_modules : Folder that holds all of the node modules required for the plugin.
- paper : Holds the LaTeX files for the research paper.
  contains:
- Images : The images used within the paper.
  contains:
- UMLSequenceDiagram.png : A sequence diagram that shows how everything communicates to provide the user with a label.
  UMLDiagrams : A folder for the Class Diagrams.
  contains:
- BackendClass.tex : Backend.js represented as a class diagram.
- ContentClass.tex : Content.js represented as a class diagram.
- DbServiceClass.tex : The DbService Class represented as a class diagram.
- EventPageClass.tex : EventPage.js represented as a class diagram.
- FetchNewsClass.tex : FetchNews.js represented as a class diagram.
- OptionsClass.tex : Options.js represented as a class diagram.
- IEEEtran.cls : A typeset that ensures the paper matches the IEEE standards.
- main.tex : The research paper as a whole.
- refs.bib : A bibliography file to keep track of references.
- UMLSequenceDiagram.tex : This file was an attempt to portray the sequence diagram with the tikz package.
- src : Every file that is compiled to create the plugin
  contains:
- content.js : The content page for the plugin, responsible for showing labels.
- eventPage.js : A service worker in the plugin, responsible for the context action menu.
- options.js: The script added to options.html in dist, responsible for saving and loading plugin options.
- .gitignore : Tells github to ignore certain folders when pushing to the repository.
- package-lock.json : Lists the module tree of modules used, and which versions they are.
- package.json : The npm modules required for the plugin, backend, and database.
- webpack.config.js : Used to compile into a plugin build.

# Installing Node.js

In order to work with node packages, you must install node.js! You can install node.js from this link: https://nodejs.org/en/download/. With node.js installed, you will be able to run commands through npm (Node Package Manager), such as "npm install" and "npm run build."

# The Manifest

All chrome extensions must have a manifest file to denote important metadata such as necessary permissions for the extension. This can be found in the dist folder as seen in the table of contents. Our current extension uses manifest version 3. For saving a user's settings, we need the chrome.storage permission. To add an option for right clicking labels to generate them (since not all users will want a label to be created on hover), we need the context menu permission as well. Important files, such as our background file or options page, are also defined in the manifest.

# Setting up the Database

The extension uses MySQL to hook up a SQL database where it can post new labels that are generated and check for preexisting labels. Currently, there is no server hosting the database, meaning you will have to host it yourself. This will require installation of the MySQL Workbench and Server.

# MySQL Installation

You can install a MySQL server and the MySQL Workbench (which will allow you to easily see the contents of the database) from [here](https://dev.mysql.com/downloads/windows/installer/8.0.html). When installing for the first time, you will set up a root account. It is important that you write down the password because you will need to use it before you can make any reconfigurations. For our purposes, the MySQL server is running on the version 8.0.27, and the connection uses TCP/IP on port 3306 and 33060, which should be the default. For the authentication method of the server, you must choose to "use Legacy Authentication Method (Retain MySQL 5.x Compatibility)". This is a requirement for using the node packages to connect to the database! You should also configure the server to be a windows service (The service name we have is "MySQL80"). With all of this set up, you can create a database on your local machine and connect to it similarly to hosting the web server.

# Database Creation

After the server is installed and running, you can open MySQL Workbench. You should create a MySQL connection by clicking the plus icon next to "MySQL Connections" on the main page. The hostname should be the localhost (127.0.0.1) and the port should be 3306. The username should be root, and the password is the root password if needed. Once the connection is created, you can click on it to open the database.
For testing purposes, you will need to choose or create a new schema, as this will be where the table is stored in MySQL. In this example, the schema is named "testdb" and a table will be created also named "testdb".
As of now the current table configuration can be setup with this statement:

CREATE TABLE testDB (
url varchar(256),
sentiment_score INT,
PRIMARY KEY (url)
);

Later on, more variables will need to be added to this, but the variable "url" must be the primary key.
If you are having trouble running query statements, you may need to run the line "Use testdb;" to switch over to the right database.

# Connecting to the Database

To host, you will first have to access the .env file inside of the backend folder.
Inside of the .env file, you will want to replace variables with these values:
PORT=3000 --the webserver port
USER=root
PASSWORD=(your root password)
DATABASE=(your database name)
DB_PORT=3306
HOST=localhost

Your .env file should not be updated and added to the git repository. Until an actual server is set up, information stored in the database will not be shared between each other.

# .env File

This file contains the environment variables for the server, and can be found in the backend folder. Assuming you are testing with a local database, you will likely want to keep the HOST to be localhost, but you can change the DB_PORT the server is running on in case you are using it for something else. The PORT variable is for the website port, not the server. The really important variables are USER, PASSWORD, and DATABASE. The USER and PASSWORD store your MySQL username and password, respectively. The DATABASE stores the name of your MySQL database.

# Installing Dependencies

The extension relies on several packages found in the package.json file. You should run the command "npm install" in the main folder of the extension ("\GoogleNewsTap").

# Building Plugin

As you update the plugin, you will need to rebuild it by running "npm run build" in the CLI. After you have an updated build, load the extension by going into to the page "chrome://extensions" in Google Chrome. Select the "load unpacked" option and select the folder "/dist." This will go off of your latest build and add it to chrome. You should see the Google News Tap in your extensions now.

# Booting up Backend

You can start up the backend by running the command "node backendCombined.js". You should see a log message in the terminal saying "Connected!" once you're connected.

# Testing Plugin

Once you have the plugin built, you can go to a Google News feed and perform a search (feel free to search anything that will result in interesting articles). You can then hover over the article link and a label will be generated to the side of it showing the card.

# Future Work

The idea of a static class to store label categories would be a good future goal because it creates more expandability and customizability. It also decouples the architecture further by isolating label categories to one class.

Having one method for label displaying instead of it being hardcoded into label creation events is another way of refactoring the code that will make it easier to change label displays later on (i.e. changing the display based on a label category).

Currently, backendCombined.js performs additional specific SQL queries that are redundant because of the use of the dbService class as well. These SQL queries could be removed or refined to not be redundant.
