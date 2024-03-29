import {Component, OnInit, ViewChild} from '@angular/core';
import {MusicService} from "../../services/music.service";
import {NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-music',
  standalone: true,
  imports: [
    NgOptimizedImage,
    FormsModule
  ],
  templateUrl: './music.component.html',
  styleUrl: './music.component.css'
})
export class MusicComponent implements OnInit {

  @ViewChild('fileInput') fileInput: any;

 public volumeValue: number = 1;
  progress: number = 0;
  currentTime: number = 0;
  totalTime: number = 0;
  currentTrackName: string = '';

  musicPlays: boolean = false;

  constructor(private musicService: MusicService) {
  }

  ngOnInit() {
    this.musicService.trackInfoUpdated.subscribe(({name}) => {
      this.currentTrackName = name;
      this.loadCover()
    });
  }


  loadedFiles: File[] = [];

  loadFolder(event: any): void {
    const files = event.target.files;
    this.musicService.loadFolder(files);
    this.musicService.loadTrack(0)

    this.musicService.play();
    this.updateProgress();
    this.updateTrackName();
    this.loadCover()
    this.musicPlays = true


    for (let i = 0; i < files.length; i++) {
      this.loadedFiles.push(files[i]);
    }

    console.log(this.loadedFiles)

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
    this.changeVolume()
  }

  previous() {
    this.musicService.previous()
    this.updateTrackName();
    this.loadCover()
    this.musicPlays = true
    this.changeVolume()
  }

  updateProgress(): void {
    this.progress = (this.musicService.getCurrentTime() / this.musicService.getTotalTime()) * 100;
    this.currentTime = this.musicService.getCurrentTime();
    this.totalTime = this.musicService.getTotalTime();
    setTimeout(() => {
      this.updateProgress(); // Update progress continuously
    }, 1000);
  }

  // resetTime(): void {
  //   this.progress = 0;
  //   this.currentTime = 0;
  //   this.totalTime = 0;
  // }


  cleanTrackName(name:string){
    return name.replace('.mp3','')
  }

  public changeVolume(){
    this.musicService.setVolume(this.volumeValue)
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

      if (typeof res === "object") {
        this.imagePath = '/assets/cover/common.jpg'
      } else {
        this.imagePath = res
      }
      console.log("image path" + this.imagePath)

    })
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
}
