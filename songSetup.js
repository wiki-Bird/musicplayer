const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'playlists');

function listFoldersFiles(dirPath) {
    const playlists = {};

    // Read directories (playlists)
    const folders = fs.readdirSync(dirPath, { withFileTypes: true })
                      .filter(dirent => dirent.isDirectory())
                      .map(dirent => dirent.name);

    folders.forEach(folder => {
        const files = fs.readdirSync(path.join(dirPath, folder))
                        .filter(file => fs.statSync(path.join(dirPath, folder, file)).isFile())
                        .map(file => file);

        // Assign files to the corresponding folder
        playlists[folder] = files;
    });

    return playlists;
}

const playlistsData = listFoldersFiles(directoryPath);

// Save to a JavaScript file
const jsContent = `const songMap = ${JSON.stringify(playlistsData, null, 2)};\n`;
fs.writeFileSync('songMap.js', jsContent, 'utf-8');

console.log('Playlists JavaScript file created successfully!');
