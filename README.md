# Poke Arena SPA

Aplicacion web tipo juego de Pokemon construida con:

- HTML
- TailwindCSS via CDN
- JavaScript modular (sin frameworks)
- PokeAPI
- Hash routing SPA

## Funcionalidades incluidas

- Pantalla principal con lista de Pokemon (imagen, nombre, numero y tipos)
- Busqueda por nombre
- Filtro por tipo
- Tarjetas con hover, animaciones y microinteracciones
- Pantalla de detalle con imagen grande, numero, tipos oficiales, stats y habilidades
- Captura/liberacion de Pokemon en localStorage
- Modo batalla con seleccion de Pokemon, rival aleatorio, simulacion, sonido y ganador
- Mi Pokedex con coleccion capturada y opcion de eliminar
- Modo oscuro persistente
- Skeleton loading
- Lazy loading de imagenes
- Responsive para mobile y desktop

## Ejecutar localmente

Puedes abrir el archivo index.html directamente en navegador, o servirlo con un servidor estatico:

```bash
cd /home/monica/cursos/codigofacilito/devopsg3/clase5
python3 -m http.server 8080
```

Luego abre:

- http://localhost:8080

## Deploy estatico en Nginx

Copia los archivos a un directorio publico, por ejemplo /var/www/poke-arena.

Ejemplo de bloque de servidor:

```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  root /var/www/poke-arena;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

La regla try_files es importante para que el hash routing y la SPA funcionen correctamente.
