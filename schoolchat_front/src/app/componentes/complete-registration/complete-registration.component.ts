import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PasswordMatchValidator } from '../../validators/passwordValidator';

@Component({
  selector: 'app-complete-registration',
  templateUrl: './complete-registration.component.html',
  styleUrl: './complete-registration.component.css'
})
export class CompleteRegistrationComponent {
  completeRegistrationForm: FormGroup;
  password: any;
  confirmPassword: any;
  userId: any;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.completeRegistrationForm = this.fb.group({
      username: ['', Validators.required],
      realName: ['', Validators.required],
      avatar: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}')]],
      confirmPassword: ['', Validators.required]
    }, { validators: PasswordMatchValidator }
  );
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.verifyToken(token).subscribe((response: any) => {
        this.userId = response.userId;
      }, () => {
        console.log('Token inválido');
      }
    );
    }
    else {
      console.log('No hay token');
    }
  }

  completeRegistration() {
    if (this.completeRegistrationForm.valid) {
      const { username, realName, avatar, password } = this.completeRegistrationForm.value;
      this.authService.completeRegistration(this.userId, username, realName, avatar, password).subscribe(response => {
        console.log('Registro completado');
      });
    }
  }
}
