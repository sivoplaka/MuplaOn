const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;

let categories = {};
let playlist = [];
let currentTrackIndex = 0;
let isPlaylistMode = false;

// Carregar músicas
async function fetchMusic() {
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        categories = {};

        files.forEach(file => {
            if (file.name.endsWith(".mp3")) {
                const [artist, album, ...titleParts] = file.name.replace('.mp3', '').split(' - ');
                const title = titleParts.join(' - ');

                if (!categories[artist]) {
                    categories[artist] = [];
                }
                categories[artist].push({ album, title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` });
            }
        });

        displayMusic(categories);
    } catch (error) {
        console.error("Erro ao buscar músicas:", error);
    }
}

// Exibir músicas agrupadas por artista
function displayMusic(categories) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";

    for (const artist in categories) {
        const artistSection = document.createElement("div");
        artistSection.className = "album";

        const artistTitle = document.createElement("div");
        artistTitle.className = "album-title";
        artistTitle.textContent = artist;
        artistTitle.onclick = () => toggleArtist(artist);

        artistSection.appendChild(artistTitle);

        const trackList = document.createElement("div");
        trackList.className = "track-list";
        trackList.id = `${artist}-tracks`;

        categories[artist].forEach(track => {
            const trackElement = document.createElement("div");
            trackElement.className = "track";
            trackElement.innerHTML = `
                <span onclick="playTrack('${track.title}', '${track.url}', '${artist}')">${track.title}</span>
                <button class="add-to-playlist" onclick="addToPlaylist('${track.title}', '${track.url}', '${artist}')">+ Add</button>
            `;
            trackList.appendChild(trackElement);
        });

        artistSection.appendChild(trackList);
        musicList.appendChild(artistSection);
    }
}

// Alternar visibilidade do artista
function toggleArtist(artist) {
    const trackList = document.getElementById(`${artist}-tracks`);
    trackList.style.display = trackList.style.display === "none" ? "block" : "none";
}

// Tocar música
function playTrack(title, url, artist) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");

    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();

    document.title = title;
    isPlaylistMode = false;

    // Definir ordem de reprodução correta dentro do artista
    const artistTracks = categories[artist].map(track => track.url);
    currentTrackIndex = artistTracks.indexOf(url);

    audioPlayer.onended = () => {
        playNextTrack(artist);
    };
}

// Tocar próxima música dentro do mesmo artista
function playNextTrack(artist) {
    const artistTracks = categories[artist].map(track => track.url);

    if (currentTrackIndex < artistTracks.length - 1) {
        currentTrackIndex++;
        const nextTrack = categories[artist][currentTrackIndex];
        playTrack(nextTrack.title, nextTrack.url, artist);
    } else {
        currentTrackIndex = 0; // Reinicia o loop do artista
        const nextTrack = categories[artist][currentTrackIndex];
        playTrack(nextTrack.title, nextTrack.url, artist);
    }
}

// Adicionar música à playlist sem tocar imediatamente
function addToPlaylist(title, url, artist) {
    if (!playlist.some(track => track.url === url)) {
        playlist.push({ title, url, artist });
        updatePlaylistDisplay();
    }
}

// Atualizar exibição da playlist com scroll
function updatePlaylistDisplay() {
    const playlistContainer = document.getElementById("playlist");
    playlistContainer.innerHTML = "";

    playlist.forEach((track, index) => {
        const trackElement = document.createElement("div");
        trackElement.className = "playlist-track";
        trackElement.innerHTML = `
            <span onclick="playPlaylistTrack(${index})">${track.title}</span>
            <button onclick="removeFromPlaylist(${index})">❌</button>
        `;
        playlistContainer.appendChild(trackElement);
    });

    document.getElementById("playlist-container").style.maxHeight = "200px";
    document.getElementById("playlist-container").style.overflowY = "auto";
}

// Remover música da playlist
function removeFromPlaylist(index) {
    playlist.splice(index, 1);
    updatePlaylistDisplay();
}

// Tocar música da playlist
function playPlaylistTrack(index) {
    currentTrackIndex = index;
    isPlaylistMode = true;
    playFromPlaylist();
}

// Tocar a próxima música na playlist
function playFromPlaylist() {
    if (playlist.length === 0) return;

    const { title, url, artist } = playlist[currentTrackIndex];
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");

    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();
    document.title = title;

    audioPlayer.onended = () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        playFromPlaylist();
    };
}

// Carregar músicas ao iniciar
fetchMusic();
