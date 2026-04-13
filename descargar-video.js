import fs from 'fs';
import https from 'https';
import path from 'path';

// 1. Guardá el JSON que copiaste de la consola en este archivo
const DATA_FILE = 'ejercicios.json';
const OUTPUT_FOLDER = './public/videos';

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

const descargarVideo = (url, nombreEjercicio) => {
    if (!url || !url.startsWith('http')) return;

    const slug = crearSlug(nombreEjercicio);
    const nombreArchivo = `${slug}.mp4`;
    const rutaDestino = path.join(OUTPUT_FOLDER, nombreArchivo);

    if (fs.existsSync(rutaDestino)) return;

    const file = fs.createWriteStream(rutaDestino);

    https.get(url, (res) => {
        if (res.statusCode !== 200) {
            console.error(`❌ Error ${res.statusCode} en: ${nombreEjercicio}`);
            file.close();
            fs.unlinkSync(rutaDestino);
            return;
        }

        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`✅ Descargado: ${nombreArchivo}`);
        });
    }).on('error', (e) => {
        console.error(`⚠️ Error en ${nombreEjercicio}:`, e.message);
        file.close();
        if (fs.existsSync(rutaDestino)) fs.unlinkSync(rutaDestino);
    });
};

// Leer y procesar el JSON
try {
    // Leemos el archivo
    let rawData = fs.readFileSync(DATA_FILE, 'utf8');

    // ESTA ES LA CLAVE: Eliminamos el BOM si existe
    if (rawData.startsWith('\uFEFF')) {
        rawData = rawData.slice(1);
    }

    const data = JSON.parse(rawData);

    console.log('🎬 Iniciando descarga masiva de videos...');

    Object.values(data.exercises).forEach(listaEjercicios => {
        listaEjercicios.forEach(ex => {
            if (ex.metadata && ex.metadata.video_url) {
                descargarVideo(ex.metadata.video_url, ex.name);
            }
        });
    });

} catch (error) {
    console.error('❌ Error al procesar el archivo JSON:', error.message);
}