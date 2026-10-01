import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  searchOutline,
  addOutline,
  trashOutline,
  downloadOutline,
  checkmarkCircleOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { Categoria, Jugador, ListadoDetalle } from '../../models/jugador.model';

const TAMANO_PAGINA = 7;

@Component({
  selector: 'app-listado-constructor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonIcon, IonSpinner],
  templateUrl: './listado-constructor.page.html',
  styleUrls: ['./listado-constructor.page.scss'],
})
export class ListadoConstructorPage implements OnInit {
  private api = inject(LigaApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  listadoId!: number;
  listado: ListadoDetalle | null = null;
  categorias: Categoria[] = [];
  jugadoresDisponibles: Jugador[] = [];

  categoriaAgregar: number | null = null;
  categoriaFiltro: number | null = null;
  terminoBusqueda = '';

  paginaActual = 1;
  totalDisponibles = 0;
  cargando = true;
  cargandoDisponibles = false;
  guardando = false;
  error = '';

  nombreEditado = '';
  categoriaPrincipalEditada: number | null = null;

  constructor() {
    addIcons({
      arrowBackOutline,
      searchOutline,
      addOutline,
      trashOutline,
      downloadOutline,
      checkmarkCircleOutline,
      playSkipBackOutline,
      playSkipForwardOutline,
      chevronBackOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit() {
    this.listadoId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.listarCategorias().subscribe((resp) => {
      this.categorias = resp.results;
    });

    this.cargarListado();
    this.cargarDisponibles();
  }

  cargarListado() {
    this.cargando = true;

    this.api.obtenerListado(this.listadoId).subscribe({
      next: (listado) => {
        this.listado = listado;
        this.nombreEditado = listado.nombre;
        this.categoriaPrincipalEditada = listado.categoria_principal;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo cargar el listado.';
      },
    });
  }

  cargarDisponibles() {
    this.cargandoDisponibles = true;

    this.api.listarJugadores(
      this.categoriaFiltro ?? undefined,
      this.paginaActual,
      this.terminoBusqueda,
      true
    ).subscribe({
      next: (resp) => {
        this.jugadoresDisponibles = resp.results;
        this.totalDisponibles = resp.count;
        this.cargandoDisponibles = false;
      },
      error: () => {
        this.cargandoDisponibles = false;
      },
    });
  }

  cambiarBusqueda(termino: string) {
    this.terminoBusqueda = termino;
    this.paginaActual = 1;
    this.cargarDisponibles();
  }

  cambiarCategoriaFiltro() {
    this.paginaActual = 1;
    this.cargarDisponibles();
  }

  get totalPaginasDisponibles(): number {
    return Math.max(1, Math.ceil(this.totalDisponibles / TAMANO_PAGINA));
  }

  get numerosPaginaDisponibles(): number[] {
    const total = this.totalPaginasDisponibles;
    let inicio = Math.max(1, this.paginaActual - 2);
    let fin = Math.min(total, this.paginaActual + 2);

    while (fin - inicio < 4 && (inicio > 1 || fin < total)) {
      if (inicio > 1) inicio--;
      else if (fin < total) fin++;
      else break;
    }

    const numeros: number[] = [];
    for (let i = inicio; i <= fin; i++) numeros.push(i);
    return numeros;
  }

  irAPagina(pagina: number) {
    if (
      pagina < 1 ||
      pagina > this.totalPaginasDisponibles ||
      pagina === this.paginaActual
    ) return;

    this.paginaActual = pagina;
    this.cargarDisponibles();
  }

  agregarJugador(jugador: Jugador) {
    this.api.agregarJugadoresAListado(this.listadoId, [jugador.id]).subscribe({
      next: (resp) => {
        this.listado = resp.listado;
      },
      error: () => window.alert('No se pudo agregar al jugador.'),
    });
  }

  estaEnListado(jugadorId: number): boolean {
    return !!this.listado?.items.some((item) => item.jugador.id === jugadorId);
  }

  agregarCategoria() {
    if (!this.categoriaAgregar) return;

    this.api.agregarCategoriaAListado(
      this.listadoId,
      this.categoriaAgregar
    ).subscribe({
      next: (resp) => {
        this.listado = resp.listado;
      },
      error: () => window.alert('No se pudo agregar la categoría.'),
    });
  }

  eliminarJugador(jugador: Jugador) {
    this.api.eliminarJugadorDeListado(
      this.listadoId,
      jugador.id
    ).subscribe({
      next: (listado) => {
        this.listado = listado;
      },
      error: () => window.alert('No se pudo eliminar al jugador del listado.'),
    });
  }

  vaciarListado() {
    if (!this.listado?.items.length) return;

    if (!window.confirm('¿Eliminar todos los jugadores de este listado?')) {
      return;
    }

    this.api.vaciarListado(this.listadoId).subscribe({
      next: (listado) => {
        this.listado = listado;
      },
      error: () => window.alert('No se pudo vaciar el listado.'),
    });
  }

  guardarDatosListado() {
    if (!this.nombreEditado.trim()) {
      this.error = 'El nombre del listado es obligatorio.';
      return;
    }

    this.error = '';
    this.guardando = true;

    this.api.actualizarListado(this.listadoId, {
      nombre: this.nombreEditado.trim(),
      categoria_principal: this.categoriaPrincipalEditada,
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.cargarListado();
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudieron guardar los datos del listado.';
      },
    });
  }

  imprimir() {
    window.open(this.api.urlPdfListado(this.listadoId), '_blank');
  }

  volver() {
    this.router.navigate(['/listados']);
  }
}
