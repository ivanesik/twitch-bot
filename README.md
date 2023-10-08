## Features

-   Client rating template editing
    -   template with preview and cancel/save buttons
    -   syntax highlight
    -   template validation
-   dashboard page with ratings
    -   navigation by rewards
    -   editing rewards value of every users
    -   reward log
        -   User X update his rating
        -   User X by Y reward change reward V value of user U from N1 to N2
-   embeded iframe version of Rating/Log for OBS
    -   lazyload for pages and embeded iframes
-   rebuild rating template on start and update button from client
-   App status
    -   WebSocket connection
    -   twicth token expired date with alert and update button

## Minds

-   SteamLabs - https://cdn.streamlabs.com/chatbot/Documentation_Youtube.pdf
-   DB:
    -   https://supabase.com/
-   UI
    -   https://vtii.github.io/
    -   https://codepen.io/adrian-ortega/pen/YjqrMw
-   авторизация
    -   https://habr.com/ru/articles/728072/

### Flow

Start -> read all users for storage -> validate tokens and connect to twitch pub sub for valid ->
