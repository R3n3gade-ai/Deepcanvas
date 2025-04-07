// App constants
export const APP_ID = 'deepcanvas';
export const APP_BASE_PATH = '';
export const API_URL = 'http://localhost:8000';
export const WS_API_URL = 'ws://localhost:8000';

// Mode enum
export enum Mode {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

// Current mode
export const mode = Mode.DEVELOPMENT;
