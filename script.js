const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let categories = {};
let currentTrack = null;
let playlist = [];

async function fetchMusic() {
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        categories = {};

        files.forEach(file => {
            if (file.name.endsWith(".mp3")) {
                // Modificado para lidar com o formato "Artista - Álbum - Nome da música.mp3"
                const [artist, album, ...titleParts] = file.name.replace('.mp3', '').split(' - ');
                const title = titleParts.join(' - '); // Caso o título tenha " - " no meio

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

function displayMusic(categories) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";

    for (const album in categories) {
        const albumSection = document.createElement("div");
        albumSection.className = "category";
        
        // Título do álbum que, ao ser clicado, abre ou fecha as músicas
        const albumTitle = document.createElement("h2");
        albumTitle.textContent = album;
        albumTitle.className = "album-title";
        albumTitle.onclick = () => toggleAlbum(album); // Ação ao clicar no álbum
        
        albumSection.appendChild(albumTitle);

        const artistContainer = document.createElement("div");
        artistContainer.className = "artists-container";
        artistContainer.style.display = "none"; // Inicialmente invisível

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

function toggleAlbum(album) {
    const artistContainer = document.querySelector(`#${album}-container`);
    const albumTitle = document.querySelector(`h2:contains('${album}')`);
    
    if (artistContainer.style.display === "none") {
        artistContainer.style.display = "block";
    } else {
        artistContainer.style.display = "none";
    }
}

function playTrack(title, url) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");
    const trackTitle = document.getElementById("track-title");

    trackTitle.textContent = title; // Atualiza o título da música
    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();
    document.title = title; // Atualiza o título da página com o nome da música
}

function addToPlaylist(title, url) {
    const track = { title, url };
    playlist.push(track);
    updatePlaylistDisplay();
}

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

fetchMusic();
