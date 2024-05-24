---

meta: 
    - property: og:url
      content: Page description text

link:
    - href: https://docs.chartbrew.com
      rel: canonical

---

# Chartbrew Docs

## Prerequisites

**NodeJS** v20+ <i>(use only even versions)</i>

**NPM**

**MySQL** (v5+) or **PostgreSQL** (12.5+)

## Getting Started

### Installation & Setup

::: tip
The setup doesn't work in Windows PowerShell or cmd.exe. If you're using Windows, please use a bash command line like [Git Bash](https://git-scm.com/downloads) or [cygwin](https://www.cygwin.com/install.html)
:::

#### Create a Chartbrew database

Chartbrew works with both MySQL and PostgreSQL. You can use any of the two, but you need to create a database first.

[Follow the instruction here >>](/database/#mysql)

#### Get and setup the project

```sh
git clone https://github.com/chartbrew/chartbrew.git
cd chartbrew && npm run setup
```

### Set up the environmental variables

All the environmental variables that need to be set are found in the `.env-template` file in the root folder of the project. If you ran the setup above, you should already have a `.env` file there as well. If not, copy the template file and rename it `.env`.

Make sure you fill out the `production` and `development` sections accordingly.

[See the full list of variables here](/#environmental-variables)


### Run the project locally

Open two terminals, one for front-end and the other for back-end.

```sh
# frontend
cd client/
npm run start

# backend
cd server/
npm run start-dev
```

### Changing the docs

Chartbrew uses [Vuepress](https://vuepress.vuejs.org/) and you can check their documentation to see how it works. You can start the documentation development using the command below:

```sh
cd chartbrew
npm run docs:dev
```

## Tech stack

**Backend**

* [NodeJS](https://nodejs.org/en/)
* [ExpressJS](https://expressjs.com/)
* [Sequelize ORM](https://sequelize.org/)
* [Nodemailer](https://nodemailer.com/about/)
* [Mongoose](https://mongoosejs.com/) for mongoDB data sources

**Frontend**

* [ReactJS](https://reactjs.org/)
* [Redux](https://redux.js.org/)
* [NextUI](https://nextui.org/)
* [ChartJs](https://www.chartjs.org/)

**Docs**

* [Vuepress](https://vuepress.vuejs.org/)

## Environmental variables

The table below shows the `production` variables. The `development` variables have the same naming, but they are appended with `_DEV` (example: `CB_DB_NAME` -> `CB_DB_NAME_DEV`)

| Variable      | Default value | Description  |
| ------------- |:-------------:| ------------ |
| CB_DB_NAME <br /><br /> `required` | `chartbrew` | The name of the database |
| CB_DB_USERNAME <br /><br /> `required` | No default | The username of the user that has access to the database |
| CB_DB_PASSWORD | No default | The password associated with the database user |
| CB_DB_HOST <br /><br /> `required` | `localhost` | The host address where the database is located |
| CB_DB_PORT | `3306` | The port of the hosting address |
| CB_DB_DIALECT <br /><br /> `required` | `mysql` | Which database to use between `mysql` and `postgres` |
| CB_DB_CERT | No default | If your DB requires an SSL connection, use this variable to provide the string value of the certificate |
| CB_ENCRYPTION_KEY <br /><br /> `required` | A key will be generate for you during the first run | A secure 32 bytes string which is used to encrypt the data in the database. [Click here](#generate-the-encryption-key) to see how you can generate a key. |
| CB_API_HOST <br /><br /> `required` | `localhost` | The address where the `server` app is running from. This variable is used internally by the `server` app. <br /> **This value is overwritten by the PORT variable (if set)**|
| CB_API_PORT <br /><br /> `required` | `4019` | The port where the `server` app is running from. This variable is used internally by the `server` app |
| VITE_APP_CLIENT_HOST <br /><br /> `required` | `http://localhost:4018` | The full address where the `client` app is running from. This variable is used in the `client` app and it's populated during the building process.<br /><br />`Note` The app needs to be restarted/rebuilt when this value is changed. |
| VITE_APP_CLIENT_PORT <br /><br /> `required` | `4018` | The port where the `client` app is running from. This variable is used in the `client` app and it's populated during the building process.<br /><br />`Note` The app needs to be restarted/rebuilt when this value is changed. |
| VITE_APP_API_HOST <br /><br /> `required` | `http://localhost:4019` | The full address where the `server` app is running. This variable is used by the `client` app.<br /><br />`Note` The app needs to be restarted/rebuilt when this value is changed. |
| CB_MAIL_HOST | `smtp.gmail.com` | The server host of the email provider |
| CB_MAIL_USER | No default | The username used to log in on the email server |
| CB_MAIL_PASS | No deafult | The password used to log in on the email server |
| CB_MAIL_PORT | `465` | The port used to connect to the email server |
| CB_MAIL_SECURE | `true` | `true` - Use SSL to connect to the email server <br /><br />`false` - Use TLS to connect to the email server |
| CB_ADMIN_MAIL | `hello@example.com` | The email address used to send the emails from |
| CB_RESTRICT_TEAMS | `0` | `0` - New users will have their own team created on sign-up. <br /><br />`1` - New users don't have a team on signup and can't create their own. |
| CB_RESTRICT_SIGNUP | `0` | `0` - Anyone can create accounts from the signup page <br /><br />`1` - New users can only sign up using invite links |
| CB_GOOGLE_CLIENT_ID | No default | Google app Client ID generated from the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer noopener">Console</a> <br /><br />(Needed for Google integrations) |
| CB_GOOGLE_CLIENT_SECRET | No default | Google app Client Secret generated from the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer noopener">Console</a> <br /><br />(Needed for Google integrations) |
| CB_BACKEND_WORKERS | `4` | Some background tasks in Chartbrew will use workers to spread work on multiple threads. Still testing, but for best performance, set this to the number of threads your CPU has |

### Generate the encryption key

You will need a 32 bytes AES encryption key for the `CB_ENCRYPTION_KEY` variable. Chartbrew generates both `CB_ENCRYPTION_KEY` and `CB_ENCRYPTION_KEY_DEV` for you during the first run, but if yu wish to have control over the value, you can generate it yourself.

Run the following command to generate a valid key:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```