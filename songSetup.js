const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "playlists");

function listFoldersFiles(dirPath) {
  const playlists = {};

  const folders = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  folders.forEach((folder) => {
    const files = fs
      .readdirSync(path.join(dirPath, folder))
      .filter((file) => fs.statSync(path.join(dirPath, folder, file)).isFile())
      .map((file) => file);

    playlists[folder] = files;
  });

  return playlists;
}

if (!fs.existsSync(directoryPath)) {
  console.log("Error: Playlists directory does not exist!");
  return;
}

const playlistsData = listFoldersFiles(directoryPath);

if (Object.keys(playlistsData).length === 0)
  console.log("Warning: The playlists directory is empty!");

const jsContent = `const songMap = ${JSON.stringify(playlistsData, null, 2)};\n`;
fs.writeFileSync("songMap.js", jsContent, "utf-8");

console.log("Playlists JavaScript file created successfully!");
