import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline, shirtOutline, gridOutline, downloadOutline, clipboardOutline,
} from 'ionicons/icons';

import { PdfOptionsModalComponent } from '../pdf-options/pdf-options-modal.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IonContent, IonIcon],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ peopleOutline, shirtOutline, gridOutline, downloadOutline, clipboardOutline });
  }

  async abrirOpcionesPdf() {
    const modal = await this.modalCtrl.create({
      component: PdfOptionsModalComponent,
    });
    modal.present();
  }
}
