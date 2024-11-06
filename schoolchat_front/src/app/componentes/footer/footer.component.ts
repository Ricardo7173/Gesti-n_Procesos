import { Component } from '@angular/core';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  displayModal: boolean = false;

  mostrarModal(event: Event) {
    event.preventDefault(); // Esto evita el comportamiento predeterminado del enlace
    this.displayModal = true;
  }

  cerrarModal() {
    this.displayModal = false;
  }

}
