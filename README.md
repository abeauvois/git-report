# git-report :rocket:

## Overview

This report is useful for automating `developpers activities reporting` based on `git commits`.

You can display it:

1. in your terminal

Or

2. send it to yourself via gmail.

## Todos

- [x] split/group each day by AM/ PM
- [ ] make it installable with command:

add `#!/usr/bin/env node` in gitreport first line

```bash
curl "https://raw.githubusercontent.com/abeauvois/git-report/master/gitreport" -o /usr/local/bin/gitreport && chmod +x /usr/local/bin/gitreport
```

curl -H "Accept: application/vnd.github.v3.raw" \
 -H "Authorization: token $github_personal_access_token" \
     "$file_url" 2> err.log > output.json

- [ ] add `fromDate` parameter
- [ ] add `defaultMessage` prameter when AM or PM empty (ie 'meeting')
- [ ] add `emailTo` parameter
- [ ] accept formatting options (ie "Day 5:" => "Thu 5, Nov 2020:")

## Install

```bash
cd YOUR_FOLDER
git clone https://github.com/abeauvois/git-report.git
yarn
```

Or

```bash
cd YOUR_FOLDER
git clone https://github.com/abeauvois/git-report.git
npm i
```

## How to create a CSV file with a line of headers (in /csv folder)

```bash
 > echo sha, contributor, date, message > ./csv/gitlog.csv
```

- Append the CSV file with git log output, filtered by your `git username`

```bash
 > git log --date=local --pretty=format:'%h, %an, %ad, "%s"' | egrep {YOUR GIT USERNAME} >> ./csv/gitlog.csv

```

## 1. For a report in the terminal's console:

```bash
yarn start console ./csv/real-world-git-log.csv -v

# use your own csv file (produced by the git log command above)
yarn start console ./csv/{your_csv_file} -v
```

**You should see the following result in the terminal:**

![git-report-result](git-report-result.png)

## 2. For a report sent by email to yourself (via gmail):

It requires some devOps skills if you want to use `gmail` to send this report by email with it.

### Create an .env file (same place as package.json)

First, as we're using `gmail`, we have to setup a Google cloud project and get some key informations

Follow these instructions: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

The article explains `Why using Oauth2 and Google Dev App`

> many solutions required to go into my account settings and Enable Less Secure Apps. That sounded way too scary for me, especially considering I had been saved by Google’s security measures on more than a few occasions.
> So I found more efficient setting up OAuth2 for a Google Developer application and connecting it to the Nodemailer module using SMTP.

```bash
API_KEY=
API_SECRET=
GMAIL_EMAIL=
GMAIL_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_REFRESH_TOKEN=
PROJECT_NUMBER=
```

## Send

```bash
yarn start gmail ./csv/real-world-git-log.csv -v
```
