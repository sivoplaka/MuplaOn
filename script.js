const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let artists = {};
let playlist = [];
let currentTrackIndex = 0;

// Função para carregar músicas
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
                artists[artist].push({ title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` });
            }
        });

        displayMusic(artists);
    } catch (error) {
        console.error("Erro ao buscar músicas:", error);
    }
}

// Exibir artistas e músicas
function displayMusic(artists) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";

    for (const artist in artists) {
        const artistSection = document.createElement("div");
        artistSection.className = "artist";

        const artistTitle = document.createElement("div");
        artistTitle.className = "artist-title";
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
                <span onclick="playTrack('${track.title}', '${track.url}', '${artist}')">${track.title}</span>
                <button class="add-to-playlist" onclick="addToPlaylist('${track.title}', '${track.url}', '${artist}')">+ Add</button>
            `;
            trackList.appendChild(trackElement);
        });

        artistSection.appendChild(trackList);
        musicList.appendChild(artistSection);
    }
}

// Alternar exibição do artista
function toggleArtist(artist) {
    const trackList = document.getElementById(`${artist}-tracks`);
    trackList.style.display = trackList.style.display === "none" ? "block" : "none";
}

// Tocar música e definir próximo da playlist
function playTrack(title, url, artist) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");

    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();

    document.title = title;

    // Atualizar o índice da música atual na playlist
    currentTrackIndex = playlist.findIndex(track => track.url === url);

    audioPlayer.onended = playNextInPlaylist;
}

// Tocar próxima música na playlist
function playNextInPlaylist() {
    if (playlist.length === 0) return;

    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    const nextTrack = playlist[currentTrackIndex];
    playTrack(nextTrack.title, nextTrack.url, nextTrack.artist);
}

// Adicionar música à playlist
function addToPlaylist(title, url, artist) {
    if (!playlist.some(track => track.url === url)) {
        playlist.push({ title, url, artist });
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
            <span onclick="playTrack('${track.title}', '${track.url}', '${track.artist}')">${track.title}</span>
            <button onclick="removeFromPlaylist(${index})">❌</button>
        `;
        playlistContainer.appendChild(trackElement);
    });

    // Garantir que o último item da playlist seja visível
    playlistContainer.scrollTop = playlistContainer.scrollHeight;
}

// Remover música da playlist
function removeFromPlaylist(index) {
    playlist.splice(index, 1);
    updatePlaylistDisplay();
}

// Carregar músicas ao iniciar
fetchMusic();
