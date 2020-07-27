import { Component, OnInit } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
  public files: NgxFileDropEntry[] = [];

  constructor(private socket: WebSocketService) { }

  ngOnInit(): void {
  }

  addNext(uri) {

  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();

    const data = event.dataTransfer.getData("text");

    console.log(data)
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
