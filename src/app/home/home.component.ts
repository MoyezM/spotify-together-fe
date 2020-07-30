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
  songs = [];
  endtime: number;
  index: number;

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

    this.socket.onPrevious$().subscribe((data) => {
      this.spotifyService.playTrack(data);
    });

    this.socket.onNext$().subscribe((data) => {
      const song = data['song'];
      this.index = data['index'];

      this.spotifyService.playTrack(song);
    });

    this.socket.onAddNext$().subscribe((data) => {
      this.songs = data;
      this.getSongInfo(this.songs);
    });
  }
  ngOnInit(): void {
    this.spotifyService.init();
    this.getPlaybackTime();
  }

  getPlaybackTime() {
    setInterval(() => {
      if (!this.paused) {
        this.spotifyService.spotifyApi.getMyCurrentPlaybackState().then((data) => {
          this.playBackTime = data.progress_ms;
          this.playBackPercent = 100 * this.playBackTime / this.playBackDuration;
          this.ref.detectChanges();
          if (this.playBackPercent >= 98) {
            // this.spotifyService.pausePlayback();
            this.socket.onNext();
          }
        });
      }
    }, 1000);
  }

  getSongInfo(songs) {
    this.songs = [];

    const batches = Math.ceil(songs.length / 50);
    const tempSongs = {};
    let i = 0;

    while (songs.length) {
      const songBatch = songs.splice(0, 50);
      this.spotifyService.spotifyApi.getTracks(songBatch).then(data => {
        tempSongs[i] = data.tracks;
        i++;

        if (i === batches) {
          for (const idx of Array(i).keys()) {
            this.songs.push(...tempSongs[idx]);
          }
        }
      });
    }
    this.ref.detectChanges();
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
    if (this.playBackDuration !== data.duration) {
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
      this.socket.connect();
      console.log("Connecting to socket")
      setTimeout(() => {
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
