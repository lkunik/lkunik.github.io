// Crossfades between the four homepage hero clips.
// Only two <video> elements ever exist; the hidden one has its src swapped
// ahead of each transition so the fade never stalls on a fresh load.
(function () {
    var frame = document.getElementById('heroFrame');
    if (!frame) return;

    var clips = [
        { src: 'videos/hero-fullbleed/DJI_0045.mp4', poster: 'videos/hero-fullbleed/DJI_0045.jpg' },
        { src: 'videos/hero-fullbleed/DJI_0075.mp4', poster: 'videos/hero-fullbleed/DJI_0075.jpg' },
        { src: 'videos/hero-fullbleed/DJI_0111.mp4', poster: 'videos/hero-fullbleed/DJI_0111.jpg' },
        { src: 'videos/hero-fullbleed/DJI_0048.mp4', poster: 'videos/hero-fullbleed/DJI_0048.jpg' }
    ];

    var players = [document.getElementById('heroVidA'), document.getElementById('heroVidB')];
    var counter = document.getElementById('heroCounter');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var front = 0;
    var index = 0;
    var running = false;
    var advanceTimer = null;

    function setCounter(i) {
        if (counter) {
            counter.textContent = 'AERIAL FOOTAGE — 0' + (i + 1) + ' / 0' + clips.length;
        }
    }

    function loadInto(el, clip) {
        el.src = clip.src;
        el.poster = clip.poster;
        el.load();
    }

    function safePlay(el) {
        var p = el.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {});
        }
    }

    function crossfadeTo(nextIndex) {
        var back = 1 - front;
        loadInto(players[back], clips[nextIndex]);
        safePlay(players[back]);

        advanceTimer = setTimeout(function () {
            players[front].classList.remove('is-active');
            players[back].classList.add('is-active');
            players[front].pause();
            front = back;
            index = nextIndex;
            setCounter(index);
            scheduleNext();
        }, 900);
    }

    function scheduleNext() {
        clearTimeout(advanceTimer);
        var current = players[front];
        var onTimeUpdate = function () {
            if (current.duration && current.duration - current.currentTime < 1.4) {
                current.removeEventListener('timeupdate', onTimeUpdate);
                crossfadeTo((index + 1) % clips.length);
            }
        };
        current.addEventListener('timeupdate', onTimeUpdate);
    }

    function start() {
        if (running) return;
        running = true;
        loadInto(players[front], clips[index]);
        players[front].classList.add('is-active');
        safePlay(players[front]);
        setCounter(index);
        scheduleNext();
    }

    function stop() {
        running = false;
        clearTimeout(advanceTimer);
        players.forEach(function (v) { v.pause(); });
    }

    if (reduceMotion) {
        // Respect reduced-motion: leave the poster frame showing, no playback.
        setCounter(0);
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                start();
            } else {
                stop();
            }
        });
    }, { threshold: 0.15 });

    observer.observe(frame);
})();
