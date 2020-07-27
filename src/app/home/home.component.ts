import { SpotifyService } from './../spotify.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  LOGIN_URL = environment.LOGIN_URL;
  imageURL: string;
  artists: Array<any>;
  album: string;
  song: string;
  paused = true;
  artistCombined: string;
  playBackTime: number;
  playBackDuration: number;
  playBackPercent: number;
  room = this.socket.get_room();
  loaded = false;

  currentSong = {
    song: '',
    artist: '',
    uri: ''
  };

  set_room(value) {
    this.room = value;
    this.socket.set_room(this.room);
    this.socket_subscriptions();
  }

  state = this.spotifyService.getState$.subscribe(data => {
    this.updateData(data);
    return data;
  });

  constructor(private spotifyService: SpotifyService,
              private socket: WebSocketService,
              private ref: ChangeDetectorRef) {
  }

  socket_subscriptions() {
    this.socket.onTogglePlayback$().subscribe((data) => {
      this.spotifyService.togglePlayback(data);
    });

    this.socket.onPrevious$().subscribe(() => {
      this.spotifyService.skipPrevious();
    });

    this.socket.onNext$().subscribe(() => {
      this.spotifyService.skipNext();
    });
  }
  ngOnInit(): void {
    this.spotifyService.init();
  }

  updateData(data: any) {
    if (this.imageURL !== data.track_window.current_track.album.images[2].url) {
      this.imageURL = data.track_window.current_track.album.images[2].url;
      this.ref.detectChanges();
    }
    if (this.artists !== data.track_window.current_track.artists) {
      this.artists = data.track_window.current_track.artists;
      this.artistCombined = this.artists.map(artist  => artist.name).join(', ');
      this.ref.detectChanges();
    }
    if (this.album !== data.track_window.current_track.artists) {
      this.album = data.track_window.current_track.album.name;
      this.ref.detectChanges();
    }
    if (this.song !== data.track_window.current_track.name) {
      this.playBackDuration = data.duration;
      this.song = data.track_window.current_track.name;
      this.ref.detectChanges();
    }
    if (this.paused !== data.paused) {
      this.paused = data.paused;
      this.ref.detectChanges();
    }

    const song = {
      song: data.track_window.current_track.name,
      artist: data.track_window.current_track.artists[0].name,
      uri: data.track_window.current_track.uri
    };

    if (this.currentSong !== song) {
      this.currentSong = song;
    }

    if (!this.loaded) {
      this.loaded = true;
      setTimeout(() => {
        this.socket.connect();
        this.socket_subscriptions();
        this.room = this.socket.get_room();
      }, 1000);
    }
  }

  togglePlayback() {
    this.socket.onTogglePlayback(this.paused);
  }

  onNext() {
    this.socket.onNext();
  }

  onPrevious() {
    this.socket.onPrevious();
  }

}
