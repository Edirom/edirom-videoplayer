
console.log("Videoplayer Webcomponent loaded");

fetch("resources/webcomponents/videoplayer/videoplayerElement.html")
    .then(stream => stream.text())
    .then(text => define(text));

function define(html) {
    class videoplayerElement extends HTMLElement {
        constructor() {
            super();
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = html;
            this.video = this.shadow.querySelector("video");
            this.canvas = this.shadow.querySelector('#video-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.playPauseBtn = this.shadow.querySelector('.play-pause-btn');
            this.timelineContainer = this.shadow.querySelector(".timeline-container");
            this.currentTimeElem = this.shadow.querySelector(".current-time");
            this.totalTimeElem = this.shadow.querySelector(".total-time");
            this.leadingZeroFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });


            this.canvas.addEventListener("click", () => {
                if (this.state == "play") {
                    this.state = "pause";
                }
                else {
                    this.state = "play";
                }
            });

            this.playPauseBtn.addEventListener("click", () => {
                if (this.state == "play") {
                    this.state = "pause";
                }
                else {
                    this.state = "play";
                }
            });


            this.video.addEventListener("timeupdate", () => {
                console.log("timeupdate");
                this.currentTimeElem.textContent = this.formatDuration(this.video.currentTime);
                const percent = this.video.currentTime / this.video.duration;
                this.timelineContainer.style.setProperty("--progress-position", percent);

                // Send timeupdate event to host
                const communicateTimeupdateEvent = new CustomEvent('communicate-time-update', {
                    detail: { time: this.video.currentTime },
                    bubbles: true
                });
                this.dispatchEvent(communicateTimeupdateEvent);
            });

            this.video.addEventListener("loadeddata", () => { // when video is loaded we can access the time data
                this.totalTimeElem.textContent = this.formatDuration(this.video.duration);
            });

            this.timelineContainer.addEventListener("mousemove", this.handleTimelineUpdate);
        }

        static get observedAttributes() {
            return ["src", "tstamp", "state"]
        }

        // Ist dann mit this.testattr abrufbar
        get src() {
            return this.getAttribute("src");
        }
        set src(value) {
            this.setAttribute("src", value);
        }

        get state() {
            return this.getAttribute("state");
        }
        set state(value) {
            this.setAttribute("state", value);
        }

        set tstamp(value) {
            this.setAttribute("tstamp", value);
        }

        drawScreen = () => {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        }

        formatDuration = (time) => {
            const seconds = Math.floor(time % 60);
            const minutes = Math.floor(time / 60) % 60;
            const hours = Math.floor(time / 3600);
            if (hours === 0) {
                return `${minutes}:${this.leadingZeroFormatter.format(seconds)}`;
            } else {
                return `${hours}:${this.leadingZeroFormatter.format(minutes)}:${this.leadingZeroFormatter.format(seconds)}`;
            }
        }

        // Wird ausgeführt, wenn WC dem DOM zur Verfügung steht
        connectedCallback() {
            setInterval(this.drawScreen, 33);
        }

        disconnectedCallback() {
            console.log("Element entfernt");
        }

        // Wird ausgeführt, wenn Attributwert sich ändert und initial
        attributeChangedCallback(name, oldValue, newValue) {
            // console.log(name, oldValue, newValue);
            if (oldValue === newValue) return;
            if (name == "src") {
                this.video.src = newValue;
            }
            else if (name == "tstamp") {
                console.log("tstamp", newValue);
                console.log("currentTime", this.video.currentTime);
                if (this.video.currentTime != newValue) {
                    this.video.currentTime = newValue;
                }
            }
            else if (name == "state") {
                if (newValue == "play") {
                    this.video.play();
                }
                else if (newValue == "pause") {
                    this.video.pause();
                }
            }
        }

        handleTimelineUpdate = (e) => {
            const rect = this.timelineContainer.getBoundingClientRect();
            const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
            this.timelineContainer.style.setProperty("--preview-position", percent);
        }
    }

    customElements.define("edirom-videoplayer", videoplayerElement)
}