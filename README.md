# Twitch Bot

This is a chat bot for personal purposes

## Steps

1. Create .env file in project root and add environment variables `CLIENT_ID`, `CLIENT_ACCESS_TOKEN`
2. `pnpm install --prod --frozen-lockfile`
3. Start app:

-   Npm: `pnpm run start`
-   Windows: start `windows.bat`
-   UNIX: start `unix.sh`

## Rating template

To generate file with templated rating info:

1. Create file `rewardRatings/templates.json`
2. Add template in lodash syntax (https://lodash.com/docs/4.17.15#template):

```json
{
    "<ratingId>": "Top 10 in chat: <% _.forEach(users, function(user, index) { %>#<%- index %> <%- user.displayName %> (<%- user.amount / 10 %>см), <% }); %>"
}
```
