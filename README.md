# ConvenioRecaudoApp

Aplicación Angular diseñada para ser embebida como iframe, que proporciona operaciones CRUD para la gestión de ConvenioRecaudo con autenticación JWT.

## 🎯 Características Principales

- **🖼️ Integración Iframe**: Diseñada para ser embebida en aplicaciones padre
- **🔐 Autenticación JWT**: Autenticación basada en tokens recibidos desde la aplicación padre
- **📋 Operaciones CRUD**: Crear, leer, actualizar y eliminar ConvenioRecaudo
- **🌐 Integración API**: Comunicación RESTful con backend Blazor
- **📱 Diseño Responsivo**: Interfaz amigable para móviles con SCSS

## 🛠️ Stack Tecnológico

- **Framework**: Angular 19+ con componentes standalone
- **Estilos**: SCSS con diseño responsivo
- **HTTP Client**: Angular HttpClient con interceptores
- **Formularios**: Formularios reactivos con validación
- **Enrutamiento**: Angular Router con lazy loading
- **Comunicación**: PostMessage API para comunicación iframe

## 🚀 Servidor de Desarrollo

Para iniciar un servidor de desarrollo local, ejecuta:

```bash
ng serve
```

Una vez que el servidor esté ejecutándose, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques cualquiera de los archivos fuente.

## 🏗️ Construcción

Para construir el proyecto ejecuta:

```bash
ng build
```

Esto compilará tu proyecto y almacenará los artefactos de construcción en el directorio `dist/`. Por defecto, la construcción de producción optimiza tu aplicación para rendimiento y velocidad.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
