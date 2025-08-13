// Interfaces para respuestas de la API
export interface ApiResponse<T> {
  codigo: number;
  mensaje: string;
  datos: T;
}

// Interface para ConvenioRecaudo configurados
export interface ConvenioRecaudoConfigurado {
  id: number;
  convenioId: number;
  nivelRecaudoId: number;
  fechaCreacion: string;
  fechaModificacion: string | null;
  usuarioId: string;
  activo: boolean;
  ambitoIds: number[] | null;
  otroItemsIds: number[] | null;
  programaIds: number[] | null;
  nivelRecaudoNombre: string; // Nombre del nivel de recaudo
}

export interface ConvenioRecaudoConfigurationList {
  elementos: ConvenioRecaudoConfigurado[];
  totalPaginas: number;
}

// Interface para login
export interface LoginRequest {
  Username: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
}

// Interface para token decodificado
export interface TokenPayload {
  nameid: string;
  unique_name: string;
  OperacionId: string;
  ConvenioId?: string; // Agregar convenioId opcional
  nbf: number;
  exp: number;
  iat: number;
}

// Interface para RecaudosOperacion
export interface RecaudoOperacion {
  id: number;
  name: string;          // Campo principal para mostrar
  nombre?: string;       // Campo alternativo por compatibilidad
  descripcion?: string;
  estado: boolean;
  operacionId: number;
  fechaCreacion: string;
  fechaModificacion?: string;
}

// Interfaces para TablaDato API
export interface TablaInfo {
  id: number;
  name: string;
  orden: number | null;
  equivalente: string | null;
}

export interface DatoTabla {
  id: number;
  name: string;
  orden: number | null;
  equivalente: string | null;
}

export interface TablaDato {
  tabla: TablaInfo;
  datos: DatoTabla[];
}

// Interface para selección con checkbox
export interface DatoSeleccionado extends DatoTabla {
  selected: boolean;
}

// Interface para el detalle de ConvenioRecaudo (GET por ID)
export interface ConvenioRecaudoDetalle {
  id: number;
  convenioId: number;
  nivelRecaudoId: number;
  fechaCreacion: string;
  fechaModificacion: string | null;
  usuarioId: string;
  activo: boolean;
  ambitoIds: number[] | null;
  otroItemsIds: number[] | null;
  programaIds: number[] | null;
  nivelRecaudoNombre: string;
}

// Interface para actualizar ConvenioRecaudo (PUT)
export interface ActualizarConvenioRecaudoRequest {
  convenioRecaudo: {
    id: number;
    convenioId: number;
    nivelRecaudoId: number;
  };
  ambitoIds: number[];
  otroItemsIds: number[];
  programaIds: number[];
}
