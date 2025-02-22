const repoOwner = "sivoplaka";
const repoName = "MuplaOn";
const musicFolder = "music";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${musicFolder}`;
let categories = {};
let playlist = [];
let currentTrackIndex = 0;
let originalTitle = document.title;

// Função para carregar músicas
async function fetchMusic() {
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        categories = {};

        files.forEach(file => {
            if (file.name.endsWith(".mp3")) {
                const fileName = file.name.replace('.mp3', '');
                console.log("Arquivo encontrado:", fileName); // Log do nome do arquivo
                
                const parts = fileName.split(' - ');

                let artist, album, title;

                if (parts.length === 2) {
                    // Caso seja no formato "Artista - Titulo"
                    artist = parts[0];
                    title = parts[1];
                    album = ""; // Não há álbum nesse caso
                } else if (parts.length >= 3) {
                    // Caso seja no formato "Artista - Album - Titulo"
                    artist = parts[0];
                    album = parts[1];
                    title = parts.slice(2).join(' - '); // Caso o título tenha " - "
                } else {
                    console.log("Formato não reconhecido:", fileName); // Log caso não encontre o formato esperado
                    return; // Ignora este arquivo se o formato for inesperado
                }

                console.log(`Artista: ${artist}, Álbum: ${album}, Título: ${title}`); // Log de depuração

                if (!categories[artist]) {
                    categories[artist] = [];
                }
                categories[artist].push({ artist, album, title, url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${musicFolder}/${file.name}` });
            }
        });

        displayMusic(categories);
    } catch (error) {
        console.error("Erro ao buscar músicas:", error);
    }
}

// Exibir artistas e músicas
function displayMusic(categories) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = "";

    for (const artist in categories) {
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

// Função para alternar exibição do artista
function toggleArtist(artist) {
    const trackList = document.getElementById(`${artist}-tracks`);
    const isHidden = trackList.style.display === "none";
    trackList.style.display = isHidden ? "block" : "none";

    // Garantir que, ao abrir a lista de faixas, o scroll esteja ativado corretamente
    if (!isHidden) {
        trackList.scrollTop = 0; // Rola para o topo quando a lista é aberta
    }
}


// Tocar música
async function playTrack(title, url, artist) {
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");

    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();

    // Atualiza o título da página enquanto a música toca
    document.title = `${artist} - ${title}`;

    // Obtém a imagem da capa embutida no MP3 (se houver)
    let albumArt = "default-cover.jpg"; // Imagem padrão caso não haja capa
    try {
        albumArt = await getAlbumArt(url) || albumArt;
    } catch (err) {
        console.warn("Não foi possível carregar a capa do álbum:", err);
    }

    // Atualiza a notificação de mídia nos navegadores compatíveis
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: album,
            artwork: [{ src: albumArt, sizes: "512x512", type: "image/jpeg" }]
        });
    }

    // Definir ordem de reprodução correta dentro do artista
    const artistTracks = categories[artist].map(track => track.url);
    currentTrackIndex = artistTracks.indexOf(url);

    audioPlayer.onended = () => {
        playNextTrack(artist);
    };

    // Voltar ao título original quando a música parar
    audioPlayer.onpause = () => {
        document.title = originalTitle;
    };
}

// Ajuste para garantir que as faixas de áudio com scroll sejam visíveis
function toggleArtist(artist) {
    const trackList = document.getElementById(`${artist}-tracks`);
    trackList.style.display = trackList.style.display === "none" ? "block" : "none";

    // Garantir que, ao abrir a lista de faixas, o scroll esteja ativado corretamente
    trackList.scrollTop = 0;
}

// Função para obter a capa do álbum embutida no MP3 (se houver)
async function getAlbumArt(url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const context = new AudioContext();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);

        if (audioBuffer) {
            const metadata = audioBuffer.metadata || {};
            if (metadata.picture && metadata.picture.length > 0) {
                return URL.createObjectURL(new Blob([metadata.picture[0].data], { type: metadata.picture[0].format }));
            }
        }
    } catch (error) {
        console.error("Erro ao obter a capa do álbum:", error);
    }
    return null;
}

// Tocar próxima música dentro do mesmo artista
function playNextTrack(artist) {
    const artistTracks = categories[artist].map(track => track.url);

    if (currentTrackIndex < artistTracks.length - 1) {
        currentTrackIndex++;
    } else {
        currentTrackIndex = 0; // Volta para a primeira música ao finalizar a última
    }

    const nextTrack = categories[artist][currentTrackIndex];
    playTrack(nextTrack.title, nextTrack.url, artist);
}

// Adicionar música à playlist sem tocar imediatamente
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
}

// Remover música da playlist
function removeFromPlaylist(index) {
    playlist.splice(index, 1);
    updatePlaylistDisplay();
}

// Carregar músicas ao iniciar
fetchMusic();
