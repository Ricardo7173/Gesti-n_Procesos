import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private apiUrl = environment.apiUrl + '/api/channels';

  constructor(private http: HttpClient) {}

  createChannel(channelData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.post(`${this.apiUrl}`, channelData, { headers });
  }

  getChannelsByGroupId(groupId: string): Observable<Channel[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<Channel[]>(`${this.apiUrl}/group/${groupId}`, { headers });
  }
}
