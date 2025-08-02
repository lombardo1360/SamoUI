# Copilot Instructions - ConvenioRecaudoApp

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an Angular application designed to be embedded as an iframe within another application. The app provides CRUD operations for ConvenioRecaudo management with JWT authentication.

## Key Features
- **Iframe Integration**: Designed to be embedded in parent applications
- **JWT Authentication**: Token-based authentication received from parent application
- **CRUD Operations**: Full Create, Read, Update, Delete operations for ConvenioRecaudo
- **API Integration**: RESTful API communication with Blazor backend
- **Responsive Design**: Mobile-friendly interface with SCSS styling

## Technical Stack
- **Framework**: Angular 19+ with standalone components
- **Styling**: SCSS with responsive design
- **HTTP Client**: Angular HttpClient with interceptors
- **Forms**: Reactive forms with validation
- **Routing**: Angular Router with lazy loading
- **Communication**: PostMessage API for iframe communication

## Development Guidelines

### Code Style
- Use standalone components instead of NgModules
- Implement reactive forms for all user inputs
- Follow Angular style guide conventions
- Use TypeScript strict mode
- Implement proper error handling and loading states

### API Integration
- All API responses follow the format: `{ codigo: number, mensaje: string, datos: T }`
- Use interceptors for authentication headers
- Implement proper error handling for HTTP requests
- Use interfaces for type safety

### Iframe Communication
- Use PostMessage API for parent-child communication
- Implement message types: AUTH_TOKEN, LOGOUT, NAVIGATE, etc.
- Handle authentication token reception from parent
- Notify parent of important events (errors, navigation, etc.)

### Component Structure
- Use service layer for API communication
- Implement loading and error states in components
- Use reactive forms with proper validation
- Follow container/presentation component pattern

### Authentication
- Token received from parent application via PostMessage
- Store token in localStorage for HTTP requests
- Handle token expiration and renewal
- Implement proper logout functionality

## File Structure Conventions
- `src/app/services/` - Business logic and API communication
- `src/app/components/` - Reusable UI components
- `src/app/pages/` - Route-level components
- `src/app/interfaces/` - TypeScript interfaces and types
- `src/app/interceptors/` - HTTP interceptors
- `src/app/guards/` - Route guards (if needed)

## Best Practices
- Use OnPush change detection when possible
- Implement proper memory leak prevention (unsubscribe)
- Use Angular Material or custom components for consistent UI
- Implement accessibility features (ARIA labels, keyboard navigation)
- Write unit tests for business logic
- Use environment variables for configuration

## Common Patterns
- Service injection in constructors
- Observable-based data flow
- Form validation with custom validators
- Error handling with try-catch and RxJS operators
- Loading states with boolean flags
- Responsive design with CSS Grid and Flexbox
