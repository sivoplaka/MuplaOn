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
                const [artist, album, genre, title] = file.name.replace('.mp3', '').split(' - ');

                if (!categories[genre]) {
                    categories[genre] = {};
                }
                if (!categories[genre][artist]) {
                    categories[genre][artist] = {};
                }
                if (!categories[genre][artist][album]) {
                    categories[genre][artist][album] = [];
                }
                categories[genre][artist][album].push({ title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` });
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

    for (const genre in categories) {
        const genreSection = document.createElement("div");
        genreSection.className = "category";
        genreSection.innerHTML = `<h2>${genre}</h2>`;
        
        for (const artist in categories[genre]) {
            const artistSection = document.createElement("div");
            artistSection.innerHTML = `<h3>${artist}</h3>`;
            
            for (const album in categories[genre][artist]) {
                const albumSection = document.createElement("div");
                albumSection.innerHTML = `<h4>${album}</h4>`;
                
                categories[genre][artist][album].forEach(track => {
                    const trackElement = document.createElement("div");
                    trackElement.className = "track";
                    trackElement.innerHTML = `
                        <span>${track.title}</span>
                        <button onclick="playTrack('${track.title}', '${track.url}')">▶️</button>
                    `;
                    albumSection.appendChild(trackElement);
                });
                artistSection.appendChild(albumSection);
            }
            genreSection.appendChild(artistSection);
        }
        musicList.appendChild(genreSection);
    }
}

function playTrack(title, url) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");
    const trackTitle = document.getElementById("track-title");

    trackTitle.textContent = title; // Corrigindo o título da música
    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();
    document.title = title; // Atualiza o título da página com o nome da música
}

fetchMusic();
