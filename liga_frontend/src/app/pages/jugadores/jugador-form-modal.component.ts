import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { Categoria, Equipo } from '../../models/jugador.model';

@Component({
  selector: 'app-jugador-form-modal',    
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon,
  ],
  templateUrl: './jugador-form-modal.component.html',
  styleUrls: ['./jugador-form-modal.component.scss'],
})
export class JugadorFormModalComponent implements OnInit {
  private api = inject(LigaApiService);
  private modalCtrl = inject(ModalController);

  categorias: Categoria[] = [];
  equipos: Equipo[] = [];
  guardando = false;
  error = '';

  form = {
    id_escolar: '',
    nombre_completo: '',
    fecha_nacimiento: '',
    categoria: null as number | null,
    equipo: null as number | null,
    numero_camiseta: null as number | null,
  };

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnInit() {
    this.api.listarCategorias().subscribe((resp) => (this.categorias = resp.results));
    this.api.listarEquipos().subscribe((resp) => (this.equipos = resp.results));
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  guardar() {
    if (!this.form.id_escolar.trim() || !this.form.nombre_completo || !this.form.fecha_nacimiento || !this.form.categoria) {
      this.error = 'ID escolar, nombre, fecha de nacimiento y categoría son obligatorios.';
      return;
    }
    this.error = '';
    this.guardando = true;
    this.api.crearJugador(this.form).subscribe({
      next: (jugador) => {
        this.guardando = false;
        this.modalCtrl.dismiss(jugador, 'confirm');
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudo guardar. Revisa los datos e intenta de nuevo.';
      },
    });
  }
}
