import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline } from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { Categoria } from '../../models/jugador.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonSpinner],
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriasPage implements OnInit {
  private api = inject(LigaApiService);

  categorias: Categoria[] = [];
  cargando = true;
  mostrarForm = false;
  guardando = false;
  error = '';

  categoriaEditando: Categoria | null = null;

  form = {
    nombre: '',
    edad_min: null as number | null,
    edad_max: null as number | null,
    color_principal: '#1F3864',
  };

  constructor() {
    addIcons({ addOutline, closeOutline });
  }

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.cargando = true;
    this.api.listarCategorias().subscribe({
      next: (resp) => {
        this.categorias = resp.results;
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
  }

  abrirNueva() {
    this.categoriaEditando = null;
    this.form = { nombre: '', edad_min: null, edad_max: null, color_principal: '#1F3864' };
    this.mostrarForm = true;
    this.error = '';
  }

  editar(cat: Categoria) {
    this.categoriaEditando = cat;
    this.form = {
      nombre: cat.nombre,
      edad_min: cat.edad_min,
      edad_max: cat.edad_max,
      color_principal: cat.color_principal,
    };
    this.mostrarForm = true;
    this.error = '';
  }

  cancelar() {
    this.mostrarForm = false;
    this.categoriaEditando = null;
  }

  guardar() {
    if (!this.form.nombre || this.form.edad_min == null || this.form.edad_max == null) {
      this.error = 'Nombre, edad mínima y edad máxima son obligatorios.';
      return;
    }
    this.error = '';
    this.guardando = true;

    const peticion = this.categoriaEditando
      ? this.api.actualizarCategoria(this.categoriaEditando.id, this.form)
      : this.api.crearCategoria(this.form);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarForm = false;
        this.categoriaEditando = null;
        this.cargarCategorias();
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudo guardar. Intenta de nuevo.';
      },
    });
  }

  eliminar(cat: Categoria) {
    if (!window.confirm(`¿Eliminar la categoría ${cat.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.api.eliminarCategoria(cat.id).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => {
        const msg = err?.error?.detail || 'No se pudo eliminar la categoría.';
        window.alert(msg);
      },
    });
  }
}