import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinCreateGroupComponent } from './join-create-group.component';

describe('JoinCreateGroupComponent', () => {
  let component: JoinCreateGroupComponent;
  let fixture: ComponentFixture<JoinCreateGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JoinCreateGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinCreateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
