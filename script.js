const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let artists = {};
let playlist = [];
let currentTrackIndex = 0;
let isPlayingFromPlaylist = false;

async function fetchMusic() {
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        artists = {};

        files.forEach(file => {
            if (file.name.endsWith(".mp3")) {
                const [artist, album, ...titleParts] = file.name.replace('.mp3', '').split(' - ');
                const title = titleParts.join(' - ');

                if (!artists[artist]) {
                    artists[artist] = [];
                }
                artists[artist].push({ album, title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` });
            }
        });

        displayMusic(artists);
    } catch (error) {
        console.error("Erro ao buscar músicas:", error);
    }
}

function displayMusic(artists) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";
    musicList.style.overflowY = "auto";
    musicList.style.maxHeight = "60vh";

    for (const artist in artists) {
        const artistSection = document.createElement("div");
        artistSection.className = "artist";

        const artistTitle = document.createElement("div");
        artistTitle.className = "album-title";
        artistTitle.textContent = artist;
        artistTitle.onclick = () => toggleArtist(artist);

        artistSection.appendChild(artistTitle);

        const trackList = document.createElement("div");
        trackList.className = "track-list";
        trackList.id = `${artist}-tracks`;

        artists[artist].forEach(track => {
            const trackElement = document.createElement("div");
            trackElement.className = "track";
            trackElement.innerHTML = `
                <span onclick="playTrack('${track.title}', '${track.url}', '${artist}')">${track.title} (${track.album})</span>
                <button class="add-to-playlist" onclick="addToPlaylist('${track.title}', '${track.url}', '${artist}')">+ Add</button>
            `;
            trackList.appendChild(trackElement);
        });

        artistSection.appendChild(trackList);
        musicList.appendChild(artistSection);
    }
}

function toggleArtist(artist) {
    const trackList = document.getElementById(`${artist}-tracks`);
    trackList.style.display = trackList.style.display === "none" ? "block" : "none";
}

function playTrack(title, url, artist) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");

    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();

    document.title = title;
    isPlayingFromPlaylist = false;

    const artistTracks = artists[artist].map(track => track.url);
    currentTrackIndex = artistTracks.indexOf(url);

    audioPlayer.onended = () => {
        playNextTrack(artist);
    };
}

function playNextTrack(artist) {
    const artistTracks = artists[artist].map(track => track.url);

    if (currentTrackIndex < artistTracks.length - 1) {
        currentTrackIndex++;
    } else {
        currentTrackIndex = 0; 
    }
    
    const nextTrack = artists[artist][currentTrackIndex];
    playTrack(nextTrack.title, nextTrack.url, artist);
}

function addToPlaylist(title, url, artist) {
    if (!playlist.some(track => track.url === url)) {
        playlist.push({ title, url, artist });
        updatePlaylistDisplay();
    }
}

function updatePlaylistDisplay() {
    const playlistContainer = document.getElementById("playlist");
    playlistContainer.innerHTML = "";
    playlistContainer.style.overflowY = "auto";
    playlistContainer.style.maxHeight = "200px";

    playlist.forEach((track, index) => {
        const trackElement = document.createElement("div");
        trackElement.className = "playlist-track";
        trackElement.innerHTML = `
            <span onclick="playFromPlaylist(${index})">${track.title} (${track.artist})</span>
            <button onclick="removeFromPlaylist(${index})">❌</button>
        `;
        playlistContainer.appendChild(trackElement);
    });
}

function playFromPlaylist(index) {
    isPlayingFromPlaylist = true;
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    playTrack(track.title, track.url, track.artist);

    document.getElementById("audio-player").onended = playNextInPlaylist;
}

function playNextInPlaylist() {
    if (playlist.length > 0) {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        const track = playlist[currentTrackIndex];
        playTrack(track.title, track.url, track.artist);
    }
}

function removeFromPlaylist(index) {
    playlist.splice(index, 1);
    updatePlaylistDisplay();
}

fetchMusic();
