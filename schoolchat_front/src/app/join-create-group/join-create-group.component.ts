import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-join-create-group',
  templateUrl: './join-create-group.component.html',
  styleUrl: './join-create-group.component.css'
})
export class JoinCreateGroupComponent {
  createGroupForm: FormGroup;
  joinGroupForm: FormGroup;
  isCreatingGroup: boolean = true;
  groupDetails: any = null;
  groupNotFound: boolean = false;

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    public dialogRef: MatDialogRef<JoinCreateGroupComponent>
  ) {
    this.createGroupForm = this.fb.group({
      name: ['', Validators.required],
      photoUrl: ['']
    });

    this.joinGroupForm = this.fb.group({
      inviteCode: ['', Validators.required]
    });
  }

  switchMode() {
    this.isCreatingGroup = !this.isCreatingGroup;
    this.groupDetails = null;
    this.groupNotFound = false;
  }

  createGroup() {
    if (this.createGroupForm.valid) {
      this.groupService.createGroup(this.createGroupForm.value).subscribe(
        response => {
          console.log('Grupo creado:', response);
          this.dialogRef.close({success: true});
        },
        error => {
          console.error('Error al crear grupo:', error);
          this.dialogRef.close({success: false});
        }
      );
    }
  }

  checkInviteCode() {
    if (this.joinGroupForm.controls['inviteCode'].valid) {
      const inviteCode = this.joinGroupForm.controls['inviteCode'].value;
      this.groupService.getGroupByInviteCode(inviteCode).subscribe(
        response => {
          this.groupDetails = response;
          this.groupNotFound = false;
        },
        error => {
          this.groupDetails = null;
          this.groupNotFound = true;
        }
      );
    }
  }

  joinGroup() {
    if (this.groupDetails && this.joinGroupForm.valid) {
      this.groupService.joinGroup(this.joinGroupForm.value).subscribe(
        response => {
          console.log('Te has unido al grupo:', response);
          this.dialogRef.close({success: true});
        },
        error => {
          console.error('Error al unirse al grupo:', error);
        }
      );
    }
  }
}
