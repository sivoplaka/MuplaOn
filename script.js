const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let categories = {};
let playlist = [];
let currentTrackIndex = 0;

// Função para carregar músicas
async function fetchMusic() {
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        categories = {};

        files.forEach(file => {
            if (file.name.endsWith(".mp3")) {
                const [artist, album, ...titleParts] = file.name.replace('.mp3', '').split(' - ');
                const title = titleParts.join(' - ');

                if (!categories[album]) {
                    categories[album] = [];
                }
                categories[album].push({ artist, title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` });
            }
        });

        displayMusic(categories);
    } catch (error) {
        console.error("Erro ao buscar músicas:", error);
    }
}

// Exibir álbuns e músicas
function displayMusic(categories) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";

    for (const album in categories) {
        const albumSection = document.createElement("div");
        albumSection.className = "album";

        const albumTitle = document.createElement("div");
        albumTitle.className = "album-title";
        albumTitle.textContent = album;
        albumTitle.onclick = () => toggleAlbum(album);

        albumSection.appendChild(albumTitle);

        const trackList = document.createElement("div");
        trackList.className = "track-list";
        trackList.id = `${album}-tracks`;

        categories[album].forEach(track => {
            const trackElement = document.createElement("div");
            trackElement.className = "track";
            trackElement.innerHTML = `
                <span onclick="playTrack('${track.title}', '${track.url}')">${track.title}</span>
                <button class="add-to-playlist" onclick="addToPlaylist('${track.title}', '${track.url}')">+ Add</button>
            `;
            trackList.appendChild(trackElement);
        });

        albumSection.appendChild(trackList);
        musicList.appendChild(albumSection);
    }
}

// Alternar exibição do álbum
function toggleAlbum(album) {
    const trackList = document.getElementById(`${album}-tracks`);
    trackList.style.display = trackList.style.display === "none" ? "block" : "none";
}

// Tocar música
function playTrack(title, url) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");

    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();

    document.title = title;

    // Se a música está na playlist, definir currentTrackIndex corretamente
    const trackIndex = playlist.findIndex(track => track.url === url);
    if (trackIndex !== -1) {
        currentTrackIndex = trackIndex;
    }

    audioPlayer.onended = () => {
        playNextTrack();
    };
}

// Tocar próxima música da playlist
function playNextTrack() {
    if (playlist.length === 0) return;

    if (currentTrackIndex < playlist.length - 1) {
        currentTrackIndex++;
    } else {
        currentTrackIndex = 0; // Recomeça do início
    }

    playTrack(playlist[currentTrackIndex].title, playlist[currentTrackIndex].url);
}

// Adicionar música à playlist sem tocar imediatamente
function addToPlaylist(title, url) {
    if (!playlist.some(track => track.url === url)) {
        playlist.push({ title, url });
        updatePlaylistDisplay();
    }
}

// Atualizar exibição da playlist
function updatePlaylistDisplay() {
    const playlistContainer = document.getElementById("playlist");
    playlistContainer.innerHTML = "";

    playlist.forEach((track, index) => {
        const trackElement = document.createElement("div");
        trackElement.className = "playlist-track";
        trackElement.innerHTML = `
            <span>${track.title}</span>
            <button onclick="playTrack('${track.title}', '${track.url}')">▶️</button>
            <button onclick="removeFromPlaylist(${index})">❌</button>
        `;
        playlistContainer.appendChild(trackElement);
    });
}

// Remover música da playlist
function removeFromPlaylist(index) {
    playlist.splice(index, 1);
    updatePlaylistDisplay();
}

// Carregar músicas ao iniciar
fetchMusic();
