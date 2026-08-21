# Sweet Proposal

Diseño y Componentes:

Una tarjeta central flotante con un GIF o imagen animada linda en la parte superior.

Un título principal que diga: '¿Te gustaría salir conmigo? ❤️'.

Dos botones en la parte inferior: uno principal rosa/rojo que dice '¡Sí!' y uno secundario gris que dice 'No'.

Lógica Interactiva:

Cada vez que el usuario presione el botón 'No', la imagen debe cambiar a un GIF de un personaje triste/sorprendido.

El texto del botón 'No' debe cambiar en orden por frases divertidas (ej: '¿De verdad?', '¿Estás segura?', '¡Piénsalo bien!', 'Mira el otro botón... 💖', '¡Por favor! 🥺').

En cada clic en 'No', el botón 'Sí' debe aumentar gradualmente de tamaño (fuente y padding) hasta ocupar casi toda la pantalla. Si las frases del 'No' terminan, deben reiniciarse en ciclo, pero el botón 'Sí' sigue creciendo.

Al hacer clic en 'Sí', oculta la tarjeta principal con una transición suave y muestra una tarjeta de éxito con un GIF de celebración, confeti animado en pantalla (usando canvas-confetti) y el mensaje: '¡Sabía que dirías que sí! 🥰'.

Integra una función para enviar una notificación HTTP POST en segundo plano al hacer clic en 'Sí' hacia un webhook o endpoint configurado." BIEN Y MEJORADO TAN BONITO COMO PARA HACER LLORAR

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://salimosbb.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4cb2550a-553d-4844-a264-2b3a7897c370).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
