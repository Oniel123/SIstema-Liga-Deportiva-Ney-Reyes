import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline } from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { Categoria, Equipo } from '../../models/jugador.model';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonSpinner],
  templateUrl: './equipos.page.html',
  styleUrls: ['./equipos.page.scss'],
})
export class EquiposPage implements OnInit {
  private api = inject(LigaApiService);

  equipos: Equipo[] = [];
  categorias: Categoria[] = [];
  cargando = true;
  mostrarForm = false;
  guardando = false;
  error = '';

  form = {
    nombre: '',
    categoria: null as number | null,
    entrenador: '',
  };

  constructor() {
    addIcons({ addOutline, closeOutline });
  }

  ngOnInit() {
    this.api.listarCategorias().subscribe((resp) => (this.categorias = resp.results));
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.cargando = true;
    this.api.listarEquipos().subscribe({
      next: (resp) => {
        this.equipos = resp.results;
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
  }

  toggleForm() {
    this.mostrarForm = !this.mostrarForm;
    this.error = '';
  }

  guardar() {
    if (!this.form.nombre || !this.form.categoria) {
      this.error = 'Nombre y categoría son obligatorios.';
      return;
    }
    this.error = '';
    this.guardando = true;
    this.api.crearEquipo(this.form).subscribe({
      next: () => {
        this.guardando = false;
        this.form = { nombre: '', categoria: null, entrenador: '' };
        this.mostrarForm = false;
        this.cargarEquipos();
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudo guardar. Intenta de nuevo.';
      },
    });
  }

  eliminar(equipo: Equipo) {
    if (!window.confirm(`¿Eliminar el equipo ${equipo.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.api.eliminarEquipo(equipo.id).subscribe({
      next: () => this.cargarEquipos(),
      error: (err) => {
        const msg = err?.error?.detail || 'No se pudo eliminar el equipo.';
        window.alert(msg);
      },
    });
  }
}
