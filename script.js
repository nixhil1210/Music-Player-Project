const audio = document.getElementById("audio");

const playButton = document.getElementById("play");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const progress = document.getElementById("progress");

const currentTimeText = document.getElementById("current-time");
const durationText = document.getElementById("duration");

const volume = document.getElementById("volume");
const muteButton = document.getElementById("mute");

const title = document.getElementById("song-title");
const artist = document.getElementById("artist-name");
const albumArt = document.getElementById("album-art");

const shuffleButton = document.getElementById("shuffle");
const repeatButton = document.getElementById("repeat");
const autoplayButton = document.getElementById("autoplay");
const favoriteButton = document.getElementById("favorite");

const songCards = document.querySelectorAll(".song-card");

let currentSong = 0;
let shuffle = false;
let repeat = false;
let autoplay = false;
let isMuted = false;
let favorites = [];

loadSong(currentSong);

playButton.addEventListener("click", function () {
  if (!audio.src) {
    alert("This song does not have an audio file yet.");
    return;
  }

  if (audio.paused) {
    audio.play();
    playButton.textContent = "Ⅱ";
  } else {
    audio.pause();
    playButton.textContent = "▶";
  }
});

previousButton.addEventListener("click", function () {
  currentSong--;

  if (currentSong < 0) {
    currentSong = songCards.length - 1;
  }

  // Skip artwork-only items.
  while (!songCards[currentSong].dataset.audio) {
    currentSong--;
    if (currentSong < 0) currentSong = songCards.length - 1;
  }

  loadSong(currentSong);
  audio.play();
  playButton.textContent = "Ⅱ";
});

nextButton.addEventListener("click", playNextSong);

function playNextSong() {
  if (shuffle) {
    currentSong = Math.floor(Math.random() * songCards.length);
    while (!songCards[currentSong].dataset.audio) {
      currentSong = Math.floor(Math.random() * songCards.length);
    }
  } else {
    currentSong++;

    if (currentSong >= songCards.length) {
      currentSong = 0;
    }

    while (!songCards[currentSong].dataset.audio) {
      currentSong++;
      if (currentSong >= songCards.length) currentSong = 0;
    }
  }

  loadSong(currentSong);
  audio.play();
  playButton.textContent = "Ⅱ";
}

songCards.forEach(function (card) {
  card.addEventListener("click", function () {
    currentSong = Number(card.dataset.index);
    loadSong(currentSong);

    if (card.dataset.audio) {
      audio.play();
      playButton.textContent = "Ⅱ";
    } else {
      alert("The Lag Ja Gale artwork was added, but its audio file was not uploaded.");
    }
  });
});

function loadSong(index) {
  const song = songCards[index];

  title.textContent = song.dataset.title;
  artist.textContent = song.dataset.artist;
  albumArt.src = song.dataset.image;

  songCards.forEach(function (item) {
    item.classList.remove("active");
  });

  song.classList.add("active");

  progress.value = 0;
  currentTimeText.textContent = "0:00";
  durationText.textContent = "0:00";

  if (song.dataset.audio) {
    audio.src = song.dataset.audio;
    audio.load();
  } else {
    audio.removeAttribute("src");
    audio.load();
  }

  updateFavoriteButton();
}

audio.addEventListener("loadedmetadata", function () {
  durationText.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", function () {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }

  currentTimeText.textContent = formatTime(audio.currentTime);
});

progress.addEventListener("input", function () {
  if (audio.duration) {
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
});

volume.addEventListener("input", function () {
  audio.volume = volume.value;

  if (audio.volume > 0) {
    isMuted = false;
    muteButton.textContent = "🔊";
  }
});

muteButton.addEventListener("click", function () {
  if (isMuted) {
    audio.volume = volume.value || 1;
    muteButton.textContent = "🔊";
    isMuted = false;
  } else {
    audio.volume = 0;
    muteButton.textContent = "🔇";
    isMuted = true;
  }
});

shuffleButton.addEventListener("click", function () {
  shuffle = !shuffle;
  shuffleButton.classList.toggle("active", shuffle);
});

repeatButton.addEventListener("click", function () {
  repeat = !repeat;
  repeatButton.classList.toggle("active", repeat);
});

autoplayButton.addEventListener("click", function () {
  autoplay = !autoplay;
  autoplayButton.textContent = autoplay ? "Autoplay: On" : "Autoplay: Off";
});

favoriteButton.addEventListener("click", function () {
  const songName = songCards[currentSong].dataset.title;

  if (favorites.includes(songName)) {
    favorites.splice(favorites.indexOf(songName), 1);
  } else {
    favorites.push(songName);
  }

  updateFavoriteButton();
});

function updateFavoriteButton() {
  const songName = songCards[currentSong].dataset.title;

  if (favorites.includes(songName)) {
    favoriteButton.textContent = "♥ Favorite";
    favoriteButton.classList.add("liked");
  } else {
    favoriteButton.textContent = "♡ Favorite";
    favoriteButton.classList.remove("liked");
  }
}

audio.addEventListener("ended", function () {
  if (repeat) {
    audio.currentTime = 0;
    audio.play();
    return;
  }

  if (autoplay) {
    playNextSong();
  } else {
    playButton.textContent = "▶";
  }
});

function formatTime(seconds) {
  if (isNaN(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.floor(seconds % 60);

  return minutes + ":" + String(secondsLeft).padStart(2, "0");
}
