import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, cloudUploadOutline, downloadOutline,
  trashOutline, saveOutline,
} from 'ionicons/icons';

import { LigaApiService } from '../../services/jugador.service';
import { ArchivoJugador, Categoria, Equipo, Jugador } from '../../models/jugador.model';

@Component({
  selector: 'app-jugador-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonIcon, IonSpinner],
  templateUrl: './jugador-perfil.page.html',
  styleUrls: ['./jugador-perfil.page.scss'],
})
export class JugadorPerfilPage implements OnInit {
  private api = inject(LigaApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  jugadorId!: number;
  jugador: Jugador | null = null;
  categorias: Categoria[] = [];
  equipos: Equipo[] = [];
  archivos: ArchivoJugador[] = [];

  cargando = true;
  guardando = false;
  subiendo = false;
  error = '';

  // Copia editable, separada del objeto original hasta guardar
  form: Partial<Jugador> = {};

  constructor() {
    addIcons({
      chevronBackOutline, cloudUploadOutline, downloadOutline,
      trashOutline, saveOutline,
    });
  }

  ngOnInit() {
    this.jugadorId = Number(this.route.snapshot.paramMap.get('id'));
    this.api.listarCategorias().subscribe((resp) => (this.categorias = resp.results));
    this.api.listarEquipos().subscribe((resp) => (this.equipos = resp.results));
    this.cargarJugador();
    this.cargarArchivos();
  }

  cargarJugador() {
    this.cargando = true;
    this.api.obtenerJugador(this.jugadorId).subscribe({
      next: (j) => {
        this.jugador = j;
        this.form = {
          id_escolar: j.id_escolar,
          nombre_completo: j.nombre_completo,
          fecha_nacimiento: j.fecha_nacimiento,
          numero_camiseta: j.numero_camiseta,
          categoria: j.categoria,
          equipo: j.equipo,
        };
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo cargar este jugador.';
      },
    });
  }

  cargarArchivos() {
    this.api.listarArchivos(this.jugadorId).subscribe((resp) => (this.archivos = resp.results));
  }

  equiposDeCategoria(categoriaId: number | null | undefined) {
    if (!categoriaId) return [];
    return this.equipos.filter((e) => e.categoria === categoriaId);
  }

  guardar() {
    if (!this.form.id_escolar?.trim() || !this.form.nombre_completo || !this.form.fecha_nacimiento || !this.form.categoria) {
      this.error = 'ID escolar, nombre, fecha de nacimiento y categoría son obligatorios.';
      return;
    }
    this.error = '';
    this.guardando = true;
    this.api.actualizarJugador(this.jugadorId, this.form).subscribe({
      next: (j) => {
        this.jugador = j;
        this.guardando = false;
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudo guardar. Revisa los datos e intenta de nuevo.';
      },
    });
  }

  volver() {
    this.router.navigate(['/jugadores']);
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.subiendo = true;
    this.api.subirArchivo(this.jugadorId, file, file.name).subscribe({
      next: () => {
        this.subiendo = false;
        input.value = '';
        this.cargarArchivos();
      },
      error: () => {
        this.subiendo = false;
        window.alert('No se pudo subir el archivo. Intenta de nuevo.');
      },
    });
  }

  eliminarArchivo(archivo: ArchivoJugador) {
    if (!window.confirm(`¿Eliminar "${archivo.nombre_archivo}"?`)) {
      return;
    }
    this.api.eliminarArchivo(archivo.id).subscribe({
      next: () => this.cargarArchivos(),
      error: () => window.alert('No se pudo eliminar el archivo.'),
    });
  }
}
