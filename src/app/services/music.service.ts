import {EventEmitter, Injectable} from '@angular/core';
import {Howl} from 'howler';
import {HttpClient} from "@angular/common/http";
import {map} from 'rxjs';


interface PlaylistItem {
  file: File;
  url: any;
  cover?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MusicService {

  constructor(private http: HttpClient) {
  }

  private sound!: Howl;
  private playlist: PlaylistItem[] = [];
  private currentTrackIndex: number = 0;
  private progressInterval: any;
  private fileNames: string[] = [];
  public currentTrackFile: any;
  volumeValue: any

  trackInfoUpdated = new EventEmitter<{ name: string }>();

  loadFolder(files: FileList): void {
    this.playlist = [];
    this.fileNames = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);

      this.playlist.push({file, url});
      this.fileNames.push(file.name);
    }
  }

  loadTrack(index: number): File | undefined {
    if (index >= 0 && index < this.playlist.length) {
      this.stop();
      this.currentTrackIndex = index;
      this.currentTrackFile = this.playlist[index].file;

      this.sound = new Howl({
        src: [this.playlist[index].url],
        html5: true,
        onend: () => {
          this.next();
        },
      });

      this.progressInterval = setInterval(() => {
        this.updateProgress();
      }, 1000);

      this.updateTrackInfo();
      return this.currentTrackFile;
    }

    return undefined;
  }


  loadCover() {
    const path = 'http://localhost:3000/processAudio';

    const formData = new FormData();
    formData.append('audioFile', this.currentTrackFile);

    return this.http.post(path, formData, {responseType: 'blob'}).pipe(
      map((blob: Blob) => {

        const contentType = blob.type;
        if (contentType && contentType.startsWith('image')) {

          return URL.createObjectURL(blob);
        } else {

          return this.parseJsonBlob(blob);
        }
      })
    );
  }

  private parseJsonBlob(blob: Blob): any {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        try {
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (error) {
          resolve({message: 'Error parsing JSON response'});
        }
      };
      reader.readAsText(blob);
    });
  }

  play(): void {
    this.sound.play();
  }

  pause(): void {
    this.sound.pause();

  }

  stop(): void {
    if (this.sound) {
      this.sound.stop();
    }
  }

  next(): void {
    this.stop();
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.loadTrack(this.currentTrackIndex);
    this.play();
    this.setVolume(this.volumeValue)
  }

  previous(): void {
    this.stop();
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadTrack(this.currentTrackIndex);
    this.play();
  }

  seek(position: number): void {
    this.sound.seek(this.sound.duration() * (position / 100));
  }

  updateProgress(): void {
    const progress = (this.sound.seek() / this.sound.duration()) * 100;
    // Handle progress update as needed
  }

  getCurrentTime(): number {
    return this.sound.seek();
  }

  getTotalTime(): number {
    return this.sound.duration();
  }

  getCurrentTrackName(): string {
    return this.fileNames[this.currentTrackIndex] || '';
  }

  updateTrackInfo(): void {
    const currentTrack = this.playlist[this.currentTrackIndex];
    if (currentTrack) {
      // Emit an event with the updated track information
      this.trackInfoUpdated.emit({
        name: this.fileNames[this.currentTrackIndex],
      });
    }
  }


  setVolume(volume: number): void {
    if (this.sound) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.sound.volume(clampedVolume);
    }
    this.volumeValue = volume
  }
}
