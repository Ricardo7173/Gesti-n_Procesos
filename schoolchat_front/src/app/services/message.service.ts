import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Message {
  groupId: string;
  channelId: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  imageUrl?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = environment.apiUrl + '/api/messages';

  constructor(private http: HttpClient) {}

  getMessagesByChannel(channelId: string): Observable<Message[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<Message[]>(`${this.apiUrl}/channel/${channelId}`, { headers });
  }

  createMessage(message: Message): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.post(this.apiUrl, message, { headers });
  }
}
