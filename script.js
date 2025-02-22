const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let categories = {};
let currentTrack = null;
let playlist = [];
let originalTitle = document.title; // Guarda o título original da página

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
                    categories[album] = {};
                }
                if (!categories[album][artist]) {
                    categories[album][artist] = [];
                }
                categories[album][artist].push({ title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` });
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
        albumSection.className = "category";

        const albumTitle = document.createElement("h2");
        albumTitle.textContent = album;
        albumTitle.className = "album-title";
        albumTitle.onclick = () => toggleAlbum(album);

        albumSection.appendChild(albumTitle);

        const artistContainer = document.createElement("div");
        artistContainer.className = "artists-container";
        artistContainer.style.display = "none";

        for (const artist in categories[album]) {
            const artistSection = document.createElement("div");
            artistSection.innerHTML = `<h3>${artist}</h3>`;

            categories[album][artist].forEach(track => {
                const trackElement = document.createElement("div");
                trackElement.className = "track";
                trackElement.innerHTML = `
                    <span>${track.title}</span>
                    <button onclick="playTrack('${track.title}', '${track.url}')">▶️</button>
                    <button onclick="addToPlaylist('${track.title}', '${track.url}')">+ Playlist</button>
                `;
                artistSection.appendChild(trackElement);
            });
            artistContainer.appendChild(artistSection);
        }
        albumSection.appendChild(artistContainer);
        musicList.appendChild(albumSection);
    }
}

// Função para alternar a exibição das músicas dentro de um álbum
function toggleAlbum(album) {
    const artistContainer = document.querySelector(`#${album}-container`);
    const albumTitle = document.querySelector(`h2:contains('${album}')`);
    
    if (artistContainer.style.display === "none") {
        artistContainer.style.display = "block";
    } else {
        artistContainer.style.display = "none";
    }
}

// Função para tocar uma música
function playTrack(title, url) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");
    const trackTitle = document.getElementById("track-title");

    trackTitle.textContent = title; 
    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();
    document.title = title; 

    currentTrack = { title, url }; 
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

// Restaura o título quando não há música tocando
function checkIfNoTrackPlaying() {
    if (!currentTrack) {
        document.title = originalTitle;
    }
}

// Adiciona evento para restaurar título após música terminar
const audioPlayer = document.getElementById("audio-player-audio");
audioPlayer.addEventListener("ended", checkIfNoTrackPlaying);

// Carrega as músicas ao iniciar a página
fetchMusic();
