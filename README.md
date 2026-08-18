# ISIS SPA · Belleza Infinita — demo web

Demo estática, sin build step. Se abre con cualquier servidor de archivos.

## Cómo verla

**Doble clic en `index.html`.** Ya está: no hay build step, ni dependencias, ni CDN.

Si prefieres servirla por HTTP (recomendado para medir rendimiento real):

```bash
python3 -m http.server 8080   # o:  npx serve .
```

y abre `http://localhost:8080`.

## Estructura

```
index.html                 estructura semántica y SEO
css/main.css               sistema de diseño completo
data/services.js           ← EL CATÁLOGO (precios, tratamientos, contacto)
data/images.js             manifiesto de imágenes (generado)
js/ui.js                   helpers: <picture>, precios, links de WhatsApp
js/render.js               render de cada sección a partir de los datos
js/booking.js              agenda: calendario, horarios y mensaje de WhatsApp
js/main.js                 interacción + animación (GSAP / Lenis)
assets/images/             fotografía optimizada (AVIF + WebP, 4 tamaños)
assets/fonts/              Jost variable, self-hosted (redonda + itálica)
vendor/                    GSAP, ScrollTrigger, Lenis (locales, sin CDN)
build-images.py            regenera assets/images + data/images.json desde _src/
CATALOGO-EXTRAIDO.md       transcripción de las capturas del catálogo actual
```

## Tipografía

Una sola familia: **Jost** variable (100–900, redonda e itálica), self-hosted.
El registro sigue la referencia de imagemethod.org:

| Uso | Peso | Caja | Tracking |
|---|---|---|---|
| Titulares (`.display`) | 200 | normal | −0.028em |
| Nombres de tratamiento | 250 | normal | −0.018em |
| Cuerpo (`body`, `.lede`) | 300 | normal | +0.006em |
| Etiquetas, nav, botones | 400 | MAYÚSCULAS | +0.22 – 0.24em |
| Frases de acento | 200 itálica | normal | −0.026em |

Los titulares van en caja baja, no en mayúsculas: es lo que da el tono contenido.
Ojo con `overflow:hidden` en las máscaras de línea — Jost tiene descendentes largas
y `line-height` menor que 1, por eso `.ln` lleva `padding-bottom:.18em`.

## Agenda: fecha y hora antes de WhatsApp

Cada CTA de agendar abre `js/booking.js` en vez de saltar directo a WhatsApp.
El visitante elige modalidad (cuando aplica), fecha y hora, y el mensaje se arma solo:

```
Hola ISIS SPA 👋
Me interesa Masaje Relajante Personalizado (en pareja).
¿Tienen disponibilidad el sábado 22 de agosto a las 16:00?
```

Reglas, todas en las constantes al inicio de `js/booking.js`:

```js
const OPEN_HOUR  = 10;   // primera cita
const LAST_START = 18;   // última cita (cierre 19:00)
const STEP_MIN   = 30;   // intervalo entre horarios
const CLOSED_DOW = [0];  // domingo cerrado
const MAX_MONTHS = 4;    // hasta cuántos meses se puede agendar
```

- Los domingos y los días pasados quedan deshabilitados.
- Si el día elegido es hoy, se ocultan las horas con menos de una hora de margen.
- **Yoga usa el horario real de clases**: al elegir un día solo aparece la clase de
  ese día (por ejemplo miércoles → 19:00 Yoga Aéreo), tomada de `yogaSchedule`.
- Sigue existiendo "Escribir sin agendar" para quien prefiera solo mandar mensaje.

No hay backend: es una solicitud de disponibilidad, y el propio panel lo dice.

## Cambiar el número de WhatsApp

Una sola línea, en `data/services.js`:

```js
export const SPA_WHATSAPP_NUMBER = '525523337800';
```

Todos los CTAs (`Agendar`, `Quiero este tratamiento`, botón flotante, footer)
se generan desde ahí con `waLink()`.

## Cambiar precios o tratamientos

Todo el catálogo vive en el array `services` de `data/services.js`:

```js
{
  id: 'masaje-relajante',        // único, se usa en el enlace del drawer
  cat: 'masajes',                // id de la categoría
  group: 'Masajes',              // subgrupo dentro de la categoría (opcional)
  featured: true,                // aparece entre los destacados
  couple: true,                  // aparece en la sección de parejas
  name: 'Masaje Relajante Personalizado',
  desc: '…',
  includes: ['Sauna', '…'],      // se listan en la ficha
  duration: '50 min',
  priceIndividual: 989,
  priceCouple: 1899,
  // alternativas: price / priceFrom / pricePack + packLabel
  image: 'masaje-aceite'         // clave de data/images.json
}
```

`null` en cualquier precio se pinta como **Consultar**.

### Pendientes de confirmar (marcados como *Consultar*)

Estos tres datos quedaron cortados o ilegibles en las capturas y **no se inventaron**:

1. `Elimina Grasa Abdominal` → precio del paquete de 10 sesiones
2. `Combo Deluxe` (nails) → inclusiones exactas más allá de Manicure Spa + Pedicure Spa
3. `Mano Alzada` (decoración) → precio

## Añadir o cambiar fotografías

1. Deja el JPG original (≥2400 px de ancho) en `_src/`
2. Añade una entrada a `MAP` en `build-images.py`: `("slot", "fragmento-del-nombre", "texto alt")`
3. `python3 build-images.py` y luego regenera `data/images.js` desde `data/images.json`

Genera AVIF + WebP en 640/1024/1600/2400 px y calcula el LQIP en base64.
En el HTML/JS solo se referencia el *slot*, nunca una ruta.

## Rendimiento

- AVIF con fallback WebP, `srcset` + `sizes` en todas las imágenes
- `preload` solo del hero; `loading="lazy"` en todo lo que va debajo
- Fuentes variables self-hosted con `unicode-range` y `font-display:swap`
- GSAP, ScrollTrigger y Lenis servidos localmente (sin CDN externo)
- `prefers-reduced-motion`: desactiva preloader, smooth scroll, parallax y cursor

## Notas

- Es una **demo**: no hay pasarela de pago, checkout ni envíos. Todo reserva por WhatsApp.
- La fotografía proviene de Unsplash (licencia Unsplash) y está descargada localmente.
- Las capturas del catálogo actual se usaron **solo** para extraer información;
  ninguna aparece en la web.

## Verificación

```bash
node verify-precios.mjs
```

Compara, uno a uno, los 83 precios del sitio contra los transcritos de las
capturas (`CATALOGO-EXTRAIDO.md`). Debe reportar **0 discrepancias**.
