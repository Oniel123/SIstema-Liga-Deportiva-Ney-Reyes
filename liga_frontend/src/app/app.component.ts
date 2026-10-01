import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { LigaApiService } from './services/jugador.service';

const INTERVALO_HEARTBEAT_MS = 5000;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, RouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent implements OnInit {
  private api = inject(LigaApiService);

  ngOnInit() {
    // Mientras esta pestaña siga abierta, el backend sabe que debe
    // seguir corriendo. Si dejan de llegar estas señales (se cerró
    // el navegador), el servidor se apaga solo.
    this.enviarHeartbeat();
    setInterval(() => this.enviarHeartbeat(), INTERVALO_HEARTBEAT_MS);
  }

  private enviarHeartbeat() {
    this.api.enviarHeartbeat().subscribe({ error: () => {} });
  }
}
