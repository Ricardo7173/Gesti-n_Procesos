import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinCreateChannelComponent } from './join-create-channel.component';

describe('JoinCreateChannelComponent', () => {
  let component: JoinCreateChannelComponent;
  let fixture: ComponentFixture<JoinCreateChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JoinCreateChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinCreateChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
