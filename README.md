# git-report :rocket:

## Create an .env file (same place as package.json)

following these instructions: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

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

## Create a CSV file with a line of headers (in /csv folder)

```bash
 > echo sha, contributor, date, message > ./csv/gitlog.csv
```

## Append the CSV file with git log, filtered by your `git username`

```bash
 > git log --date=local --pretty=format:'%h, %an, %ad, "%s"' | egrep {YOUR GIT USERNAME} >> ./csv/gitlog.csv

```

## Execute the nodeJS script

```bash
> yarn start OR npm start
```

## YOu should see the following result in the terminal and receive an email

![git-report-result](git-report-result.png)
