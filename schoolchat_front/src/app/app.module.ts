import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { PrimengModule } from './primeng/primeng.module';
import { DialogModule } from 'primeng/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
//Componentes
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';
import { HomeComponent } from './componentes/home/home.component';
import { CompleteRegistrationComponent } from './componentes/complete-registration/complete-registration.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCard, MatCardModule } from '@angular/material/card';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ChatComponent } from './componentes/chat/chat.component';
import { JoinCreateGroupComponent } from './join-create-group/join-create-group.component';
import { MatDialogModule } from '@angular/material/dialog';
import { JoinCreateChannelComponent } from './join-create-channel/join-create-channel.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FooterComponent } from './componentes/footer/footer.component';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ChatComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    CompleteRegistrationComponent,
    NavbarComponent,
    JoinCreateGroupComponent,
    JoinCreateChannelComponent,
    FooterComponent,
  ],
  imports: [
    MatMenuModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    PrimengModule,
    DialogModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    HttpClientModule,
    MatDialogModule,
    MatCardModule,
    MatGridListModule,
    MatSnackBarModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['https://localhost:3000'], // Cambia esto a tu dominio
        disallowedRoutes: ['http://localhost:3000/api/auth/']
      }
    })
  ],
  exports: [
    PrimengModule
  ],
  providers: [JwtHelperService, provideAnimationsAsync()],
  bootstrap: [AppComponent]
})
export class AppModule { }
