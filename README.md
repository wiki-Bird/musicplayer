### music player

a simple/very lightweight web based music player

##

### setup

1. `yarn install` to install dependencies
2. Add music to the playlists folder. Any folder in `./playlists` will be treated as a playlist. Any file in the playlist folder will be treated as a song.
3. Run `node songSetup.js` to load playlists/songs stored in `./playlists`
4. Open `index.html` in a web browser, or host all files on a web server
  - I used a GitHub Repository + Cloudflare Pages to host my music player for free
5. Enjoy!

If you make any changes to the TypeScript, run `tsc` to compile any typescript changes

##

### known issues

- Switching playlists loses current song highlighting

##

### preview

![Screenshot](images/preview.png)
