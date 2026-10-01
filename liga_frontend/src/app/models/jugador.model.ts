export interface Categoria {
  id: number;
  nombre: string;
  edad_min: number;
  edad_max: number;
  color_principal: string;
  orden: number;
}

export interface Equipo {
  id: number;
  nombre: string;
  categoria: number;
  categoria_nombre: string;
  entrenador: string;
}

export interface Jugador {
  id: number;
  id_escolar: string | null;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad: number;
  año_nacimiento: number;
  numero_camiseta: number | null;
  equipo: number | null;
  equipo_nombre: string | null;
  categoria: number;
  categoria_nombre: string;
  foto: string | null;
  activo: boolean;
}

export interface ArchivoJugador {
  id: number;
  jugador: number;
  nombre: string;
  nombre_archivo: string;
  url: string;
  subido_en: string;
}

export interface ApiListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}


export interface Listado {
  id: number;
  nombre: string;
  categoria_principal: number | null;
  categoria_principal_nombre: string | null;
  jugadores_count: number;
  creado_en: string;
  actualizado_en: string;
}

export interface ListadoItem {
  id: number;
  jugador: Jugador;
  orden: number;
}

export interface ListadoDetalle extends Listado {
  items: ListadoItem[];
}
