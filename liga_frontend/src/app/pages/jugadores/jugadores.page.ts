import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonIcon,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  peopleOutline,
  shirtOutline,
  gridOutline,
  clipboardOutline,
  downloadOutline,
  addOutline,
  searchOutline,
  chevronBackOutline,
  chevronForwardOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
} from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { Categoria, Jugador } from '../../models/jugador.model';
import { JugadorFormModalComponent } from './jugador-form-modal.component';

const TAMANO_PAGINA = 7; // debe coincidir con PAGE_SIZE del backend

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonIcon,
    IonSpinner,
  ],
  templateUrl: './jugadores.page.html',
  styleUrls: ['./jugadores.page.scss'],
})
export class JugadoresPage implements OnInit {
  private api = inject(LigaApiService);
  private modalCtrl = inject(ModalController);

  categorias: Categoria[] = [];
  jugadores: Jugador[] = [];

  categoriaSeleccionada: number | null = null;
  terminoBusqueda = '';

  cargando = true;

  paginaActual = 1;
  totalCount = 0;

  constructor() {
    addIcons({
      peopleOutline,
      shirtOutline,
      gridOutline,
      clipboardOutline,
      downloadOutline,
      addOutline,
      searchOutline,
      chevronBackOutline,
      chevronForwardOutline,
      playSkipBackOutline,
      playSkipForwardOutline,
    });
  }

  ngOnInit() {
    this.api.listarCategorias().subscribe((resp) => {
      this.categorias = resp.results;
    });

    this.cargarJugadores();
  }

  seleccionarCategoria(id: number | null) {
    this.categoriaSeleccionada = id;
    this.paginaActual = 1;
    this.cargarJugadores();
  }

  cargarJugadores() {
    this.cargando = true;

    this.api.listarJugadores(
      this.categoriaSeleccionada ?? undefined,
      this.paginaActual,
      this.terminoBusqueda
    ).subscribe({
      next: (resp) => {
        this.jugadores = resp.results;
        this.totalCount = resp.count;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  buscarJugadores(termino: string) {
    this.terminoBusqueda = termino;
    this.paginaActual = 1;
    this.cargarJugadores();
  }

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.totalCount / TAMANO_PAGINA)
    );
  }

  /** Ventana de hasta 5 números de página alrededor de la página actual. */
  get numerosPagina(): number[] {
    const total = this.totalPaginas;

    let inicio = Math.max(
      1,
      this.paginaActual - 2
    );

    let fin = Math.min(
      total,
      this.paginaActual + 2
    );

    while (
      fin - inicio < 4 &&
      (inicio > 1 || fin < total)
    ) {
      if (inicio > 1) {
        inicio--;
      } else if (fin < total) {
        fin++;
      } else {
        break;
      }
    }

    const numeros: number[] = [];

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  }

  irAPagina(pagina: number) {
    if (
      pagina < 1 ||
      pagina > this.totalPaginas ||
      pagina === this.paginaActual
    ) {
      return;
    }

    this.paginaActual = pagina;
    this.cargarJugadores();
  }

  primeraPagina() {
    this.irAPagina(1);
  }

  ultimaPagina() {
    this.irAPagina(this.totalPaginas);
  }

  paginaAnterior() {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente() {
    this.irAPagina(this.paginaActual + 1);
  }

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }

  async abrirModalNuevoJugador() {
    const modal = await this.modalCtrl.create({
      component: JugadorFormModalComponent,
    });

    modal.present();

    const { role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.cargarJugadores();
    }
  }

  alternarBaja(jugador: Jugador) {
    const nuevoEstado = !jugador.activo;

    const confirmacion = nuevoEstado
      ? `¿Reactivar a ${jugador.nombre_completo}?`
      : `¿Dar de baja a ${jugador.nombre_completo}? No se borra, solo deja de aparecer como activo.`;

    if (!window.confirm(confirmacion)) {
      return;
    }

    this.api.actualizarJugador(
      jugador.id,
      { activo: nuevoEstado }
    ).subscribe({
      next: () => this.cargarJugadores(),
    });
  }

  eliminarJugador(jugador: Jugador) {
    const confirmacion =
      `¿Eliminar a ${jugador.nombre_completo} definitivamente? ` +
      `Esta acción no se puede deshacer.`;

    if (!window.confirm(confirmacion)) {
      return;
    }

    this.api.eliminarJugador(jugador.id).subscribe({
      next: () => this.cargarJugadores(),
      error: () =>
        window.alert(
          'No se pudo eliminar al jugador. Intenta de nuevo.'
        ),
    });
  }

  get totalJugadores() {
    return this.totalCount;
  }

  get totalEquipos() {
    // Aproximado: solo cuenta equipos distintos dentro de la página actual.
    return new Set(
      this.jugadores
        .map((j) => j.equipo)
        .filter(Boolean)
    ).size;
  }

  get jugadoresFiltrados(): Jugador[] {
    // La búsqueda ahora la realiza Django antes de la paginación.
    return this.jugadores;
  }
}