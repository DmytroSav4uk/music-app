import {Component, OnInit} from '@angular/core';
import {MusicService} from "../../services/music.service";
import {NgOptimizedImage} from "@angular/common";


@Component({
  selector: 'app-music',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './music.component.html',
  styleUrl: './music.component.css'
})
export class MusicComponent implements OnInit {


  progress: number = 0;
  currentTime: number = 0;
  totalTime: number = 0;
  currentTrackName: string = '';
  currentTrackAlbum: string | undefined = '';
  coverPath!: string;
  musicPlays:boolean = false;

  constructor(private musicService: MusicService) {
  }

  ngOnInit() {
    this.musicService.trackInfoUpdated.subscribe(({name}) => {
      this.currentTrackName = name;
      this.loadCover()
    });
  }

  loadFolder(event: any): void {
    const files = event.target.files;
    this.musicService.loadFolder(files);
    this.musicService.loadTrack(0);
    this.musicService.play();
    this.updateProgress();
    this.updateTrackName();
    this.loadCover()
    this.musicPlays = true
  }

  play(): void {
    this.musicService.play();
    this.musicPlays = true
  }

  pause(): void {
    this.musicService.pause();
    this.musicPlays = false
  }

  next() {
    this.musicService.next()
    this.updateTrackName();
    this.loadCover()
    this.musicPlays = true
  }

  previous() {
    this.musicService.previous()
    this.updateTrackName();
    this.loadCover()
    this.musicPlays = true
  }

  updateProgress(): void {
    this.progress = (this.musicService.getCurrentTime() / this.musicService.getTotalTime()) * 100;
    this.currentTime = this.musicService.getCurrentTime();
    this.totalTime = this.musicService.getTotalTime();
    setTimeout(() => {
      this.updateProgress(); // Update progress continuously
    }, 1000);
  }

  resetTime(): void {
    this.progress = 0;
    this.currentTime = 0;
    this.totalTime = 0;
  }

  seek(event: any): void {
    const position = event.target.value;
    this.musicService.seek(position);
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${this.padTime(minutes)}:${this.padTime(seconds)}`;
  }

  padTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  updateTrackName(): void {
    this.currentTrackName = this.musicService.getCurrentTrackName();
  }

  imagePath: any

  loadCover() {
    this.musicService.loadCover().subscribe((res: any) => {
      console.log(typeof res)
      console.log(res)

      if (typeof res === "object"){
        this.imagePath = '/assets/cover/common.jpg'
      }else {
        this.imagePath = res
      }
console.log("image path" + this.imagePath)

    })
  }


}
