import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChannelService } from '../services/channel.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-join-create-channel',
  templateUrl: './join-create-channel.component.html',
  styleUrls: ['./join-create-channel.component.css']
})
export class JoinCreateChannelComponent {
  createChannelForm: FormGroup;
  groupId: string;

  constructor(
    private fb: FormBuilder,
    private channelService: ChannelService,
    public dialogRef: MatDialogRef<JoinCreateChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.groupId = data.groupId;

    this.createChannelForm = this.fb.group({
      name: ['', Validators.required]
    });
  }
  createChannel() {
    if (this.createChannelForm.valid) {
      const channelData = {
        ...this.createChannelForm.value,
        groupId: this.groupId
      };
      this.channelService.createChannel(channelData).subscribe(
        response => {
          console.log('Canal creado:', response);
          this.dialogRef.close({ success: true });
        },
        error => {
          console.error('Error al crear canal:', error);
          this.dialogRef.close({ success: false });
        }
      );
    }
  }
}
