import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = environment.apiUrl + '/api/groups';

  constructor(private http: HttpClient) {}

  createGroup(groupData: any) {
    return this.http.post(`${this.apiUrl}/create`, groupData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  joinGroup(inviteData: any) {
    return this.http.post(`${this.apiUrl}/join`, inviteData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  getGroup(groupId: string) {
    return this.http.get(`${this.apiUrl}/${groupId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  getGroupsByUserId() {
    return this.http.get(`${this.apiUrl}/user/groups`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  getGroupByInviteCode(inviteCode: string) {
    return this.http.get(`${this.apiUrl}/invite/${inviteCode}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  getUsersInGroup(groupId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${groupId}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  kickUserFromGroup(groupId: string, userId: string) {
    return this.http.delete(`${this.apiUrl}/${groupId}/kick/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
}