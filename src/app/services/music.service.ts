import {EventEmitter, Injectable} from '@angular/core';
import {Howl} from 'howler';
import {HttpClient} from "@angular/common/http";
import { map } from 'rxjs';


interface PlaylistItem {
  file: File;
  url: any;
  cover?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MusicService {


  constructor(private http:HttpClient) {
  }


  private sound!: Howl;
  private playlist: PlaylistItem[] = [];
  private currentTrackIndex: number = 0;
  private progressInterval: any;
  private fileNames: string[] = [];
  private currentTrackFile:any;


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

  loadTrack(index: number): void {
    if (index >= 0 && index < this.playlist.length) {
      this.stop();
      this.currentTrackIndex = index;
      this.currentTrackFile = this.playlist[index].file;
      console.log(this.currentTrackFile)
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
    }
  }




    loadCover() {
      const path = 'http://localhost:3000/processAudio';

      const formData = new FormData();
      formData.append('audioFile', this.currentTrackFile);

      return this.http.post(path, formData, { responseType: 'blob' }).pipe(
        map((blob: Blob) => {
          return URL.createObjectURL(blob);
        })
      );

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
}
