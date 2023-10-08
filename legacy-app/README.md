# Twitch Bot

This is a chat bot for personal purposes

## Dev

1. `pnpm install --frozen-lockfile`
2. Create `config.json` at root directory path with templates (format at bottom)
3. Create `.env.dev` with `CLIENT_ID`, `CLIENT_ACCESS_TOKEN`
4. `pnpm run dev`

## Prod

1. Create `config.json` at root directory path
2. Create .env file in project root and add environment variables `CLIENT_ID`, `CLIENT_ACCESS_TOKEN`
    1. You can get `CLIENT_ID` from: https://dev.twitch.tv/console/apps/
    2. You can get `CLIENT_ACCESS_TOKEN` via this link (put your CLIENT_ID, and change redirect_uri if you have server) - `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=<CLIENT_ID>&redirect_uri=http%3A%2F%2Flocalhost&scope=channel%3Aread%3Aredemptions`
3. Start app:
    - Npm: `pnpm run start:prod`
    - Windows: start `windows.bat`
    - UNIX: start `unix.sh`

## Rating template

To generate a template string file based on rating:

1. Create the file `rewardRatings/config.json` if it doesn't already exist
2. Add template in lodash syntax (https://lodash.com/docs/4.17.15#template):

```json
{
    "templates": {
        "<rewardId>": {
            "normal": {
                "template": "Top 10 chaters: <% _.forEach(users, function(user) { %>#${user.ratingOrder} ${user.displayName} <% }); %>",
                "maxUsers": 10
            },
            "reverse": {
                "template": "ANTI 3 users: <% _.forEach(users, function(user) { %>#${user.ratingOrder} ${user.displayName} <% }); %>",
                "maxUsers": 3
            }
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

## TODO:

-   Update templated strings on app start (for development and debug proposes)
-   Executable binary app
    -   https://www.npmjs.com/package/pkg
