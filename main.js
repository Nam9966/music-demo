//----------------------------------Music Player---------------------------------
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')      
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: 'Hôm nay em cưới rồi',
            singer: 'Khải Đăng , Freak D',
            image: './assets/img/song1.jpg',
            music: './assets/song/song1.mp3'
        },
        {
            name: 'Ngày em đẹp nhất',
            singer: 'TAMA',
            image: './assets/img/song2.jpg',
            music: './assets/song/song2.mp3'
        },
        {
            name: 'Không yêu xin đừng nói',
            singer: 'UMIE',
            image: './assets/img/song3.jpg',
            music: './assets/song/song3.mp3'
        },{
            name: 'Đưa em về nhà',
            singer: 'Grey D , Chillies',
            image: './assets/img/song4.jpg',
            music: './assets/song/song4.mp3'
        },
        {
            name: 'Mặt mộc',
            singer: 'Phạm Nguyên Ngọc x VAnh x Ân Nhi',
            image: './assets/img/song5.jpg',
            music: './assets/song/song5.mp3'
        },
        {
            name: 'Em bé',
            singer: 'Amee x Krik X BAEMIN',
            image: './assets/img/song6.jpg',
            music: './assets/song/song6.mp3'
        },
        {
            name: 'Ngõ Chạm',
            singer: 'BigDaddy x Emily',
            image: './assets/img/song7.jpg',
            music: './assets/song/song7.mp3'
        },
        {
            name: 'Một nhà',
            singer: 'DaLab',
            image: './assets/img/song8.jpg',
            music: './assets/song/song8.mp3'
        },
        {
            name: 'Cô gái này là của ai',
            singer: 'KxR x Nhi Nhi',
            image: './assets/img/song9.jpg',
            music: './assets/song/song9.mp3'
        },
    ], 

    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const html = this.songs.map(function(song, index) {
            return `
            <div class="song ${index === app.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>  
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`;
        })
        $('.playlist').innerHTML = html.join("")
    }, 

    defineProperties: function() { 
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvent: function() {
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity,
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newcdWidth = cdWidth - scrollTop;
            if(newcdWidth > 0 ){
                cd.style.width = newcdWidth + 'px'
                cd.style.opacity = newcdWidth / cdWidth;
            }
            else{
                cd.style.width = 0 + 'px'
            }   
        }

        // Xử lý khi click play 
        playBtn.onclick = function() {
            if(app.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        }

        // Khi song được play 
        audio.onplay = function() {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song được pause 
        audio.onpause = function() {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function() {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        
        // Xử lý khi tua 
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime;
        }

        // Xử lý khi next song
        nextBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong()
            }
            else {
                app.nextSong()
            }
            audio.play()
            app.render()
            app.scrolltoActiveSong()
        }

        // Xử lý khi prev song
        prevBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong()
            }
            else {
                app.prevSong()
            }
            audio.play()
            app.render()
            app.scrolltoActiveSong()
        }

        // Xử lý khi nhấn random
        randomBtn.onclick = function(e) {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
        }

        // Xử lý phát lại audio 
        repeatBtn.onclick = function() {
            app.isRepeat =!app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if(app.isRepeat){
                audio.play()
            }
            else {
                nextBtn.onclick()
            }
        }

        // Lắng nghe click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
        
                // Xử lý khi click vào song
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong()
                    app.render()
                    audio.play()
                }

                // Xử lý khi click vào option
                if(e.target.closest('.option')){

                }
            }
        }
    },

    loadConfig: function() { 
        this.isRandom = this.config.isRandom 
        this.isRepeat = this.config.isRepeat 
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.music
    },

    nextSong: function() { 
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }

        this.loadCurrentSong()
    },

    prevSong: function() { 
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong()
    },

    playRandomSong: function() { 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrolltoActiveSong: function() {
        setTimeout(function() { 
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block:'nearest'
            })
        }, 300)
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Lắng nghe / xử lý sự kiện (DOM event)
        this.handleEvent()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của Button Repeat / Random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
}

app.start()