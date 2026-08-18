/* Verificación independiente: precios de la web vs. precios leídos en las capturas */
import { readFileSync } from 'fs';
import vm from 'vm';
const ctx = { window:{}, console };
vm.createContext(ctx);
vm.runInContext(readFileSync('./data/services.js','utf8'), ctx);
const DATA = ctx.window.ISIS_DATA;
const byName = new Map(DATA.services.map(s=>[s.name, s]));
const T = `
Masaje Relajante Personalizado|989|1899
Masaje Descontracturante|1102|2000
Masaje de Pindas Calientes|989|1899
Masaje de Piedras Calientes|1102|2000
Masaje Hawaiano Lomi Lomi|1074|2000
Reflexología|452|896
Baño de Jacuzzi con Sales Epsom|1470|2769
Reconexión Superior|876|1699
Espalda en Armonía|876|1699
Ritual ISIS|2199|4273
Feliz Aniversario|2133|4249
Ritual de Descanso|1639|3276
Terapia de Amor|1639|3276
Ritual Luna|1413|2825
Ritual Esencia Vital|2199|3853
Experiencia Tú y Yo|1799|3389
Baño de Diosa|2299|4294
Day Spa|2860|5340
Mamá Primeriza|3250|6199
Baño de Sonido · Cuencos Tibetanos|390|749
Nuestro Tiempo|1582|2995
Pausa Sagrada|1470|2700
`.trim().split('\n').map(l=>l.split('|'));
const S = `
Limpieza Profunda|1200
Hidratación|900
Facial Anti Edad · Efecto Lifting|1017
Facial Anti Acné|1353
Celluma · Luz LED|850
Adiós Líneas de Expresión|1600
Despigmentación|848
Laminado de Cejas · Depilación con cera · Henna|622
Pestañas Clásicas|780
Pestañas Hawaianas|1254
Volumen Tecnológico|1413
Efecto Mojado|1130
Mega Volumen|1695
Color Café|1695
Lifting de Pestañas · Pigmentación de Ceja Premium|622
Gel en Manos|250
Gel en Pies|280
Gel en Acrílico|100
Baño de Acrílico|380
Polly Gel|650
Retiro de Gel|60
Retiro de Rubber|80
Retiro de Acrílico|150
Retoque Acrílico|450
Reposición de Uña Acrílica|80
Manicure Ruso|320
Manicure Clásico + Exfoliación|420
Pedicure Clásico + Exfoliación|580
Pedicure Spa|730
Manicure Spa|500
Jelly Spa|350
Francés · Set Completo|150
Efecto · Set Completo|100
Trazos / Líneas|17
Rubber|350
Pedrería|7
Relieve 3D|50
Degradado|150
Vita Base|80
Combo ISIS|980
Combo Luna|850
Combo Deluxe|1100
Combo Zeus|555
Corte / Lavado con Tratamiento Especializado|735
Planchado Express|283
Cóctel de Hidratación|746
Cóctel Anti Frizz|735
Clase Suelta|250
Paquete 4 Clases|650
Paquete 8 Clases|1150
Paquete 12 Clases|1500
`.trim().split('\n').map(l=>l.split('|'));
const F = `
Escultural|650
Baby Boomer|750
Peinados|452
Tintes|735
`.trim().split('\n').map(l=>l.split('|'));
const P = `
Lipo sin Cirugía|1102|9916
Levantamiento de Glúteo|881|7933
Adiós Celulitis · Glúteos y Piernas|1500|13300
`.trim().split('\n').map(l=>l.split('|'));


let fails=0, checked=0; const bad=[];
const get = n => byName.get(n);
for (const [n,ind,cpl] of T){ checked++; const s=get(n);
  if(!s){bad.push('NO ENCONTRADO: '+n);fails++;continue}
  if(s.priceIndividual!==+ind){bad.push(`${n}: individual ${s.priceIndividual} != ${ind}`);fails++}
  if(s.priceCouple!==+cpl){bad.push(`${n}: pareja ${s.priceCouple} != ${cpl}`);fails++} }
for (const [n,pr] of S){ checked++; const s=get(n);
  if(!s){bad.push('NO ENCONTRADO: '+n);fails++;continue}
  if(s.price!==+pr){bad.push(`${n}: precio ${s.price} != ${pr}`);fails++} }
for (const [n,pr] of F){ checked++; const s=get(n);
  if(!s){bad.push('NO ENCONTRADO: '+n);fails++;continue}
  if(s.priceFrom!==+pr){bad.push(`${n}: desde ${s.priceFrom} != ${pr}`);fails++} }
for (const [n,ind,pk] of P){ checked++; const s=get(n);
  if(!s){bad.push('NO ENCONTRADO: '+n);fails++;continue}
  if(s.priceIndividual!==+ind){bad.push(`${n}: individual ${s.priceIndividual} != ${ind}`);fails++}
  if(s.pricePack!==+pk){bad.push(`${n}: paquete ${s.pricePack} != ${pk}`);fails++} }
for (const n of ['Elimina Grasa Abdominal','Nanoplastia','Mano Alzada']){ checked++; const s=get(n);
  const nul = s && (s.price===null || s.pricePack===null);
  if(!nul){bad.push(n+': deberia estar como Consultar (null)');fails++} }

// cobertura: ningun servicio con precio sin verificar
const verified = new Set([...T,...S,...F,...P].map(a=>a[0]).concat(['Elimina Grasa Abdominal','Nanoplastia','Mano Alzada']));
const missing = DATA.services.filter(s=>!verified.has(s.name)).map(s=>s.name);

console.log(`Tratamientos en la web: ${DATA.services.length}`);
console.log(`Verificados contra las capturas: ${checked}`);
console.log(`Discrepancias: ${fails}`);
if (missing.length) console.log('Sin verificar:', missing.join(' | '));
bad.forEach(x=>console.log('  X '+x));
if (!fails && !missing.length) console.log('\nTODO COINCIDE. Ningun precio inventado.');
