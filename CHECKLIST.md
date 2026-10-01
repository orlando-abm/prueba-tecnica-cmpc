# Prueba Técnica CMPC — Full Stack

Lea atentamente los enunciados. Si tiene que hacer supuestos explíquelos y fundamente sus respuestas. Considere todo lo necesario para que lo que se le pide funcione en un ambiente productivo real.

> No esperamos que complete absolutamente todo. Valoramos especialmente la arquitectura, la calidad del código y las decisiones técnicas. Si alguna funcionalidad no alcanza a completarse, documente cómo la implementaría.

---

## Objetivo

Desarrollar una aplicación web completa para la tienda **CMPC-libros** que digitalice sus procesos de inventario, incluyendo funcionalidades avanzadas de gestión y análisis de datos.

**Datos de un libro:** título, autor, editorial, precio, disponibilidad, género.

---

## Checklist

### Frontend (React + TypeScript)

- [ ] Login de autenticación
- [ ] Listado de libros
  - [ ] Filtrado avanzado por género, editorial, autor y disponibilidad
  - [ ] Ordenamiento dinámico por múltiples campos
  - [ ] Paginación del lado del servidor
  - [ ] Búsqueda en tiempo real con debounce
- [ ] Formulario de alta/edición de libro
  - [ ] Validación reactiva de formularios
  - [ ] Carga de imagen por libro
- [ ] Vista de detalle de un libro
- [ ] Manejo de errores

### Backend (NestJS + TypeScript)

- [ ] Arquitectura modular y escalable (principios SOLID)
- [ ] Sistema de autenticación JWT
- [ ] Endpoints RESTful CRUD de libros
- [ ] Endpoint de exportación CSV
- [ ] Soft delete
- [ ] Sistema de logging para auditoría
- [ ] Interceptores para transformación de respuestas
- [ ] Manejo de errores

### Base de Datos (PostgreSQL)

- [ ] ORM: Prisma o Drizzle
- [ ] Modelo de datos normalizado con relaciones e índices
- [ ] Migraciones
- [ ] Transacciones en operaciones críticas

### Testing

- [ ] Tests unitarios — componentes y servicios (Frontend)
- [ ] Tests unitarios — servicios y controladores (Backend)
- [ ] Cobertura ≥ 80%

### DevOps

- [ ] `docker-compose.yml` para el stack completo

### Documentación

- [ ] README.md con instrucciones de instalación, guía de uso y decisiones de arquitectura
- [ ] API documentada con Swagger/OpenAPI
- [ ] Diagrama de arquitectura del sistema
- [ ] Modelo relacional de la base de datos

---

## Criterios de Evaluación

- Calidad y legibilidad del código
- Arquitectura y escalabilidad
- Rendimiento y optimización
- Cobertura y calidad de los tests
- Usabilidad y experiencia de usuario
- Documentación y facilidad de despliegue
- Uso apropiado de patrones de diseño y mejores prácticas
