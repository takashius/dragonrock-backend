# Código no integrado en la API actual

- **`unmounted/`**: aquí puedes colocar módulos antiguos (por ejemplo carpetas con `store` / `controller` / `network` en JavaScript) que aún no pasan por `composition/` y la arquitectura por capas.

Ese código **no** forma parte del arranque ni del `tsconfig`: sirve solo como referencia o para migración gradual. Cuando un módulo esté listo, conviene moverlo a `application/`, `infrastructure/` y `presentation/http/` como el resto del proyecto.
