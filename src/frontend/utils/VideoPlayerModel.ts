class VideoPlayerModel {
  public videoContainer = document.querySelector(
    ".video-container"
  ) as HTMLDivElement;
  public playPauseBtn = this.$("[data-action='play']") as HTMLButtonElement;
  public muteBtn = this.$(".mute-btn");
  public currentTimeElement = this.$(".current-time");
  public totalTimeElement = this.$(".total-time");
  public timelineContainer = this.$(".timeline-container");
  private inpointMarker = this.$(".inpoint-indicator");
  private outpointMarker = this.$(".outpoint-indicator");
  private listenersToUnload: (() => void)[] = [];
  private _isMuted = false;
  private frameRate!: number | null;

  public get isMuted() {
    return this._isMuted;
  }

  public get volume() {
    return this.video.volume;
  }
  // private set
  constructor(private video: HTMLVideoElement) {
    this.playPauseBtn.textContent = "▶";
    this.assignEventListener("click", this.playPauseBtn, () => {
      this.togglePlay();
    });
    this.assignEventListener("click", this.video, () => {
      this.togglePlay();
    });
    this.assignVideoEventListener("loadeddata", () => {
      this.totalTimeElement.textContent = VideoPlayerModel.formatTimestamp(
        this.video.duration
      );
    });
    this.assignVideoEventListener("timeupdate", () => {
      this.currentTimeElement.textContent = VideoPlayerModel.formatTimestamp(
        this.video.currentTime
      );
      const videoPercentageSeeked =
        this.video.currentTime / this.video.duration;
      this.timelineContainer.style.setProperty(
        "--progress-position",
        `${videoPercentageSeeked}`
      );
    });
    this.handleTimelineEvents();
  }

  public async setFramerate(frameRate: number) {
    this.frameRate = frameRate;
  }

  private handleTimelineEvents() {
    this.assignEventListener(
      "click",
      this.timelineContainer,
      (e: MouseEvent) => {
        const rect = this.timelineContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        this.video.currentTime = this.video.duration * percentage;
        const videoPercentageSeeked =
          this.video.currentTime / this.video.duration;
        this.timelineContainer.style.setProperty(
          "--progress-position",
          `${videoPercentageSeeked}`
        );
      }
    );
  }

  public togglePlay() {
    console.log("toggling play, video is", this.video.paused);
    this.video.paused ? this.video.play() : this.video.pause();
    this.video.paused
      ? (this.playPauseBtn.textContent = "▶")
      : (this.playPauseBtn.textContent = "❚❚");
  }

  public toggleMute() {
    this.video.muted = !this.video.muted;
    if (this.video.volume === 0) {
      this.setMuted(true);
    }
    this._isMuted = this.video.muted;
  }
  public setMuted(isMuted: boolean) {
    this.video.muted = isMuted;
    this._isMuted = isMuted;
  }

  static setInpointOutpoint(inpoint: number, outpoint: number) {
    const videoContainer = document.querySelector(
      ".video-container"
    ) as HTMLElement;
    const video = videoContainer.querySelector("video");
    const timelineContainer = videoContainer.querySelector(
      ".timeline-container"
    ) as HTMLElement;
    const inpointMarker = videoContainer.querySelector(
      ".inpoint-indicator"
    ) as HTMLElement;
    const outpointMarker = videoContainer.querySelector(
      ".outpoint-indicator"
    ) as HTMLElement;
    console.log(
      `%c inpoint is ${inpoint}, outpoint is ${outpoint}`,
      "color: blue; font-weight: bold"
    );
    if (inpoint === -1) {
      inpointMarker.classList.add("indicator-hidden");
    }
    if (outpoint === -1) {
      outpointMarker.classList.add("indicator-hidden");
    } else {
      inpointMarker.classList.remove("indicator-hidden");
      outpointMarker.classList.remove("indicator-hidden");
      console.log("inpoint ratio", inpoint / video.duration);
      console.log("outpoint ratio", outpoint / video.duration);
      const inpointPercentage = `${((inpoint / video.duration) * 100).toFixed(
        0
      )}%`;
      const outpointPercentage = `${(
        Math.min(outpoint / video.duration, 0.99) * 100
      ).toFixed(0)}%`;
      console.log("--inpoint-position", inpointPercentage);
      console.log("--outpoint-position", outpointPercentage);
      timelineContainer.style.setProperty(
        "--inpoint-position",
        inpointPercentage
      );
      timelineContainer.style.setProperty(
        "--outpoint-position",
        outpointPercentage
      );
    }
  }

  public assignVideoEventListener(
    event: keyof HTMLVideoElementEventMap,
    func: () => void
  ) {
    this.video.addEventListener(event, func);
    this.listenersToUnload.push(() => {
      this.video.removeEventListener(event, func);
    });
  }

  public assignEventListener(
    event: string,
    element: HTMLElement,
    func: (e?: Event | MouseEvent) => void
  ) {
    element.addEventListener(event, func);
    this.listenersToUnload.push(() => {
      element.removeEventListener(event, func);
    });
  }

  public getPlaybackInfo() {
    return {
      duration: this.video.duration,
      currentTime: this.video.currentTime,
      frameRate: this.frameRate,
    };
  }

  public setSpeed(speed: number) {
    this.video.playbackRate = speed;
  }

  public getSpeed() {
    return this.video.playbackRate;
  }

  public nextFrame() {
    if (this.frameRate) {
      this.video.currentTime += 1 / this.frameRate;
    } else {
      console.error("Frame rate is not set");
    }
  }

  public previousFrame() {
    if (this.frameRate) {
      this.video.currentTime -= 1 / this.frameRate;
    } else {
      console.error("Frame rate is not set");
    }
  }

  public skip(seconds: number) {
    this.video.currentTime += seconds;
  }

  public removeListeners() {
    this.listenersToUnload.forEach((unload) => unload());
  }

  private $(selector: string) {
    return this.videoContainer.querySelector(selector) as HTMLElement;
  }

  public static formatTimestamp(seconds: number, withMillis = false) {
    if (!withMillis) {
      const pad = (num: number) => String(num).padStart(2, "0");
      const preparedSeconds = Math.round(seconds);
      const hours = Math.floor(preparedSeconds / 3600);
      const minutes = Math.floor((preparedSeconds % 3600) / 60);
      const secs = preparedSeconds % 60;

      if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(secs)}`;
      } else {
        return `${minutes}:${pad(secs)}`;
      }
    } else {
      const pad = (num: number, size = 2) => String(num).padStart(size, "0");
      const milliseconds = Math.floor((seconds % 1) * 1000);
      const totalSeconds = Math.floor(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(secs)}.${pad(milliseconds, 3)}`;
      } else {
        return `${minutes}:${pad(secs)}.${pad(milliseconds, 3)}`;
      }
    }
  }
}

export default VideoPlayerModel;
