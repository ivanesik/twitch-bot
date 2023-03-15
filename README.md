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

To generate a template string file based on rating:

1. Сreate the file `rewardRatings/config.json` if it doesn't already exist
2. Add template in lodash syntax (https://lodash.com/docs/4.17.15#template):

```json
{
    "templates": {
        "<rewardId>": {
            "template": "Top 10 chaters: <% _.forEach(users, function(user) { %>#${user.ratingOrder} ${user.displayName} <% }); %>",
            "maxUsers": 10
        }
    }
}
```

## Oposite rewards

To configure the behavior when one reward lowers the rating of a user in another reward (or the same), you need to:

1. Сreate the file `rewardRatings/config.json` if it doesn't already exist
2. Add oposite rewards identifier

```json
{
    "opositeRewards": [
        {
            "targetRewardId": "d8ce697a-9c06-457a-b0e4-974849153562",
            "opositeRewardId": "9f6af828-9337-4733-97da-1576f5f9e5f1"
        }
    ]
}
```
