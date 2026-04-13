import fs from 'fs';
import https from 'https';
import path from 'path';
import sharp from 'sharp';
import csv from 'csv-parser';

const CSV_FILE = 'ejercicios_gemfit_perfecto.csv';
const OUTPUT_FOLDER = './public/exercises'; 

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

const crearSlug = (texto) => {
    if (!texto) return null;
    return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

console.log('🚀 Iniciando proceso...');

const descargarYConvertir = (url, nombreEjercicio) => {
    if (!url || !url.startsWith('http')) return;

    const slug = crearSlug(nombreEjercicio);
    const nombreWebp = `${slug}.webp`;
    const rutaDestino = path.join(OUTPUT_FOLDER, nombreWebp);

    if (fs.existsSync(rutaDestino)) {
        return;
    }

    https.get(url, (res) => {
        if (res.statusCode !== 200) {
            console.error(`❌ Error HTTP ${res.statusCode} en: ${nombreEjercicio}`);
            return;
        }

        const transformer = sharp()
            .webp({ quality: 80 })
            .toFile(rutaDestino, (err) => {
                if (!err) {
                    console.log(`✅ Generado: ${nombreWebp}`);
                } else {
                    console.error(`❌ Error Sharp en ${nombreWebp}:`, err.message);
                }
            });

        res.pipe(transformer);
    }).on('error', (e) => {
        console.error(`⚠️ Error de red en ${nombreEjercicio}:`, e.message);
    });
};

// Contador para saber si leyó algo
let filasEncontradas = 0;

fs.createReadStream(CSV_FILE)
    .pipe(csv({ 
        separator: ';',
        // Esta función limpia las comillas de los encabezados del CSV
        mapHeaders: ({ header }) => header.replace(/['"]+/g, '').trim() 
    }))
    .on('data', (row) => {
        filasEncontradas++;
        // Ahora row.Nombre debería funcionar sin las comillas
        if (row.Nombre && row.Imagen) {
            descargarYConvertir(row.Imagen, row.Nombre);
        } else {
            console.warn(`⚠️ Fila ${filasEncontradas} incompleta:`, row);
        }
    })
    .on('error', (err) => {
        console.error('❌ Error crítico leyendo el CSV:', err);
    })
    .on('end', () => {
        console.log(`\n--- Lectura finalizada ---`);
        console.log(`Filas procesadas: ${filasEncontradas}`);
        console.log(`Si no ves mensajes de "✅ Generado", revisa si los archivos ya existen en ${OUTPUT_FOLDER}\n`);
    });