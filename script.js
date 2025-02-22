const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let categories = {};
let currentTrack = null;

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
        albumSection.innerHTML = `<h2>${album}</h2>`;
        
        for (const artist in categories[album]) {
            const artistSection = document.createElement("div");
            artistSection.innerHTML = `<h3>${artist}</h3>`;
            
            categories[album][artist].forEach(track => {
                const trackElement = document.createElement("div");
                trackElement.className = "track";
                trackElement.innerHTML = `
                    <span>${track.title}</span>
                    <button onclick="playTrack('${track.title}', '${track.url}')">▶️</button>
                `;
                artistSection.appendChild(trackElement);
            });
            albumSection.appendChild(artistSection);
        }
        musicList.appendChild(albumSection);
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

fetchMusic();
