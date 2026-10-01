import { Routes } from '@angular/router';
import { ShellComponent } from './shared/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'jugadores', pathMatch: 'full' },
      {
        path: 'jugadores',
        loadComponent: () =>
          import('./pages/jugadores/jugadores.page').then((m) => m.JugadoresPage),
      },
      {
        path: 'jugadores/:id',
        loadComponent: () =>
          import('./pages/jugador-perfil/jugador-perfil.page').then((m) => m.JugadorPerfilPage),
      },
      {
        path: 'equipos',
        loadComponent: () =>
          import('./pages/equipos/equipos.page').then((m) => m.EquiposPage),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./pages/categorias/categorias.page').then((m) => m.CategoriasPage),
      },
      {
        path: 'listados',
        loadComponent: () =>
          import('./pages/listados/listados.page').then((m) => m.ListadosPage),
      },
      {
        path: 'listados/:id',
        loadComponent: () =>
          import('./pages/listados/listado-constructor.page').then((m) => m.ListadoConstructorPage),
      },
    ],
  },
];
