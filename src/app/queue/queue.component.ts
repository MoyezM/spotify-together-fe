import { Component, OnInit, Input } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { WebSocketService } from '../web-socket.service';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
  @Input() songs: Array<any>;


  constructor(private socket: WebSocketService,
              private spotifyService: SpotifyService) { }

  ngOnInit(): void {
  }

  addNext(uri) {
    this.socket.onAddNext(uri);
  }

  extract_song_uri(text: string) {
    const goodURIS = [];

    if (text.includes("https://open.spotify.com/playlist/")) {
      const uri = text.split("https://open.spotify.com/playlist/")[1].substring(0, 22);
      this.spotifyService.spotifyApi.getPlaylistTracks(uri).then((data) => {
        for (const d of data.items) {
          goodURIS.push(d.track.id);
        }

        this.socket.onAddNext(goodURIS);
      });
    } else {
      let uris = text.split("https://open.spotify.com/track/")
      uris = uris.slice(1);
      for (let uri of uris) {
        uri = uri.substring(0, 22);
        goodURIS.push(uri);
      }
      this.socket.onAddNext(goodURIS);
    }
  }

  enter_link(text) {
    this.extract_song_uri(text);

  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const text = event.dataTransfer.getData("text");
    this.extract_song_uri(text);

  }

  onDragOver(evt) {
      evt.preventDefault();
      evt.stopPropagation();
  }

  onDragLeave(evt) {
      evt.preventDefault();
      evt.stopPropagation();
  }
}
