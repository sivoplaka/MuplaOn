const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let categories = {};
let playlist = [];
let currentTrackIndex = 0; // Controla a música atual tocando

// Função para carregar as músicas
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
        console.error("Erro ao procurar as músicas:", error);
    }
}

// Função para exibir as músicas e álbuns
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
            trackElement.innerHTML = `<span>${track.title}</span> 
                                      <button class="add-to-playlist" onclick="addToPlaylist('${track.title}', '${track.url}')">+ Add</button>`;
            trackElement.onclick = () => playTrack(track.title, track.url); // Ao clicar no título da música, toca

            trackList.appendChild(trackElement);
        });

        albumSection.appendChild(trackList);
        musicList.appendChild(albumSection);
    }
}

// Função para alternar a exibição das músicas dentro de um álbum
function toggleAlbum(album) {
    const trackList = document.getElementById(`${album}-tracks`);
    trackList.style.display = trackList.style.display === "none" ? "block" : "none";
}

// Função para tocar uma música
function playTrack(title, url) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");

    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();

    document.title = title; // Alterar o título da página para o título da música

    // Se a música for da playlist, retorne o índice correto
    const trackIndex = playlist.findIndex(track => track.url === url);
    if (trackIndex !== -1) {
        currentTrackIndex = trackIndex;
    }

    // Configurar evento para tocar a próxima música
    audioPlayer.onended = () => {
        playNextTrack();
    };
}

// Função para tocar a próxima música
function playNextTrack() {
    const audioPlayer = document.getElementById("audio-player");

    if (currentTrackIndex < playlist.length - 1) {
        currentTrackIndex++;
        playTrack(playlist[currentTrackIndex].title, playlist[currentTrackIndex].url);
    } else {
        currentTrackIndex = 0; // Começa novamente do início
        playTrack(playlist[currentTrackIndex].title, playlist[currentTrackIndex].url);
    }
}

// Função para adicionar músicas à playlist
function addToPlaylist(title, url) {
    const track = { title, url };
    playlist.push(track);
    updatePlaylistDisplay();
}

// Função para atualizar a exibição da playlist
function updatePlaylistDisplay() {
    const playlistContainer = document.getElementById("playlist");
    playlistContainer.innerHTML = "";

    playlist.forEach(track => {
        const trackElement = document.createElement("div");
        trackElement.className = "playlist-track";
        trackElement.innerHTML = `
            <span>${track.title}</span>
            <button onclick="playTrack('${track.title}', '${track.url}')">▶️</button>
        `;
        playlistContainer.appendChild(trackElement);
    });
}

// Carrega as músicas ao iniciar a página
fetchMusic();
