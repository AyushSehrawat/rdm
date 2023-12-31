# Real Debrid Manager

Manage your Real Debrid downloads and torrents with ease.

Aim of this project is to provide a simple interface to manage and search through your Real Debrid downloads and torrents.

> These screenshots may not be up to date with the current version of the app.

<img src="./assets/homepage.jpeg" width="23%"></img>
<img src="./assets/torrents.jpeg" width="23%"></img>
<img src="./assets/downloads.jpeg" width="23%"></img>
<img src="./assets/scraper.jpeg" width="23%"></img>
<img src="./assets/scraper-movie.jpeg" width="23%"></img>
<img src="./assets/scraper-series.jpeg" width="23%"></img>
<img src="./assets/scraper-series-torrent.jpeg" width="23%"></img>
<img src="./assets/scraper-list.jpeg" width="23%"></img>

https://github.com/AyushSehrawat/rdm/assets/69469790/e1317cfd-ffe2-4af5-b052-0e0ed73d2fe8

## Features

- View and search through all your downloads and torrents
- Reinsert torrents with option to select files
- Copy download links, delete, stream and get info on your downloads and torrents
- Bulk delete downloads and torrents & bulk unrestrict torrents
- Scraper to search for torrents and download links and add them to your Real Debrid.
- Add torrents through magnet links and torrent files (Not yet implemented)
- Look for dead download links and torrents and refresh them (Not yet implemented)
- And much more...

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file. Just rename the .env.example file to .env.

```
PUBLIC_BASE_URI="https://api.real-debrid.com/rest/1.0"
PUBLIC_BASE_AUTH_URI="https://api.real-debrid.com"
PUBLIC_CLIENT_ID="X245A4XAIBGVM"
PUBLIC_TORRENTIO_BASE_URI="https://torrentio.strem.fun"
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
