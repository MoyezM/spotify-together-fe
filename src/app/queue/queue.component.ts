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


  constructor(private socket: WebSocketService) { }

  ngOnInit(): void {
  }

  addNext(uri) {
    this.socket.onAddNext(uri);
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();

    const data = event.dataTransfer.getData("text");

    let uris = data.split("https://open.spotify.com/track/")
    uris = uris.slice(1);

    for (let uri of uris) {
      uri = uri.substring(0, 22);
      console.log(uri);
      this.addNext(uri);

    }
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
