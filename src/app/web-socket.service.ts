import { environment } from './../environments/environment';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import * as Rx from 'rxjs';
import { Observable } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket;
  private room: number;

  constructor() {
  }

  set_room(room: number) {
    this.room = room;
    this.connect();
  }

  get_room(): number {
    return this.room;
  }

  connect() {
    if (this.socket) {
      console.log('Removing the old socket')
      this.socket.disconnect();
    }
    if (this.room) {
      this.socket = io(`${environment.API_URL}?room=${this.room}`);
    }
    else {
      const roomNumber = Math.floor(Math.random() * 10000);
      this.room = roomNumber;
      this.socket = io(`${environment.API_URL}?room=${this.room}`);
    }
  }

  onTogglePlayback(playbackState: boolean) {
    this.socket.emit('togglePlayback', playbackState);
  }

  onTogglePlayback$() {
    const observable = new Observable(observer => {
      this.socket.on('togglePlayback', (data) => {
        observer.next(data);
      });
    });

    const observer =  {
      next: (data) => {
        return data;
      }
    };

    return Rx.Subject.create(observer, observable);
  }

  onNext() {
    this.socket.emit('next');
  }

  onNext$() {
    const observable = new Observable(observer => {
      this.socket.on('next', (data) => {
        observer.next(data);
      });
    });

    let observer =  {
      next: (data) => {
        return data;
      }
    };
    return Rx.Subject.create(observer, observable);
  }

  onPrevious$() {
    const observable = new Observable(observer => {
      this.socket.on('previous', (data) => {
        observer.next(data);
      });
    });

    let observer =  {
      next: (data) => {
        return data;
      }
    };
    return Rx.Subject.create(observer, observable);
  }

  onPrevious() {
    this.socket.emit('previous');
  }

  onAddNext(uri) {
    this.socket.emit('addNext', uri);
  }


  onAddNext$() {
    const observable = new Observable(observer => {
      this.socket.on('addNext', (data) => {
        observer.next(data);
      });
    });

    const observer =  {
      next: (data) => {
        return data;
      }
    };

    return Rx.Subject.create(observer, observable);
  }

}
