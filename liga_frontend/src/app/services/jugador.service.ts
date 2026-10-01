import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ApiListResponse,
  ArchivoJugador,
  Categoria,
  Equipo,
  Jugador,
  Listado,
  ListadoDetalle,
} from '../models/jugador.model';

@Injectable({ providedIn: 'root' })
export class LigaApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  listarCategorias(): Observable<ApiListResponse<Categoria>> {
    return this.http.get<ApiListResponse<Categoria>>(
      `${this.base}/api/categorias/`
    );
  }

  crearCategoria(payload: Record<string, any>): Observable<Categoria> {
    return this.http.post<Categoria>(
      `${this.base}/api/categorias/`,
      payload
    );
  }

  actualizarCategoria(
    id: number,
    payload: Record<string, any>
  ): Observable<Categoria> {
    return this.http.patch<Categoria>(
      `${this.base}/api/categorias/${id}/`,
      payload
    );
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/categorias/${id}/`
    );
  }

  listarEquipos(): Observable<ApiListResponse<Equipo>> {
    return this.http.get<ApiListResponse<Equipo>>(
      `${this.base}/api/equipos/`
    );
  }

  crearEquipo(payload: Record<string, any>): Observable<Equipo> {
    return this.http.post<Equipo>(
      `${this.base}/api/equipos/`,
      payload
    );
  }

  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/equipos/${id}/`
    );
  }

  listarJugadores(
    categoriaId?: number,
    pagina?: number,
    busqueda?: string,
    activo?: boolean
  ): Observable<ApiListResponse<Jugador>> {
    let params = new HttpParams();

    if (categoriaId) {
      params = params.set('categoria', categoriaId);
    }

    if (pagina && pagina > 1) {
      params = params.set('page', pagina);
    }

    if (busqueda?.trim()) {
      params = params.set('search', busqueda.trim());
    }

    if (activo !== undefined) {
      params = params.set('activo', activo);
    }

    return this.http.get<ApiListResponse<Jugador>>(
      `${this.base}/api/jugadores/`,
      { params }
    );
  }

  crearJugador(payload: Record<string, any>): Observable<Jugador> {
    return this.http.post<Jugador>(
      `${this.base}/api/jugadores/`,
      payload
    );
  }

  actualizarJugador(
    id: number,
    payload: Record<string, any>
  ): Observable<Jugador> {
    return this.http.patch<Jugador>(
      `${this.base}/api/jugadores/${id}/`,
      payload
    );
  }

  eliminarJugador(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/jugadores/${id}/`
    );
  }

  obtenerJugador(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(
      `${this.base}/api/jugadores/${id}/`
    );
  }

  listarArchivos(
    jugadorId: number
  ): Observable<ApiListResponse<ArchivoJugador>> {
    const params = new HttpParams().set(
      'jugador',
      jugadorId
    );

    return this.http.get<ApiListResponse<ArchivoJugador>>(
      `${this.base}/api/archivos-jugador/`,
      { params }
    );
  }

  subirArchivo(
    jugadorId: number,
    archivo: File,
    nombre?: string
  ): Observable<ArchivoJugador> {
    const formData = new FormData();

    formData.append('jugador', String(jugadorId));
    formData.append('archivo', archivo);

    if (nombre) {
      formData.append('nombre', nombre);
    }

    return this.http.post<ArchivoJugador>(
      `${this.base}/api/archivos-jugador/`,
      formData
    );
  }

  eliminarArchivo(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/archivos-jugador/${id}/`
    );
  }

  listarListados(): Observable<ApiListResponse<Listado>> {
    return this.http.get<ApiListResponse<Listado>>(
      `${this.base}/api/listados/`
    );
  }

  obtenerListado(id: number): Observable<ListadoDetalle> {
    return this.http.get<ListadoDetalle>(
      `${this.base}/api/listados/${id}/`
    );
  }

  crearListado(payload: {
    nombre: string;
    categoria_principal?: number | null;
  }): Observable<ListadoDetalle> {
    return this.http.post<ListadoDetalle>(
      `${this.base}/api/listados/`,
      payload
    );
  }

  actualizarListado(
    id: number,
    payload: { nombre?: string; categoria_principal?: number | null }
  ): Observable<Listado> {
    return this.http.patch<Listado>(
      `${this.base}/api/listados/${id}/`,
      payload
    );
  }

  eliminarListado(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/api/listados/${id}/`
    );
  }

  agregarJugadoresAListado(
    listadoId: number,
    jugadores: number[]
  ): Observable<any> {
    return this.http.post(
      `${this.base}/api/listados/${listadoId}/agregar-jugadores/`,
      { jugadores }
    );
  }

  agregarCategoriaAListado(
    listadoId: number,
    categoriaId: number
  ): Observable<any> {
    return this.http.post(
      `${this.base}/api/listados/${listadoId}/agregar-categoria/`,
      { categoria: categoriaId }
    );
  }

  eliminarJugadorDeListado(
    listadoId: number,
    jugadorId: number
  ): Observable<ListadoDetalle> {
    return this.http.delete<ListadoDetalle>(
      `${this.base}/api/listados/${listadoId}/jugadores/${jugadorId}/`
    );
  }

  vaciarListado(listadoId: number): Observable<ListadoDetalle> {
    return this.http.delete<ListadoDetalle>(
      `${this.base}/api/listados/${listadoId}/vaciar/`
    );
  }

  enviarHeartbeat(): Observable<any> {
    return this.http.get(
      `${this.base}/api/heartbeat/`,
      { responseType: 'text' }
    );
  }

  urlPdfRoster(categoriaId?: number | null): string {
    const base = `${this.base}/pdf/roster/`;

    return categoriaId
      ? `${base}?categoria=${categoriaId}`
      : base;
  }

  urlPdfListado(listadoId: number): string {
    return `${this.base}/pdf/listado/${listadoId}/`;
  }
}
