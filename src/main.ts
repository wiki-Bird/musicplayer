// Global vars:
    // songMap: Map<string, string[]> - Map of playlists to songs in JSON format


    const playlistDiv = document.querySelector('.playlists');
    const songsDiv = document.querySelector('.songs');
    const songTitleDiv = document.querySelector('.songTitle');
    const playPauseButton = document.querySelector('.playPause');
    const skipNextButton = document.querySelector('.skipForward');
    const skipPrevButton = document.querySelector('.skipBack');
    const repeatButton = document.querySelector('.repeat');
    const shuffleButton = document.querySelector('.shuffle');
    const volumeButton = document.querySelector('.volume');
    const volumeSlider = document.querySelector('#volumeSlider');
    
    
    // let globalAudio: HTMLAudioElement | null = null;
    let globalAudio: HTMLAudioElement | null = document.getElementById('audioElementId') as HTMLAudioElement;
    
    let playing: boolean = false;
    let shuffle: boolean = false;
    let repeat: boolean = false;
    let currentSongIndex: number = -1;
    let currentPlaylist: string = '1';
    let songsPlayed: number[] = [];
    let songsPlayedPlaylist: string[] = [];
    let songsPlayedIndex: number = -1;
    
    // if a phone, hide the progress bar
    function isMobileUserAgent() {
      var userAgent = navigator.userAgent || navigator.vendor;
    
      // Check for iPhone, Android, and other mobile devices
      if (/iPhone/i.test(userAgent) || /Android/i.test(userAgent) || /webOS/i.test(userAgent) || /iPad/i.test(userAgent) || /iPod/i.test(userAgent) || /BlackBerry/i.test(userAgent) || /Windows Phone/i.test(userAgent)) {
        return true;
      }
      return false;
    }
    
    if (isMobileUserAgent()) {
      document.querySelector('.centreControls')!.classList.add('hidden');
      volumeSlider!.classList.add('hidden');
      volumeButton!.classList.add('hidden');
    }
    
    // Create a div for each playlist
    for (const playlist of Object.keys(songMap)) {
      const div = document.createElement('div');
      div.classList.add('playlist');
      div.innerHTML = playlist;
    
      // Add event listener to each playlist div
      div.addEventListener('click', () => {
        // fire the playlistOpen function with the playlist name
        playlistOpen(playlist);
        // set the active playlist
        document.querySelector('.playlist.active')?.classList.remove('active');
        div.classList.add('active');
      });
    
      playlistDiv!.appendChild(div);
    
      // Open the first playlist
      playlistOpen(Object.keys(songMap)[0]);
    }
    // get the first playlist div and set it to active
    const firstPlaylist = document.querySelector('.playlist');
    if (firstPlaylist) {
      firstPlaylist.classList.add('active');
    }
    
    function playlistOpen(playlist: string) {
      songsDiv!.innerHTML = '';
      const songs = songMap[playlist];
    
      // if nothing is playing we can set the current playlist as it wont fuck with skips.
      // we cant do this normally as it will break the skip function
      if (!globalAudio) {
        currentPlaylist = playlist;
      }
      else {
        // clear song history and set index to -1
        songsPlayed = [];
        songsPlayedPlaylist = [];
        songsPlayedIndex = -1;
      }
    
      // Create a div for each song
      for (const song of songs) {
        const div = document.createElement('div');
        div.classList.add('song');
        div.innerHTML = song;
    
        div.addEventListener('click', () => {
          // fire the playSong function with index of the song
          playSong(songs.indexOf(song), playlist );
        });
    
        songsDiv!.appendChild(div);
      }
    }
    
    function nextSong() {
      if (repeat) {
        globalAudio!.currentTime = 0;
        globalAudio!.play();
      }
      else if (shuffle) {
        shuffleChoose();
      }
      // if there is a next song
      else if (songMap[currentPlaylist].length > currentSongIndex + 1) {
        playSong(currentSongIndex + 1, currentPlaylist);
      }
      else {
        // no next song, do nothing
      }
    }
    
    function shuffleChoose() {
      let random = Math.floor(Math.random() * songMap[currentPlaylist].length);
    
      if (songMap[currentPlaylist].length <= 2) return random;
    
      // if the song is in the last 10 songs, and there are more than 20 songs, OR the song is the current song choose again
      while (
        (random > songMap[currentPlaylist].length - 10 && songMap[currentPlaylist].length > 20)
        || (random === currentSongIndex)
      ) {
        console.log('Choosing again')
        random = Math.floor(Math.random() * songMap[currentPlaylist].length);
      }
    
      playSong(random, currentPlaylist);
    }
    
    function prevSong() {
      // if repeat, or the first song, just restart the song
      if (repeat || (songsPlayed.length + songsPlayedIndex) <= 0) {
        globalAudio!.currentTime = 0;
        globalAudio!.play();
      }
      else {
        songsPlayedIndex -= 1;
        playSong(songsPlayed[songsPlayed.length + songsPlayedIndex], songsPlayedPlaylist[songsPlayedPlaylist.length + songsPlayedIndex], false);
      }
    }
    
    function initializeGlobalAudio() {
      if (!globalAudio) {
          globalAudio = new Audio();
    
          globalAudio.addEventListener('ended', () => {
              console.log('Song ended');
              songTitleDiv!.classList.add('dull');
              nextSong();
          });
    
          globalAudio.addEventListener('timeupdate', () => {
              const progress = document.querySelector('.progressBar') as HTMLElement;
              if (progress && globalAudio) {
                  progress.style.width = `${(globalAudio.currentTime / globalAudio.duration) * 100}%`;
              }
          });
      }
    }
    
    function playSong(index: number, playlist: string, history: boolean = true) {
      // get song from index
      const song = songMap[playlist][index];
    
      currentSongIndex = index;
      currentPlaylist = playlist;
    
      playing = false;
      initializeGlobalAudio();
      globalAudio!.src = `./playlists/${playlist}/${song}`;
      globalAudio!.controls = false; // Hide default controls
      globalAudio!.autoplay = true;
      playPause();
      songTitleDiv!.innerHTML = song;
      songTitleDiv!.classList.remove('dull');
    
      
      if (history) { 
        songsPlayed = [...songsPlayed, index];
        songsPlayedPlaylist = [...songsPlayedPlaylist, playlist];
        if (songsPlayedIndex < -1 ) {
          songsPlayedIndex += 1;
        }
      }
      console.log(`Playing ${song}`);
    
      // set activeSong class to the song div
      const activeSong = document.querySelector('.activeSong');
      if (activeSong) {
        activeSong.classList.remove('activeSong');
      }
      const songDiv = document.querySelectorAll('.song')[index];
      if (songDiv) {
        songDiv.classList.add('activeSong');
      }
    
      // check state of volume range and set audio volume.
      // this is needed as the volume doesnt update while songs aren't playing
      const volumeRange = document.querySelector('#volumeSlider') as HTMLInputElement;
      if (volumeRange) {
        globalAudio!.volume = parseFloat(volumeRange.value);
      }
    
      // Listen for pause/play events from the device itself
      if (globalAudio && playPauseButton) {
        globalAudio.addEventListener('play', () => {
          playing = true;
          playPauseButton!.innerHTML = '<img class="btnImg" src="./images/icons/pause_circle_FILL0_wght400_GRAD0_opsz24.svg" alt="Pause">';
        });
        globalAudio.addEventListener('pause', () => {
          playing = false;
          playPauseButton!.innerHTML = '<img class="btnImg" src="./images/icons/play_circle_FILL0_wght400_GRAD0_opsz24.svg" alt="Play">';
        });
    
        // set up media session which shows the song on lock screens etc
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: song,
            artist: playlist,
          });
          navigator.mediaSession.setActionHandler('play', () => {
            playPause();
          });
          navigator.mediaSession.setActionHandler('pause', () => {
            playPause();
          });
          navigator.mediaSession.setActionHandler('previoustrack', () => {
            prevSong();
          });
          navigator.mediaSession.setActionHandler('nexttrack', () => {
            nextSong();
          });
        }
      }
    }
    
    function playPause() {
      if (globalAudio) {
        if (playing) {
            globalAudio.pause();
            playing = false;
            playPauseButton!.innerHTML = '<img class="btnImg" src="./images/icons/play_circle_FILL0_wght400_GRAD0_opsz24.svg" alt="Play">';
        } else {
            globalAudio.play();
            playing = true;
            playPauseButton!.innerHTML = '<img class="btnImg" src="./images/icons/pause_circle_FILL0_wght400_GRAD0_opsz24.svg" alt="Pause">';
        }
      }
      else {
        if (shuffle) shuffleChoose();
        else playSong(0, currentPlaylist);
      }
    }
    
    if (playPauseButton) {
      playPauseButton.addEventListener('click', () => {
        playPause();
      });
    }
    if (skipNextButton) {
      skipNextButton.addEventListener('click', () => {
        nextSong();
      });
    }
    if (skipPrevButton) {
      skipPrevButton.addEventListener('click', () => {
        prevSong();
      });
    }
    if (repeatButton) {
      repeatButton.addEventListener('click', () => {
        repeat = !repeat;
        if (repeat) repeatButton!.innerHTML = '<img class="btnImg" src="./images/icons/repeat_on_FILL0_wght400_GRAD0_opsz24.svg" alt="Repeat">';
        else repeatButton!.innerHTML = '<img class="btnImg" src="./images/icons/repeat_FILL0_wght400_GRAD0_opsz24.svg" alt="Repeat">';
      });
    }
    if (shuffleButton) {
      shuffleButton.addEventListener('click', () => {
        shuffle = !shuffle;
        if (shuffle) shuffleButton!.innerHTML = '<img class="btnImg" src="./images/icons/shuffle_on_FILL0_wght400_GRAD0_opsz24.svg" alt="Repeat">';
        else shuffleButton!.innerHTML = '<img class="btnImg" src="./images/icons/shuffle_FILL0_wght400_GRAD0_opsz24.svg" alt="Repeat">';
      });
    }
    
    
    
    document.getElementById('progressContainer')!.addEventListener('click', function(e) {
      if (globalAudio && globalAudio.duration) {
          const progressWidth = this.clientWidth; // Width of the progress container
          const clickX = e.offsetX; // X position of the click inside the progress container
          const duration = globalAudio.duration;
    
          globalAudio.currentTime = (clickX / progressWidth) * duration;
      }
    });
    
    volumeButton!.addEventListener('click', () => {
      if (globalAudio) {
          if (globalAudio.volume > 0) {
              globalAudio.volume = 0; // Mute the audio
              // Update button image to indicate muted state
              volumeButton!.innerHTML = '<img class="btnImg" src="./images/icons/volume_off_FILL0_wght400_GRAD0_opsz24.svg" alt="Volume">';
          } else {
              globalAudio.volume = 1; // Max volume
              // Update button image to indicate volume on
              volumeButton!.innerHTML = '<img class="btnImg" src="./images/icons/volume_up_FILL0_wght400_GRAD0_opsz24.svg" alt="Volume">';
          }
          // remove the hidden class from the volume slider
          // volumeSlider!.classList.toggle('hidden');
      }
    });
    
    volumeSlider!.addEventListener('input', (event) => {
      if (globalAudio) {
          const input = event.target as HTMLInputElement; // Type assertion here
          const volume = parseFloat(input.value);
          globalAudio.volume = volume;
          // Optionally update the volume button icon based on volume level
      }
    });