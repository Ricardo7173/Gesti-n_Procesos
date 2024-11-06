import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(public dialog: MatDialog, private groupService: GroupService) {}
  groups: Group[] = [];

  ngOnInit() {
    
  }

  
}