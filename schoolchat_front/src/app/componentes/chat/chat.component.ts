import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';
import { GroupService } from '../../services/group.service';
import { JoinCreateGroupComponent } from '../../join-create-group/join-create-group.component';
import { MatDialog } from '@angular/material/dialog';
import { Group } from '../../models/group.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.model';
import { environment } from '../../../environments/environment';
import { JoinCreateChannelComponent } from '../../join-create-channel/join-create-channel.component';
import { User } from '../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

// Importar operadores de RxJS
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  messages: { user: string, avatar: string, text: string, time: string, imageUrl?: string }[] = [];
  newMessage: string = '';
  selectedFile: File | null = null; // Para almacenar el archivo seleccionado
  username: string | null = null;
  currentUserId: string = '';
  isAdmin: boolean = false;
  avatar: string = '';
  tempUsername: string = '';
  showUsernameModal: boolean = true;
  changeUserModal: boolean = false;
  showChannelModal: boolean = false;
  isCreatingChannel: boolean = true;
  groupId: string = ''; // ID del grupo actual
  channelId: string = ''; // ID del canal actual
  channelName: string = ''; // Nombre del canal actual
  imageUrl: string = '';

  // WebSocket
  private socket: WebSocket | null = null;

  groups: Group[] = [];
  channels: Channel[] = [];
  users: User[] = [];

  createChannelForm: FormGroup;
  joinChannelForm: FormGroup;
  channelDetails: Channel | null = null;
  channelNotFound: boolean = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private channelService: ChannelService,
    public dialog: MatDialog,
    private groupService: GroupService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.createChannelForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.joinChannelForm = this.fb.group({
      inviteCode: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.showUsernameModal = false;
    console.log('Loading groups. OnInit...')
    this.loadGroups();
    this.connectToWebSocket();
  }

  connectToWebSocket() {
    this.socket = new WebSocket(environment.wsUrl);

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'message':
          this.handleMessage(message);
          break;
        case 'channel':
          this.handleChannel(message);
          break;
        case 'user-joined':
        case 'user-left':
          this.handleUser(message);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    }
  }

  handleMessage(message: any) {
    if (message.channelId === this.channelId && message.userId !== this.currentUserId) {
      this.messages.push({
        user: message.username,
        avatar: message.avatar,
        text: message.text,
        time: new Date(message.timestamp).toLocaleTimeString(),
        imageUrl: message.imageUrl
      });
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  handleChannel(message: any) {
    if (message.groupId === this.groupId && message.userId !== this.currentUserId) {
      this.loadChannels();
    }
  }

  handleUser(message: any) {
    if (message.groupId === this.groupId ) {
      // this.loadUsersInGroup();
    }
    this.loadGroups();
  }


  loadGroups(loadUsers: boolean = true) {
    this.groupService.getGroupsByUserId().subscribe(
      {
        next: (response: any) => {
          this.groups = response;
          if (this.groups.length === 0) {
            this.openGroupDialog();
          } else {
            this.groupId = this.groups[0].groupId;
            
            if(loadUsers) this.loadUsersInGroup();
            
            //Ahora traer los canales
            this.loadChannels();
            //Ahora traer la información del usuario
            this.loadUserInfo();
          }
        },
        error: (error: any) => {
          console.error('Error al obtener grupos:', error);
        }
      }
    );
  }

  loadUserInfo() {
    this.userService.getUser().subscribe(
      user => {
        this.username = user.username;
        this.currentUserId = user.userId;
        this.avatar = user.avatar;
        console.log(user);
        this.checkIfAdmin();
        this.showUsernameModal = false;
      },
      error => {
        console.error('Error fetching user data', error);
        this.showUsernameModal = true;
        this.username = '';
      }
    );
  }

  loadMessages() {
    this.messageService.getMessagesByChannel(this.channelId).subscribe(
      messages => {
        this.messages = messages.map(message => ({
          user: message.username,
          avatar: message.avatar,
          text: message.text,
          time: new Date(message.timestamp).toLocaleTimeString(),
          imageUrl: message.imageUrl
        }));
        setTimeout(() => {
          this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        }, 0);
      },
      error => {
        console.error('Error fetching messages', error);
      }
    );
  }

  sendMessage() {
    if (this.newMessage.trim() || this.imageUrl.trim()) {
      const message: any = {
        groupId: this.groupId,
        channelId: this.channelId,
        userId: this.currentUserId,
        username: this.username,
        avatar: this.avatar,
        text: this.newMessage,
        timestamp: new Date().toISOString(),
        imageUrl: this.imageUrl.trim() || null //Solo si se propociona la imagen
      };
  
      this.createMessage(message);
  
      this.newMessage = '';
      this.imageUrl = ''; // Limpia la URL de la imagen
    }
  }
 
  createMessage(message: any) {
    this.messageService.createMessage(message).subscribe(
      response => {
        this.messages.push({
          user: this.username!,
          avatar: this.avatar,
          text: this.newMessage,
          time: new Date().toLocaleTimeString(),
          imageUrl: message.imageUrl // Asegúrate de incluir `imageUrl`
        });
        setTimeout(() => {
          this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        }, 0);
      },
      error => {
        console.error('Error sending message', error);
      }
    );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post<{ url: string }>(`${environment.apiUrl}/api/upload/upload`, formData)
      .pipe(
        map(response => response.url),
        catchError(error => {
          console.error('Error uploading image:', error);
          return throwError(() => error);
        })
      );
  }

  setUsername() {
    if (this.tempUsername.trim()) {
      this.username = this.tempUsername.trim();
      this.showUsernameModal = false;
    }
  }

  changeUsername() {
    this.tempUsername = '';
    this.changeUserModal = true;
  }

  confirmChangeUsername() {
    if (this.tempUsername.trim()) {
      this.username = this.tempUsername.trim();
      this.changeUserModal = false;
    }
  }

  cancelChangeUsername() {
    this.changeUserModal = false;
  }

  openGroupDialog() {
    const dialogRef = this.dialog.open(JoinCreateGroupComponent, {
      width: '400px',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      // this.loadGroups();
    });
  }

  openChannelDialog() {
    const dialogRef = this.dialog.open(JoinCreateChannelComponent, {
      width: '400px',
      height: 'auto',
      data: { groupId: this.groupId }
    });
  }

  switchChannelMode() {
    this.isCreatingChannel = !this.isCreatingChannel;
    this.channelDetails = null;
    this.channelNotFound = false;
  }

  createChannel() {
    if (this.createChannelForm.valid) {
      this.channelService.createChannel(this.createChannelForm.value).subscribe(
        response => {
          console.log('Channel created:', response);
          this.showChannelModal = false;
          this.loadChannels();
        },
        error => {
          console.error('Error creating channel:', error);
        }
      );
    }
  }

  changeGroup(groupId: string) {
    this.groupId = groupId;
    this.loadChannels();
    this.loadUsersInGroup();
    this.checkIfAdmin();
  }

  checkIfAdmin() {
    this.groups.forEach(group => {
      if (group.groupId === this.groupId) {
        this.isAdmin = group.admins.includes(this.currentUserId);
      }
    });
  }

  loadChannels() {
    if (this.groupId) {
      this.channelService.getChannelsByGroupId(this.groupId).subscribe(channels => {
        this.channels = channels;
        this.channelId = this.channels[0].channelId;
        console.log('Canales:', this.channels);
        this.channelName = this.channels[0].name;
        this.loadMessages();
      });
    }
  }

  changeChannel(channelId: string) {
    console.log('Cambiando a canal:', channelId);
    this.channelId = channelId;
    this.channelName = this.channels.find(channel => channel.channelId === channelId)?.name || '';
    this.loadMessages();
  }

  loadUsersInGroup() {
    this.users = [];
    this.groupService.getUsersInGroup(this.groupId).subscribe(
      users => {
        const usersId = users;
        console.log('Users in group:', usersId);
        this.users = [];
        usersId.forEach((userId: string) => {
          this.userService.getUserById(userId).subscribe(
            user => {
              this.users.push(user);
              console.log('User:', user.username);
            }
          );
        },
        (error: any) => {
          console.error('Error fetching users in group', error);
        });
      }
    );
  }

  kickUser(userId: string) {
    this.groupService.kickUserFromGroup(this.groupId, userId).subscribe(
      response => {
        console.log('User kicked:', response);
        // this.loadUsersInGroup();
      },
      error => {
        console.error('Error kicking user:', error);
      }
    );
  }

  copyCode() {
    navigator.clipboard.writeText(this.groups.find(group => group.groupId === this.groupId)?.inviteCode ?? '');
    this.snackBar.open('Código copiado al portapapeles', 'Cerrar', { duration: 2000 });
  }
}
