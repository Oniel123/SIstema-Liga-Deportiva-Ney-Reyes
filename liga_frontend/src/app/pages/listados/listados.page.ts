import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, downloadOutline, createOutline, trashOutline } from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { Categoria, Listado } from '../../models/jugador.model';

@Component({
  selector: 'app-listados',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonSpinner],
  templateUrl: './listados.page.html',
  styleUrls: ['./listados.page.scss'],
})
export class ListadosPage implements OnInit {
  private api = inject(LigaApiService);
  private router = inject(Router);

  listados: Listado[] = [];
  categorias: Categoria[] = [];
  cargando = true;
  mostrarForm = false;
  guardando = false;
  error = '';

  form = {
    nombre: '',
    categoria_principal: null as number | null,
  };

  constructor() {
    addIcons({ addOutline, closeOutline, downloadOutline, createOutline, trashOutline });
  }

  ngOnInit() {
    this.api.listarCategorias().subscribe((resp) => (this.categorias = resp.results));
    this.cargarListados();
  }

  cargarListados() {
    this.cargando = true;
    this.api.listarListados().subscribe({
      next: (resp) => {
        this.listados = resp.results;
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
  }

  abrirNuevo() {
    this.form = { nombre: '', categoria_principal: null };
    this.error = '';
    this.mostrarForm = true;
  }

  cancelar() {
    this.mostrarForm = false;
    this.error = '';
  }

  guardar() {
    if (!this.form.nombre.trim()) {
      this.error = 'Escribe un nombre para el listado.';
      return;
    }

    this.error = '';
    this.guardando = true;

    this.api.crearListado({
      nombre: this.form.nombre.trim(),
      categoria_principal: this.form.categoria_principal,
    }).subscribe({
      next: (listado) => {
        this.guardando = false;
        this.mostrarForm = false;
        this.router.navigate(['/listados', listado.id]);
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudo crear el listado. Intenta de nuevo.';
      },
    });
  }

  abrir(listado: Listado) {
    this.router.navigate(['/listados', listado.id]);
  }

  imprimir(listado: Listado) {
    window.open(this.api.urlPdfListado(listado.id), '_blank');
  }

  eliminar(listado: Listado) {
    if (!window.confirm(`¿Eliminar el listado "${listado.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.api.eliminarListado(listado.id).subscribe({
      next: () => this.cargarListados(),
      error: () => window.alert('No se pudo eliminar el listado.'),
    });
  }
}
