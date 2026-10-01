import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, downloadOutline } from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { Categoria } from '../../models/jugador.model';

@Component({
  selector: 'app-pdf-options-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon,
  ],
  templateUrl: './pdf-options-modal.component.html',
  styleUrls: ['./pdf-options-modal.component.scss'],
})
export class PdfOptionsModalComponent implements OnInit {
  private api = inject(LigaApiService);
  private modalCtrl = inject(ModalController);

  categorias: Categoria[] = [];
  categoriaSeleccionada: number | null = null;

  constructor() {
    addIcons({ closeOutline, downloadOutline });
  }

  ngOnInit() {
    this.api.listarCategorias().subscribe((resp) => (this.categorias = resp.results));
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  generar() {
    const url = this.api.urlPdfRoster(this.categoriaSeleccionada);
    window.open(url, '_blank');
    this.modalCtrl.dismiss();
  }
}
