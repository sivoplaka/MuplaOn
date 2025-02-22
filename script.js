const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let categories = {};
let viewMode = "album"; // Modo de exibição: 'album' ou 'artist'

// Função para carregar músicas
async function fetchMusic() {
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        categories = { albums: {}, artists: {} };

        files.forEach(file => {
            if (file.name.endsWith(".mp3")) {
                const [artist, album, ...titleParts] = file.name.replace('.mp3', '').split(' - ');
                const title = titleParts.join(' - ');
                const track = { artist, album, title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` };

                // Organizar por ÁLBUM
                if (!categories.albums[album]) {
                    categories.albums[album] = [];
                }
                categories.albums[album].push(track);

                // Organizar por ARTISTA
                if (!categories.artists[artist]) {
                    categories.artists[artist] = {};
                }
                if (!categories.artists[artist][album]) {
                    categories.artists[artist][album] = [];
                }
                categories.artists[artist][album].push(track);
            }
        });

        displayMusic();
    } catch (error) {
        console.error("Erro ao buscar músicas:", error);
    }
}

// Alternar modo de exibição
function changeView(mode) {
    viewMode = mode;
    displayMusic();
}

// Exibir músicas conforme o modo de exibição
function displayMusic() {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";

    if (viewMode === "album") {
        for (const album in categories.albums) {
            const section = createSection(album, categories.albums[album]);
            musicList.appendChild(section);
        }
    } else {
        for (const artist in categories.artists) {
            const artistSection = document.createElement("div");
            artistSection.className = "artist";

            const artistTitle = document.createElement("div");
            artistTitle.className = "section-title";
            artistTitle.textContent = artist;
            artistSection.appendChild(artistTitle);

            for (const album in categories.artists[artist]) {
                const section = createSection(album, categories.artists[artist][album]);
                artistSection.appendChild(section);
            }

            musicList.appendChild(artistSection);
        }
    }
}

// Criar seção de álbum/artista
function createSection(title, tracks) {
    const section = document.createElement("div");
    section.className = "album";

    const sectionTitle = document.createElement("div");
    sectionTitle.className = "section-title";
    sectionTitle.textContent = title;
    sectionTitle.onclick = () => toggleSection(title);

    section.appendChild(sectionTitle);

    const trackList = document.createElement("div");
    trackList.className = "track-list";
    trackList.id = `${title}-tracks`;

    tracks.forEach(track => {
        const trackElement = document.createElement("div");
        trackElement.className = "track";
        trackElement.innerHTML = `
            <span onclick="playTrack('${track.title}', '${track.url}')">${track.title}</span>
        `;
        trackList.appendChild(trackElement);
    });

    section.appendChild(trackList);
    return section;
}

// Alternar exibição da seção
function toggleSection(title) {
    const trackList = document.getElementById(`${title}-tracks`);
    trackList.style.display = trackList.style.display === "none" ? "block" : "none";
}

// Tocar música
function playTrack(title, url) {
    const audioPlayer = document.getElementById("audio-player");
    if (!audioPlayer) {
        const newAudio = document.createElement("audio");
        newAudio.id = "audio-player";
        newAudio.controls = true;
        newAudio.style.position = "fixed";
        newAudio.style.bottom = "0";
        newAudio.style.width = "100%";
        newAudio.style.backgroundColor = "#121212";
        newAudio.style.borderTop = "2px solid #1db954";

        const source = document.createElement("source");
        source.id = "audio-source";
        source.src = url;
        source.type = "audio/mp3";

        newAudio.appendChild(source);
        document.body.appendChild(newAudio);
        newAudio.load();
        newAudio.play();
    } else {
        const audioSource = document.getElementById("audio-source");
        audioSource.src = url;
        audioPlayer.load();
        audioPlayer.play();
    }

    document.title = title;
}

// Carregar músicas ao iniciar
fetchMusic();
