let allAlbums = [];
const albumGrid = document.getElementById('albumGrid');
const tracklistModal = new bootstrap.Modal(document.getElementById('tracklistModal'));
const modalTitle = document.getElementById('tracklistModalLabel');
const modalBody = document.getElementById('modalTracklist');
const trackStatsContainer = document.getElementById('trackStats');
const searchInput = document.getElementById('albumSearch');
const sortOptions = document.getElementById('sortOptions');
const sortButton = document.getElementById('sortButton');
const playOnSpotifyButton = document.getElementById('playOnSpotifyButton');
const backToTopBtn = document.getElementById('backToTopBtn');

function timeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0; 
}

function secondsToTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


function createAlbumCard(album) {
    const colDiv = document.createElement('div');
    colDiv.classList.add('col');
    colDiv.setAttribute('data-album-id', album.id);

    // Exercise 1: 
    // Exercise 7: 
    const cardHTML = `
        <div class="card h-100 shadow-sm">
            <div class="img-container">
                <img src="assets/img/${album.thumbnail}" class="card-img-top" alt="${album.album} cover">
                <div class="album-overlay">
                    ${album.album}
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${album.artist}</h5>
                <p class="card-text text-muted">${album.album}</p>
            </div>
            <div class="card-footer bg-light border-0 text-center">
                <button type="button" class="btn btn-sm btn-primary view-tracklist-btn" 
                    data-bs-toggle="modal"
                    data-bs-target="#tracklistModal"
                    data-album-id="${album.id}">
                    View Tracklist
                </button>
            </div>
        </div>
    `;

    colDiv.innerHTML = cardHTML;
    return colDiv;
}

function displayAlbums(albums) {
    albumGrid.innerHTML = '';
    albums.forEach(album => {
        albumGrid.appendChild(createAlbumCard(album));
    });
}


function calculateTrackStats(tracklist) {
    let totalSeconds = 0;
    let longestTrack = { trackLength: "0:00", title: "" };
    let shortestTrack = { trackLength: "99:99", title: "" };

    tracklist.forEach(track => {
        const seconds = timeToSeconds(track.trackLength);
        totalSeconds += seconds;

        if (seconds > timeToSeconds(longestTrack.trackLength)) {
            longestTrack = track;
        }
        if (seconds < timeToSeconds(shortestTrack.trackLength)) {
            shortestTrack = track;
        }
    });

    const numTracks = tracklist.length;
    const avgSeconds = numTracks > 0 ? Math.round(totalSeconds / numTracks) : 0;

    return {
        numTracks: numTracks,
        totalDuration: secondsToTime(totalSeconds),
        averageLength: secondsToTime(avgSeconds),
        longestTrack: longestTrack.title + " (" + longestTrack.trackLength + ")",
        shortestTrack: shortestTrack.title + " (" + shortestTrack.trackLength + ")"
    };
}

function displayTrackStats(stats) {
    trackStatsContainer.innerHTML = `
        <h6 class="border-bottom pb-2 mb-2">Album stats:</h6>
        <p class="mb-1">Total tracks: <strong>${stats.numTracks}</strong></p>
        <p class="mb-1">Total duration: <strong>${stats.totalDuration}</strong></p>
        <p class="mb-1">Average length: <strong>${stats.averageLength}</strong></p>
        <p class="mb-1">Longest track: <em>${stats.longestTrack}</em></p>
        <p class="mb-0">Shortest track: <em>${stats.shortestTrack}</em></p>
    `;
}

function populateModal(albumId) {
    const album = allAlbums.find(a => a.id == albumId);
    if (!album) return;

    // Exercise 3
    modalTitle.textContent = `${album.artist} - ${album.album}`;
    
    //Exercise 10
    const stats = calculateTrackStats(album.tracklist);
    displayTrackStats(stats);

    // Exercise 3
    let tracklistHTML = `
        <h6 class="border-bottom pb-2 mb-2">Tracklist:</h6>
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Titlu Melodie</th>
                    <th>Durată</th>
                </tr>
            </thead>
            <tbody>
    `;

    album.tracklist.forEach(track => {
        // Exercise 4
        tracklistHTML += `
            <tr>
                <td>${track.number}</td>
                <td><a href="${track.url}" target="_blank" class="link-dark fw-bold text-decoration-none">${track.title}</a></td>
                <td>${track.trackLength}</td>
            </tr>
        `;
    });

    tracklistHTML += `
            </tbody>
        </table>
    `;
    modalBody.innerHTML = tracklistHTML;

    // Exercise 5
    const firstTrackUrl = album.tracklist[0]?.url;
    if (firstTrackUrl) {
        playOnSpotifyButton.href = firstTrackUrl;
        playOnSpotifyButton.classList.remove('hidden');
        playOnSpotifyButton.onclick = (e) => {
            e.preventDefault();
            window.open(firstTrackUrl, '_blank');
        };
    } else {
        playOnSpotifyButton.classList.add('hidden');
    }
}

// Exercise 2
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-tracklist-btn')) {
        const albumId = e.target.getAttribute('data-album-id');
        populateModal(albumId);
    }
});


function sortAlbums(sortType) {
    const albumsToSort = [...allAlbums]; 

    albumsToSort.sort((a, b) => {
        let valA, valB;

        if (sortType.startsWith('artist')) {
            valA = a.artist.toLowerCase();
            valB = b.artist.toLowerCase();
        } else if (sortType.startsWith('album')) {
            valA = a.album.toLowerCase();
            valB = b.album.toLowerCase();
        } else if (sortType.startsWith('tracks')) {
            valA = a.tracklist.length;
            valB = b.tracklist.length;
        }

        if (valA < valB) return sortType.endsWith('asc') ? -1 : 1;
        if (valA > valB) return sortType.endsWith('asc') ? 1 : -1;
        return 0; 
    });
    
    displayAlbums(albumsToSort);
}

sortOptions.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        const sortType = e.target.getAttribute('data-sort');
        sortAlbums(sortType);
        sortButton.textContent = `Sortare: ${e.target.textContent}`;
        currentSortType = sortType; 
        filterAlbums(searchInput.value); 
    }
});


let currentSortType = 'artist-asc'; 

function filterAlbums(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    const sortedAlbums = [...allAlbums];
    sortedAlbums.sort((a, b) => {
        sortAlbums(currentSortType);
        return 0; 
    });

    const allCards = document.querySelectorAll('#albumGrid > .col');
    allCards.forEach(card => {
        const artist = card.querySelector('.card-title').textContent.toLowerCase();
        const albumTitle = card.querySelector('.card-text').textContent.toLowerCase();
        
        if (artist.includes(term) || albumTitle.includes(term)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', (e) => {
    filterAlbums(e.target.value);
});

window.onload = function() {
    fetch('library.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allAlbums = data;
            sortAlbums(currentSortType); 
        })
        .catch(error => {
            console.error("Erorr loading library:", error);
            albumGrid.innerHTML = '<p class="alert alert-danger">Couldnt load music library.</p>';
        });

    // Exercise 11
    window.onscroll = function() {scrollFunction()};

    function scrollFunction() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    }

    window.topFunction = function() {
        document.body.scrollTop = 0; 
        document.documentElement.scrollTop = 0; 
    }
}