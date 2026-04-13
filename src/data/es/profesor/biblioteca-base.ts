// Auto-generated from exercises.json
// Generated: 2026-04-13T06:14:06.771Z
// This file is the SSOT (Single Source of Truth) for gym exercises

export interface ExerciseVariant {
  nombre: string;
  descripcion: string;
  media_url: string;
  video_url: string;
}

export interface BaseExercise {
  nombre: string;
  descripcion: string;
  media_url: string;
  video_url: string;
  category: string;
  tags: string[];
  variants: ExerciseVariant[];
}

export const baseExercises: BaseExercise[] = [
  {
    "nombre": "Abdominales",
    "descripcion": "Ejercicio muy efectivo a la hora de trabajar el abdomen, ya que vamos a realizar dos movimientos, el crunch cruzado y la elevacion de piernas alternadas, podemos trabajarlo con repeticiones altas y lograr un muy buen estimulo en la musculatura abdominal",
    "media_url": "/exercises/abdominales-bicicletas.webp",
    "video_url": "/videos/abdominales-bicicletas.mp4",
    "category": "Abdominales",
    "tags": [
      "core",
      "abdominales"
    ],
    "variants": [
      {
        "nombre": "Abdominales bicicletas",
        "descripcion": "Ejercicio muy efectivo a la hora de trabajar el abdomen, ya que vamos a realizar dos movimientos, el crunch cruzado y la elevacion de piernas alternadas, podemos trabajarlo con repeticiones altas y lograr un muy buen estimulo en la musculatura abdominal",
        "media_url": "/exercises/abdominales-bicicletas.webp",
        "video_url": "/videos/abdominales-bicicletas.mp4"
      },
      {
        "nombre": "Abdominales bisagras",
        "descripcion": "Es un muy buen ejercicio que combina la flexión y rotación de la columna y ademas lo acompañamos con la elevación de las piernas, nos va a permitir trabajar todo el abdomen de manera muy eficiente",
        "media_url": "/exercises/abdominales-bisagras.webp",
        "video_url": "/videos/abdominales-bisagras.mp4"
      }
    ]
  },
  {
    "nombre": "Crunch",
    "descripcion": "Es un ejercicio básico para todo el abdomen, ya que realiza la acción principal que es la de flexionar la columna, lo vamos a sentir mucho mas en la parte mas alta del abdomen",
    "media_url": "/exercises/crunch-corto-con-peso.webp",
    "video_url": "/videos/crunch-corto-con-peso.mp4",
    "category": "Abdominales",
    "tags": [
      "core",
      "abdominales"
    ],
    "variants": [
      {
        "nombre": "Crunch corto con peso",
        "descripcion": "Es un ejercicio básico para todo el abdomen, ya que realiza la acción principal que es la de flexionar la columna, lo vamos a sentir mucho mas en la parte mas alta del abdomen",
        "media_url": "/exercises/crunch-corto-con-peso.webp",
        "video_url": "/videos/crunch-corto-con-peso.mp4"
      },
      {
        "nombre": "Crunch corto en colchoneta",
        "descripcion": "Es un ejercicio básico para todo el abdomen, ya que realiza la acción principal que es la de flexionar la columna, lo vamos a sentir mucho mas en la parte mas alta del abdomen",
        "media_url": "/exercises/crunch-corto-en-colchoneta.webp",
        "video_url": "/videos/crunch-corto-en-colchoneta.mp4"
      },
      {
        "nombre": "Crunch en polea con soga",
        "descripcion": "Es un ejercicio básico para todo el abdomen, ya que realiza la acción principal que es la de flexionar la columna, lo vamos a sentir mucho mas en la parte mas alta del abdomen",
        "media_url": "/exercises/crunch-en-polea-con-soga.webp",
        "video_url": "/videos/crunch-en-polea-con-soga.mp4"
      }
    ]
  },
  {
    "nombre": "Elevacion",
    "descripcion": "Ejercicio muy efectivo para trabajar la parte mas baja del abdomen, lo vamos a trabajar con repeticiones mas altas y generar una tensión continua al no tocar el suelo con las piernas",
    "media_url": "/exercises/elevacion-de-piernas-acostado.webp",
    "video_url": "/videos/elevacion-de-piernas-acostado.mp4",
    "category": "Abdominales",
    "tags": [
      "core",
      "abdominales"
    ],
    "variants": [
      {
        "nombre": "Elevacion de piernas acostado",
        "descripcion": "Ejercicio muy efectivo para trabajar la parte mas baja del abdomen, lo vamos a trabajar con repeticiones mas altas y generar una tensión continua al no tocar el suelo con las piernas",
        "media_url": "/exercises/elevacion-de-piernas-acostado.webp",
        "video_url": "/videos/elevacion-de-piernas-acostado.mp4"
      },
      {
        "nombre": "Elevación de cadera a una pierna",
        "descripcion": "Las elevaciones de cadera son excelentes a la hora de trabajar los gluteos, ya que nos van a permitir trabajar la parte del glúteo mayor, al estar en el suelo su recorrido puede ser mas corto, pero el beneficio es que nos va a permitir realizar una progresión para luego llegar a trabajar una elevación de cadera con barra o en maquina",
        "media_url": "/exercises/elevacion-de-cadera-a-una-pierna.webp",
        "video_url": "/videos/elevacion-de-cadera-a-una-pierna.mp4"
      },
      {
        "nombre": "Elevación de cadera en el suelo",
        "descripcion": "Las elevaciones de cadera son excelentes a la hora de trabajar los gluteos, ya que nos van a permitir trabajar la parte del glúteo mayor, al estar en el suelo su recorrido puede ser mas corto, pero el beneficio es que nos va a permitir realizar una progresión para luego llegar a trabajar una elevación de cadera con barra o en maquina",
        "media_url": "/exercises/elevacion-de-cadera-en-el-suelo.webp",
        "video_url": "/videos/elevacion-de-cadera-en-el-suelo.mp4"
      },
      {
        "nombre": "Elevación de cadera en máquina Smith",
        "descripcion": "Es un ejercicio básico para el desarrollo de los glúteos, vamos a trabajar la parte del glúteo mayor, gracias a la fuerza del músculo y su corto recorrido vamos a poder trabajarlo con cargas más altas",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/gluteos/elevacion-de-cadera-en-maquina-smith/image.jpg",
        "video_url": "/videos/elevacion-de-cadera-en-maquina-smith.mp4"
      },
      {
        "nombre": "Elevación de cadera libre",
        "descripcion": "Es un ejercicio básico para el desarrollo de los glúteos, vamos a trabajar la parte del glúteo mayor, gracias a la fuerza del músculo y su corto recorrido vamos a poder trabajarlo con cargas más altas",
        "media_url": "/exercises/elevacion-de-cadera-libre.webp",
        "video_url": "/videos/elevacion-de-cadera-libre.mp4"
      }
    ]
  },
  {
    "nombre": "Plancha",
    "descripcion": "Las planchas son una excelente opción a la hora de trabajar el abdomen de manera isométrica, lo mas importante es mantener una posición estática con el tronco y apretar bien fuerte todo el abdomen",
    "media_url": "/exercises/plancha-extiendiendo-brazo.webp",
    "video_url": "/videos/plancha-extiendiendo-brazo.mp4",
    "category": "Abdominales",
    "tags": [
      "core",
      "abdominales"
    ],
    "variants": [
      {
        "nombre": "Plancha extiendiendo brazo",
        "descripcion": "Las planchas son una excelente opción a la hora de trabajar el abdomen de manera isométrica, lo mas importante es mantener una posición estática con el tronco y apretar bien fuerte todo el abdomen",
        "media_url": "/exercises/plancha-extiendiendo-brazo.webp",
        "video_url": "/videos/plancha-extiendiendo-brazo.mp4"
      },
      {
        "nombre": "Planchas dinamicas",
        "descripcion": "Las planchas son una excelente opción a la hora de trabajar el abdomen de manera isométrica, lo mas importante es mantener una posición estática con el tronco y apretar bien fuerte todo el abdomen",
        "media_url": "/exercises/planchas-dinamicas.webp",
        "video_url": "/videos/planchas-dinamicas.mp4"
      },
      {
        "nombre": "Planchas estaticas",
        "descripcion": "Las planchas son una excelente opción a la hora de trabajar el abdomen de manera isométrica, lo mas importante es mantener una posición estática con el tronco y apretar bien fuerte todo el abdomen",
        "media_url": "/exercises/planchas-estaticas.webp",
        "video_url": "/videos/planchas-estaticas.mp4"
      }
    ]
  },
  {
    "nombre": "Abduccion",
    "descripcion": "Es un ejercicio accesorio el cual nos va a permitir desarrollar la musculatura del gluteo medio, lo vamos a trabajar con cargas moderadas o bajas, para lograr un aumento en las repeticiones, y de esa manera lograr un mayor tiempo bajo tension",
    "media_url": "/exercises/abduccion-en-maquina.webp",
    "video_url": "/videos/abduccion-en-maquina.mp4",
    "category": "Abductores y aductores",
    "tags": [
      "tren inferior",
      "piernas",
      "abductores"
    ],
    "variants": [
      {
        "nombre": "Abduccion en maquina",
        "descripcion": "Es un ejercicio accesorio el cual nos va a permitir desarrollar la musculatura del gluteo medio, lo vamos a trabajar con cargas moderadas o bajas, para lograr un aumento en las repeticiones, y de esa manera lograr un mayor tiempo bajo tension",
        "media_url": "/exercises/abduccion-en-maquina.webp",
        "video_url": "/videos/abduccion-en-maquina.mp4"
      },
      {
        "nombre": "Abduccion en polea",
        "descripcion": "Es un ejercicio accesorio el cual nos va a permitir desarrollar la musculatura del gluteo medio, lo vamos a trabajar con cargas moderadas o bajas, para lograr un aumento en las repeticiones, y de esa manera lograr un mayor tiempo bajo tension",
        "media_url": "/exercises/abduccion-en-polea.webp",
        "video_url": "/videos/abduccion-en-polea.mp4"
      },
      {
        "nombre": "Abducción con tobilleras",
        "descripcion": "Es un ejercicio accesorio, el cual nos va a permitir desarrollar el glúteo medio, lo vamos a trabajar con cargas bajas y repeticiones mucho más altas,para generar esa sensación de quemazón y así aumentar el tiempo bajo tensión",
        "media_url": "/exercises/abduccion-con-tobilleras.webp",
        "video_url": "/videos/abduccion-con-tobilleras.mp4"
      },
      {
        "nombre": "Abducción en polea",
        "descripcion": "Es un ejercicio accesorio el cual nos va a permitir desarrollar la musculatura del gluteo medio, lo vamos a trabajar con cargas moderadas o bajas, para lograr un aumento en las repeticiones, y de esa manera lograr un mayor tiempo bajo tension",
        "media_url": "/exercises/abduccion-en-polea.webp",
        "video_url": "/videos/abduccion-en-polea.mp4"
      }
    ]
  },
  {
    "nombre": "Aductor",
    "descripcion": "Es un ejercicio en el cual vamos a trabajar los músculos aductores, son muy importantes ya que nos van a dar forma en la parte interior de la pierna, lo vamos a realizar con carga moderada y realizando repeticiones altas, de esta manera logramos un muy buen trabajo en dicha musculatura ",
    "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/abductores-y-aductores/aductor-en-maquina/image.jpg",
    "video_url": "/videos/aductor-en-maquina.mp4",
    "category": "Abductores y aductores",
    "tags": [
      "tren inferior",
      "piernas",
      "abductores"
    ],
    "variants": [
      {
        "nombre": "Aductor en maquina",
        "descripcion": "Es un ejercicio en el cual vamos a trabajar los músculos aductores, son muy importantes ya que nos van a dar forma en la parte interior de la pierna, lo vamos a realizar con carga moderada y realizando repeticiones altas, de esta manera logramos un muy buen trabajo en dicha musculatura ",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/abductores-y-aductores/aductor-en-maquina/image.jpg",
        "video_url": "/videos/aductor-en-maquina.mp4"
      },
      {
        "nombre": "Aductor en polea",
        "descripcion": "Es un ejercicio en el cual vamos a trabajar los músculos aductores, son muy importantes ya que nos van a dar forma en la parte interior de la pierna, lo vamos a realizar con carga moderada y realizando repeticiones altas, de esta manera logramos un muy buen trabajo en dicha musculatura ",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/abductores-y-aductores/aductor-en-polea/image.jpg",
        "video_url": "/videos/aductor-en-polea.mp4"
      }
    ]
  },
  {
    "nombre": "Sentadilla",
    "descripcion": "Este tipo de sentadilla nos va a permitir estimular los cuádriceps, glúteos y aductores, la vamos a trabajar con un rango de repeticiones moderadas y altas,lo mas importante es realizar una posición de pies correcta que nos permita estimular la musculatura involucrada",
    "media_url": "/exercises/sentadilla-sumo.webp",
    "video_url": "/videos/sentadilla-sumo.mp4",
    "category": "Abductores y aductores",
    "tags": [
      "tren inferior",
      "piernas",
      "abductores"
    ],
    "variants": [
      {
        "nombre": "Sentadilla sumo",
        "descripcion": "Este tipo de sentadilla nos va a permitir estimular los cuádriceps, glúteos y aductores, la vamos a trabajar con un rango de repeticiones moderadas y altas,lo mas importante es realizar una posición de pies correcta que nos permita estimular la musculatura involucrada",
        "media_url": "/exercises/sentadilla-sumo.webp",
        "video_url": "/videos/sentadilla-sumo.mp4"
      },
      {
        "nombre": "Sentadilla búlgara",
        "descripcion": "Ejercicio accesorio muy bueno a la hora de estimular todo los músculos de la pierna,al trabajarlo de manera unilateral y con el pie contrario apoyado en una base, las demandas de estabilidad son muy grandes, esto va a generar un mayor trabajo y de esa manera optimizar el reclutamiento de fibras musculares",
        "media_url": "/exercises/sentadilla-bulgara.webp",
        "video_url": "/videos/sentadilla-bulgara.mp4"
      },
      {
        "nombre": "Sentadilla copa",
        "descripcion": "La sentadilla es considerada como uno de los mejores ejercicios a la hora de trabajar la pierna,vamos a estimular los cuádriceps y glúteos de una manera muy eficiente, su variabilidad en el movimiento nos permite trabajar con el propio peso corporal, con barra y con cargas altas, moderadas y livianas",
        "media_url": "/exercises/sentadilla-copa.webp",
        "video_url": "/videos/sentadilla-copa.mp4"
      },
      {
        "nombre": "Sentadilla en Smith",
        "descripcion": "La sentadilla es considerada como uno de los mejores ejercicios a la hora de trabajar la pierna,vamos a estimular los cuádriceps y glúteos de una manera muy eficiente, su variabilidad en el movimiento nos permite trabajar con el propio peso corporal, con barra y con cargas altas, moderadas y livianas",
        "media_url": "/exercises/sentadilla-en-smith.webp",
        "video_url": "/videos/sentadilla-en-smith.mp4"
      },
      {
        "nombre": "Sentadilla hack",
        "descripcion": "Ejercicio básico para el desarrollo de los cuádriceps, nos va a permitir realizar una sentadilla estable y con un muy buen rango de recorrido, podemos trabajar con repeticiones moderadas, buscando pura y exclusivamente la hipertrofia en los cuádriceps",
        "media_url": "/exercises/sentadilla-hack.webp",
        "video_url": "/videos/sentadilla-hack.mp4"
      },
      {
        "nombre": "Sentadilla libre con barra",
        "descripcion": "La sentadilla es considerada como uno de los mejores ejercicios a la hora de trabajar la pierna,vamos a estimular los cuádriceps y glúteos de una manera muy eficiente, su variabilidad en el movimiento nos permite trabajar con el propio peso corporal, con barra y con cargas altas, moderadas y livianas",
        "media_url": "/exercises/sentadilla-libre-con-barra.webp",
        "video_url": "/videos/sentadilla-libre-con-barra.mp4"
      },
      {
        "nombre": "Sentadilla libre por delante",
        "descripcion": "Excelente ejercicio para estimular los cuádriceps, gracias a su posición con la barra por delante,nos permite una postura mucho mas recta,lo cual va a estimular muy bien la parte anterior de la pierna",
        "media_url": "/exercises/sentadilla-libre-por-delante.webp",
        "video_url": "/videos/sentadilla-libre-por-delante.mp4"
      },
      {
        "nombre": "Sentadilla sumo",
        "descripcion": "Este tipo de sentadilla nos va a permitir estimular los cuádriceps, glúteos y aductores, la vamos a trabajar con un rango de repeticiones moderadas y altas,lo mas importante es realizar una posición de pies correcta que nos permita estimular la musculatura involucrada",
        "media_url": "/exercises/sentadilla-sumo.webp",
        "video_url": "/videos/sentadilla-sumo.mp4"
      },
      {
        "nombre": "Sentadilla búlgara",
        "descripcion": "Ejercicio accesorio muy bueno a la hora de estimular todo los músculos de la pierna,al trabajarlo de manera unilateral y con el pie contrario apoyado en una base, las demandas de estabilidad son muy grandes, esto va a generar un mayor trabajo y de esa manera optimizar el reclutamiento de fibras musculares",
        "media_url": "/exercises/sentadilla-bulgara.webp",
        "video_url": "/videos/sentadilla-bulgara.mp4"
      }
    ]
  },
  {
    "nombre": "Biceps",
    "descripcion": "Es un ejercicio muy eficiente para los bíceps ya que vamos a poder trabajarlo de manera unilateral y concentrarnos bien en la contracción de un brazo y luego el otro, ademas podemos realizar la supinación de la mano y de esta manera lograr una mayor activacion",
    "media_url": "/exercises/biceps-alternado-con-mancuernas.webp",
    "video_url": "/videos/biceps-alternado-con-mancuernas.mp4",
    "category": "Bíceps",
    "tags": [
      "tren superior",
      "brazos",
      "bíceps"
    ],
    "variants": [
      {
        "nombre": "Biceps alternado con mancuernas",
        "descripcion": "Es un ejercicio muy eficiente para los bíceps ya que vamos a poder trabajarlo de manera unilateral y concentrarnos bien en la contracción de un brazo y luego el otro, ademas podemos realizar la supinación de la mano y de esta manera lograr una mayor activacion",
        "media_url": "/exercises/biceps-alternado-con-mancuernas.webp",
        "video_url": "/videos/biceps-alternado-con-mancuernas.mp4"
      },
      {
        "nombre": "Biceps con barra prono",
        "descripcion": "Es un ejercicio muy eficiente para trabajar el biceps braquial y los antebrazos, lo vamos a trabajar con cargas moderadas para poder realizar una muy buena contraccion",
        "media_url": "/exercises/biceps-con-barra-prono.webp",
        "video_url": "/videos/biceps-con-barra-prono.mp4"
      },
      {
        "nombre": "Biceps en banco inclinado",
        "descripcion": "En este ejercicio vamos a trabajar con el hombro retrasado,lo cual nos va a permitir poder estimular la cabeza mas larga del bíceps, lo vamos a trabajar con cargas moderadas o bajas,para poder realizar un rango de movimiento completo",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/biceps/biceps-en-banco-inclinado/image.jpg",
        "video_url": "/videos/biceps-en-banco-inclinado.mp4"
      },
      {
        "nombre": "Biceps en banco scott",
        "descripcion": "Es un excelente ejercicio, ya que al estar con el hombro adelantado, vamos a estimular la cabeza corta del bíceps, lo vamos a realizar con cargas moderadas para realizar una muy buena contraccion durante toda la serie",
        "media_url": "/exercises/biceps-en-banco-scott.webp",
        "video_url": "/videos/biceps-en-banco-scott.mp4"
      },
      {
        "nombre": "Biceps en banco scott a un brazo",
        "descripcion": "Es una excelente opción, ya que al estar con el hombro adelantado, vamos a estimular la cabeza corta del bíceps, lo vamos a realizar con cargas moderadas para realizar una muy buena contraccion durante toda la serie",
        "media_url": "/exercises/biceps-en-banco-scott-a-un-brazo.webp",
        "video_url": "/videos/biceps-en-banco-scott-a-un-brazo.mp4"
      },
      {
        "nombre": "Biceps en polea con agarre recto",
        "descripcion": "Es una excelente opción para trabajar todas las porciones del bíceps y mantener una tensión continua, de esta manera podemos exigirnos lo máximo posible sin ningún riesgo de lesión",
        "media_url": "/exercises/biceps-en-polea-con-agarre-recto.webp",
        "video_url": "/videos/biceps-en-polea-con-agarre-recto.mp4"
      },
      {
        "nombre": "Biceps martillo con mancuernas",
        "descripcion": "Es un ejercicio vamos a trabajar con las manos en posición neutra,estimulando así el bíceps braquial,lo vamos a trabajar con cargas moderadas y bajas para poder realizar una buena contracción durante toda su ejecución",
        "media_url": "/exercises/biceps-martillo-con-mancuernas.webp",
        "video_url": "/videos/biceps-martillo-con-mancuernas.mp4"
      },
      {
        "nombre": "Biceps martillo en polea con soga",
        "descripcion": "Es un ejercicio accesorio el cual nos va a permitir trabajar el bíceps braquial y los músculos del antebrazo, podemos tener una tensión continua y lograr series al fallo o muy cerca de el",
        "media_url": "/exercises/biceps-martillo-en-polea-con-soga.webp",
        "video_url": "/videos/biceps-martillo-en-polea-con-soga.mp4"
      },
      {
        "nombre": "Biceps parado con barra",
        "descripcion": "Es un ejercicio básico para trabajar por completo los bíceps,lo vamos a trabajar con cargas moderadas y altas gracias a su libertad de movimiento",
        "media_url": "/exercises/biceps-parado-con-barra.webp",
        "video_url": "/videos/biceps-parado-con-barra.mp4"
      }
    ]
  },
  {
    "nombre": "Estocadas",
    "descripcion": "Es un excelente ejercicio para los cuádriceps y glúteos, gracias a la estabilidad que debemos tener, genera grandes demandas a nivel biomecánico y una gran activación en toda los músculos de las piernas",
    "media_url": "/exercises/estocadas-alternadas.webp",
    "video_url": "/videos/estocadas-alternadas.mp4",
    "category": "Cuádriceps",
    "tags": [
      "tren inferior",
      "piernas",
      "cuádriceps"
    ],
    "variants": [
      {
        "nombre": "Estocadas alternadas",
        "descripcion": "Es un excelente ejercicio para los cuádriceps y glúteos, gracias a la estabilidad que debemos tener, genera grandes demandas a nivel biomecánico y una gran activación en toda los músculos de las piernas",
        "media_url": "/exercises/estocadas-alternadas.webp",
        "video_url": "/videos/estocadas-alternadas.mp4"
      },
      {
        "nombre": "Estocadas caminando",
        "descripcion": "Es un excelente ejercicio para los cuádriceps y glúteos, gracias a la estabilidad que debemos tener, genera grandes demandas a nivel biomecánico y una gran activación en toda los músculos de las piernas",
        "media_url": "/exercises/estocadas-caminando.webp",
        "video_url": "/videos/estocadas-caminando.mp4"
      },
      {
        "nombre": "Estocadas fijas",
        "descripcion": "Es un excelente ejercicio para los cuádriceps y glúteos, gracias a la estabilidad que debemos tener, genera grandes demandas a nivel biomecánico y una gran activación en toda los músculos de las piernas",
        "media_url": "/exercises/estocadas-fijas.webp",
        "video_url": "/videos/estocadas-fijas.mp4"
      },
      {
        "nombre": "Estocadas hacia atrás",
        "descripcion": "Es un excelente ejercicio para los isquiotibiales y glúteos, gracias a la estabilidad que debemos tener, genera grandes demandas a nivel biomecánico y una gran activación en toda los músculos de las piernas",
        "media_url": "/exercises/estocadas-hacia-atras.webp",
        "video_url": "/videos/estocadas-hacia-atras.mp4"
      }
    ]
  },
  {
    "nombre": "Prensa",
    "descripcion": "La prensa es una excelente opción a la hora de estimular toda la pierna,ya que vamos a trabajar sentado y cómodo, esto nos va a permitir mover cargas muy altas",
    "media_url": "/exercises/prensa.webp",
    "video_url": "/videos/prensa.mp4",
    "category": "Cuádriceps",
    "tags": [
      "tren inferior",
      "piernas",
      "cuádriceps"
    ],
    "variants": [
      {
        "nombre": "Prensa",
        "descripcion": "La prensa es una excelente opción a la hora de estimular toda la pierna,ya que vamos a trabajar sentado y cómodo, esto nos va a permitir mover cargas muy altas",
        "media_url": "/exercises/prensa.webp",
        "video_url": "/videos/prensa.mp4"
      },
      {
        "nombre": "Prensa horizontal",
        "descripcion": "La prensa es una excelente opción a la hora de estimular toda la pierna,ya que vamos a trabajar sentado y cómodo, esto nos va a permitir mover cargas muy altas, en esta prensa horizontal vamos  lograr un mayor trabajo en los cuadriceps, gracias a su angulo recto, aumenta la flexion y extension de la rodilla",
        "media_url": "/exercises/prensa-horizontal.webp",
        "video_url": "/videos/prensa-horizontal.mp4"
      },
      {
        "nombre": "Prensa con pies arriba",
        "descripcion": "La prensa es una excelente opción a la hora de estimular toda la pierna,ya que vamos a trabajar sentado y cómodo, esto nos va a permitir mover cargas muy altas",
        "media_url": "/exercises/prensa-con-pies-arriba.webp",
        "video_url": "/videos/prensa-con-pies-arriba.mp4"
      }
    ]
  },
  {
    "nombre": "Sillón de cuádriceps",
    "descripcion": "Es un ejercicio de aislamiento excelente para trabajar los cuadriceps por completo, ya que vamos a realizar solamente la extensión de rodilla de manera cómoda y estable, lo vamos a realizar con cargas moderadas o bajas, para generar un mayor tiempo bajo tension ",
    "media_url": "/exercises/sillon-de-cuadriceps.webp",
    "video_url": "/videos/sillon-de-cuadriceps.mp4",
    "category": "Cuádriceps",
    "tags": [
      "tren inferior",
      "piernas",
      "cuádriceps"
    ],
    "variants": []
  },
  {
    "nombre": "Subidas al cajón",
    "descripcion": "Ejercicio muy bueno para trabajar los músculos cuádriceps de manera unilateral,si estamos realizando algún deporte, este ejercicio va a ser una excelente opción para sumarlo en la rutina de entrenamiento, ya que con el vamos a estar trabajando la fuerza y a su vez la masa muscular",
    "media_url": "/exercises/subidas-al-cajon.webp",
    "video_url": "/videos/subidas-al-cajon.mp4",
    "category": "Cuádriceps",
    "tags": [
      "tren inferior",
      "piernas",
      "cuádriceps"
    ],
    "variants": []
  },
  {
    "nombre": "Dominadas agarre abierto",
    "descripcion": "Es un excelente ejercicio de fuerza para la espalda en el cual vamos a trabajar con nuestro propio peso corporal. Nos permite trabajar en repeticiones más bajasy así generar mayor tensión mecánica",
    "media_url": "/exercises/dominadas-agarre-abierto.webp",
    "video_url": "/videos/dominadas-agarre-abierto.mp4",
    "category": "Espalda",
    "tags": [
      "tren superior",
      "espalda"
    ],
    "variants": []
  },
  {
    "nombre": "Dominadas agarre cerrado",
    "descripcion": "Es un excelente ejercicio de fuerza para la espalda en el cual vamos a trabajar con nuestro propio peso corporal. Nos permite trabajar en repeticiones más bajasy así generar mayor tensión mecánica",
    "media_url": "/exercises/dominadas-agarre-cerrado.webp",
    "video_url": "/videos/dominadas-agarre-cerrado.mp4",
    "category": "Espalda",
    "tags": [
      "tren superior",
      "espalda"
    ],
    "variants": []
  },
  {
    "nombre": "Hiperextensiones",
    "descripcion": "Es un ejercicio muy eficiente a la hora de trabajar la zona baja de nuestra espalda. Vamos a desarrollar a zona de los erectores espinales,contribuyendo a tener mayor estabilidad y fortaleza en la misma",
    "media_url": "/exercises/hiperextensiones.webp",
    "video_url": "/videos/hiperextensiones.mp4",
    "category": "Espalda",
    "tags": [
      "tren superior",
      "espalda"
    ],
    "variants": []
  },
  {
    "nombre": "Jalón",
    "descripcion": "Es un ejercicio básico para el desarrollo de los dorsales,romboides y brazos. Al ser realizado en una polea,podemos generar una tensión continua en todas las repeticiones(punto clave para la hipertofia",
    "media_url": "/exercises/jalon-al-pecho-agarre-abierto.webp",
    "video_url": "/videos/jalon-al-pecho-agarre-abierto.mp4",
    "category": "Espalda",
    "tags": [
      "tren superior",
      "espalda"
    ],
    "variants": [
      {
        "nombre": "Jalón al pecho agarre abierto",
        "descripcion": "Es un ejercicio básico para el desarrollo de los dorsales,romboides y brazos. Al ser realizado en una polea,podemos generar una tensión continua en todas las repeticiones(punto clave para la hipertofia",
        "media_url": "/exercises/jalon-al-pecho-agarre-abierto.webp",
        "video_url": "/videos/jalon-al-pecho-agarre-abierto.mp4"
      },
      {
        "nombre": "Jalón al pecho agarre cerrado",
        "descripcion": "Es un ejercicio básico para el desarrollo de los dorsales,romboides y brazos. Al ser realizado en una polea,podemos generar una tensión continua en todas las repeticiones(punto clave para la hipertofia",
        "media_url": "/exercises/jalon-al-pecho-agarre-cerrado.webp",
        "video_url": "/videos/jalon-al-pecho-agarre-cerrado.mp4"
      },
      {
        "nombre": "Jalón al pecho agarre neutro",
        "descripcion": "Es un ejercicio básico para el desarrollo de los dorsales,romboides y brazos. Al ser realizado en una polea,podemos generar una tensión continua en todas las repeticiones(punto clave para la hipertofia",
        "media_url": "/exercises/jalon-al-pecho-agarre-neutro.webp",
        "video_url": "/videos/jalon-al-pecho-agarre-neutro.mp4"
      }
    ]
  },
  {
    "nombre": "Pull over con mancuerna",
    "descripcion": "Es un excelente ejercicio de aislamiento para los músculos dorsales,nos permiten estirar y contrar la musculatura de una forma muy eficiente. Al ser un ejercicio de aislamiento lo podemos llevar a cabo con repeticiones más altas y así aumentar el tiempo bajo tensión",
    "media_url": "/exercises/pull-over-con-mancuerna.webp",
    "video_url": "/videos/pull-over-con-mancuerna.mp4",
    "category": "Espalda",
    "tags": [
      "tren superior",
      "espalda"
    ],
    "variants": []
  },
  {
    "nombre": "Pull over en polea",
    "descripcion": "Es un excelente ejercicio de aislamiento para los músculos dorsales,nos permiten estirar y contrar la musculatura de una forma muy eficiente. Al ser un ejercicio de aislamiento lo podemos llevar a cabo con repeticiones más altas y así aumentar el tiempo bajo tensión",
    "media_url": "/exercises/pull-over-en-polea.webp",
    "video_url": "/videos/pull-over-en-polea.mp4",
    "category": "Espalda",
    "tags": [
      "tren superior",
      "espalda"
    ],
    "variants": []
  },
  {
    "nombre": "Remo",
    "descripcion": "Es un ejercicio básico para el desarrollo de los músculos dorsales,romboides,erectores espinales y brazos. Al involucrar una gran cantidad de músculos nos permiten trabajar con una carga más elevada",
    "media_url": "/exercises/remo-con-barra-agarre-prono.webp",
    "video_url": "/videos/remo-con-barra-agarre-prono.mp4",
    "category": "Espalda",
    "tags": [
      "tren superior",
      "espalda"
    ],
    "variants": [
      {
        "nombre": "Remo con barra agarre prono",
        "descripcion": "Es un ejercicio básico para el desarrollo de los músculos dorsales,romboides,erectores espinales y brazos. Al involucrar una gran cantidad de músculos nos permiten trabajar con una carga más elevada",
        "media_url": "/exercises/remo-con-barra-agarre-prono.webp",
        "video_url": "/videos/remo-con-barra-agarre-prono.mp4"
      },
      {
        "nombre": "Remo con barra agarre supino",
        "descripcion": "Es un ejercicio básico para el desarrollo de los músculos dorsales,romboides,erectores espinales y brazos. Al involucrar una gran cantidad de músculos nos permiten trabajar con una carga más elevada",
        "media_url": "/exercises/remo-con-barra-agarre-supino.webp",
        "video_url": "/videos/remo-con-barra-agarre-supino.mp4"
      },
      {
        "nombre": "Remo con mancuerna",
        "descripcion": "Es un excelente ejercicio que lo vamos a trabajar siempre de manera unilateral(a un brazo). Al realizarlo apoyado en un banco nos va a permitir trabajarlo con una carga alta y poder generar mayor tension en los dorsales ",
        "media_url": "/exercises/remo-con-mancuerna.webp",
        "video_url": "/videos/remo-con-mancuerna.mp4"
      },
      {
        "nombre": "Remo con mancuernas en banco inclinado",
        "descripcion": "Es un ejercicio muy efectivo a la hora de trabajar la espalda, ya que nos vamos a poder enfocar en el estiramiento y acortamiento de los musculos dorsales, lo vamos a realizar con cargas moderadas, ya que lo mas importante es generar una tension constante durante sus dos fases",
        "media_url": "/exercises/remo-con-mancuernas-en-banco-inclinado.webp",
        "video_url": "/videos/remo-con-mancuernas-en-banco-inclinado.mp4"
      },
      {
        "nombre": "Remo en barra t con agarre abierto",
        "descripcion": "Es en ejercicio muy eficiente para trabajar la espalda, ya que nos va a permitir realizar el movimiento con el tronco apoyado, esto nos va ayudar a no generar un mal movimiento o dolencia en otra zona que no queremos. Al trabajar con un agarre abierto,vamos a poder sentir mucho mejor la parte más alta de la espalda        ",
        "media_url": "/exercises/remo-en-barra-t-con-agarre-abierto.webp",
        "video_url": "/videos/remo-en-barra-t-con-agarre-abierto.mp4"
      },
      {
        "nombre": "Remo en barra t con agarre cerrado",
        "descripcion": "Es un ejercicio muy eficiente para trabajar la espalda, ya que nos va a permitir realizar el movimiento con el tronco apoyado, esto nos va ayudar a no generar un mal movimiento o dolencia en otra zona que no queremos. Al trabajar con un agarre cerrado,podemos transferir más fuerza hacia nuestros dorsales",
        "media_url": "/exercises/remo-en-barra-t-con-agarre-cerrado.webp",
        "video_url": "/videos/remo-en-barra-t-con-agarre-cerrado.mp4"
      },
      {
        "nombre": "Remo en máquina agarre abierto",
        "descripcion": "Es una excelente opción a la hora de trabajar toda la musculatura de la espalda,ya que nos permiten trabajar de manera cómoda y estable. Podemos trabajar con ambas cargas,altas y moderadas",
        "media_url": "/exercises/remo-en-maquina-agarre-abierto.webp",
        "video_url": "/videos/remo-en-maquina-agarre-abierto.mp4"
      },
      {
        "nombre": "Remo en máquina agarre cerrado",
        "descripcion": "Es una excelente opción a la hora de trabajar toda la musculatura de la espalda,ya que nos permiten trabajar de manera cómoda y estable. Podemos trabajar con ambas cargas,altas y moderadas",
        "media_url": "/exercises/remo-en-maquina-agarre-cerrado.webp",
        "video_url": "/videos/remo-en-maquina-agarre-cerrado.mp4"
      },
      {
        "nombre": "Remo en maquina unilateral",
        "descripcion": "Es una excelente opción a la hora de trabajar toda la musculatura de la espalda,ya que nos permiten trabajar de manera cómoda y estable. Podemos trabajar con ambas cargas,altas y moderadas",
        "media_url": "/exercises/remo-en-maquina-unilateral.webp",
        "video_url": "/videos/remo-en-maquina-unilateral.mp4"
      },
      {
        "nombre": "Remo en polea baja",
        "descripcion": "Es un ejercicio muy eficiente para trabajar la musculatura de la espalda,nos permiten estirar y contraer toda su musculatura gracias a su libertad de movimiento, lo vamos a trabajar con cargas moderadas para generar una tension continua durante toda la serie",
        "media_url": "/exercises/remo-en-polea-baja.webp",
        "video_url": "/videos/remo-en-polea-baja.mp4"
      },
      {
        "nombre": "Remo en polea baja a un brazo",
        "descripcion": "Es un ejercicio muy eficiente para trabajar la musculatura de la espalda,nos permiten estirar y contraer toda su musculatura gracias a su libertad de movimiento, lo vamos a trabajar con cargas moderadas para generar una tension continua durante toda la serie",
        "media_url": "/exercises/remo-en-polea-baja-a-un-brazo.webp",
        "video_url": "/videos/remo-en-polea-baja-a-un-brazo.mp4"
      }
    ]
  },
  {
    "nombre": "Gemelos",
    "descripcion": "Las extensiones de tobillos son la mejor opción a la hora de trabajar la musculatura de los gemelos,cuando lo trabajamos con la rodilla en extensión, vamos a estimular todas las porciones del gemelo, el gemelo es un musculo que esta muy estimulado por el caminar de todos los días, por eso debemos estimularlo con una gran cantidad de repeticiones, en conjunto con un peso que nos ayude a generarle un gran estrés",
    "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/gemelos/gemelos-en-maquina/image.jpg",
    "video_url": "/videos/gemelos-en-maquina.mp4",
    "category": "Gemelos",
    "tags": [
      "tren inferior",
      "pantorrillas",
      "gemelos"
    ],
    "variants": [
      {
        "nombre": "Gemelos en maquina",
        "descripcion": "Las extensiones de tobillos son la mejor opción a la hora de trabajar la musculatura de los gemelos,cuando lo trabajamos con la rodilla en extensión, vamos a estimular todas las porciones del gemelo, el gemelo es un musculo que esta muy estimulado por el caminar de todos los días, por eso debemos estimularlo con una gran cantidad de repeticiones, en conjunto con un peso que nos ayude a generarle un gran estrés",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/gemelos/gemelos-en-maquina/image.jpg",
        "video_url": "/videos/gemelos-en-maquina.mp4"
      },
      {
        "nombre": "Gemelos en prensa",
        "descripcion": "Las extensiones de tobillos son la mejor opción a la hora de trabajar la musculatura de los gemelos,cuando lo trabajamos con la rodilla en extensión, vamos a estimular todas las porciones del gemelo, el gemelo es un musculo que esta muy estimulado por el caminar de todos los días, por eso debemos estimularlo con una gran cantidad de repeticiones, en conjunto con un peso que nos ayude a generarle un gran estrés",
        "media_url": "/exercises/gemelos-en-prensa.webp",
        "video_url": "/videos/gemelos-en-prensa.mp4"
      },
      {
        "nombre": "Gemelos parado con mancuernas",
        "descripcion": "Las extensiones de tobillos son la mejor opción a la hora de trabajar la musculatura de los gemelos,cuando lo trabajamos con la rodilla en extensión, vamos a estimular todas las porciones del gemelo, el gemelo es un musculo que esta muy estimulado por el caminar de todos los días, por eso debemos estimularlo con una gran cantidad de repeticiones, en conjunto con un peso que nos ayude a generarle un gran estrés",
        "media_url": "/exercises/gemelos-parado-con-mancuernas.webp",
        "video_url": "/videos/gemelos-parado-con-mancuernas.mp4"
      },
      {
        "nombre": "Gemelos sentado",
        "descripcion": "Cuando queremos estimular el musculo soleo(se encuentra en la parte externa de nuestro gemelo) lo debemos realizar con la rodilla flexionada, en el cual también vamos a trabajarlo con una gran cantidad de repeticiones y una carga que le genere un gran estrés, ya que el gemelo esta muy estimulado por la accion de estar parado y caminar durante todo el transcurso del dia",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/gemelos/gemelos-sentado/image.jpg",
        "video_url": "/videos/gemelos-sentado.mp4"
      }
    ]
  },
  {
    "nombre": "Aducción en máquinas",
    "descripcion": "Es un ejercicio accesorio el cual nos va a permitir desarrollar la musculatura del gluteo medio, lo vamos a trabajar con cargas moderadas o bajas, para lograr un aumento en las repeticiones, y de esa manera lograr un mayor tiempo bajo tension",
    "media_url": "/exercises/aduccion-en-maquinas.webp",
    "video_url": "/videos/aduccion-en-maquinas.mp4",
    "category": "Glúteos",
    "tags": [
      "tren inferior",
      "glúteos"
    ],
    "variants": []
  },
  {
    "nombre": "Empuje de cadera en polea con soga",
    "descripcion": "Es un ejercicio accesorio muy bueno para el desarrollo de los glúteos, ya que nos va a permitir realizar la extensión de la cadera y poder mantener una tensión constante durante todo el rango de movimiento, lo vamos a trabajar con repeticiones más altas y de esa manera poder aumentar el tiempo bajo tensión",
    "media_url": "/exercises/empuje-de-cadera-en-polea-con-soga.webp",
    "video_url": "/videos/empuje-de-cadera-en-polea-con-soga.mp4",
    "category": "Glúteos",
    "tags": [
      "tren inferior",
      "glúteos"
    ],
    "variants": []
  },
  {
    "nombre": "Patada",
    "descripcion": "Las patadas son un ejercicio accesorio el cual nos va a servir para estimular muy bien los glúteos, lo vamos a realizar con repeticiones mas altas y un peso moderado, son una excelente opción para terminar una rutina de glúteos y buscar esa sensación de quemazón",
    "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/gluteos/patada-de-gluteo-con-tobilleras/image.jpg",
    "video_url": "/videos/patada-de-gluteo-con-tobilleras.mp4",
    "category": "Glúteos",
    "tags": [
      "tren inferior",
      "glúteos"
    ],
    "variants": [
      {
        "nombre": "Patada de glúteo con tobilleras",
        "descripcion": "Las patadas son un ejercicio accesorio el cual nos va a servir para estimular muy bien los glúteos, lo vamos a realizar con repeticiones mas altas y un peso moderado, son una excelente opción para terminar una rutina de glúteos y buscar esa sensación de quemazón",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/gluteos/patada-de-gluteo-con-tobilleras/image.jpg",
        "video_url": "/videos/patada-de-gluteo-con-tobilleras.mp4"
      },
      {
        "nombre": "Patada de glúteo en máquina",
        "descripcion": "Las patadas son un ejercicio accesorio el cual nos va a servir para estimular muy bien los glúteos, lo vamos a realizar con repeticiones mas altas y un peso moderado, son una excelente opción para terminar una rutina de glúteos y buscar esa sensación de quemazón",
        "media_url": "/exercises/patada-de-gluteo-en-maquina.webp",
        "video_url": "/videos/patada-de-gluteo-en-maquina.mp4"
      },
      {
        "nombre": "Patada de glúteo en polea",
        "descripcion": "Las patadas son un ejercicio accesorio el cual nos va a servir para estimular muy bien los glúteos, lo vamos a realizar con repeticiones mas altas y un peso moderado, son una excelente opción para terminar una rutina de glúteos y buscar esa sensación de quemazón",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/gluteos/patada-de-gluteo-en-polea/image.jpg",
        "video_url": "/videos/patada-de-gluteo-en-polea.mp4"
      },
      {
        "nombre": "Patada de burro con mancuernas",
        "descripcion": "Es un ejercicio accesorio en el cual vamos a trabajar con el hombro en posiicion neutra, de esta manera vamos a generar una mayor activacion en la cabeza mas larga del triceps, lo vamos a realizar con una carga moderada o liviana, para poder generar una contraccion muscular mucho mas controlada ",
        "media_url": "/exercises/patada-de-burro-con-mancuernas.webp",
        "video_url": "/videos/patada-de-burro-con-mancuernas.mp4"
      },
      {
        "nombre": "Patada de burro en polea a un brazo",
        "descripcion": "Es un ejercicio accesorio en el cual vamos a trabajar con el hombro en posiicion neutra, de esta manera vamos a generar una mayor activacion en la cabeza mas larga del triceps, lo vamos a realizar con una carga moderada o liviana, para poder generar una contraccion muscular mucho mas controlada ",
        "media_url": "/exercises/patada-de-burro-en-polea-a-un-brazo.webp",
        "video_url": "/videos/patada-de-burro-en-polea-a-un-brazo.mp4"
      }
    ]
  },
  {
    "nombre": "Press",
    "descripcion": "Es un excelente ejercicio que nos va ayudar a desarrollar por completo nuestros hombros, gracias a su rotación en el movimiento podemos trabajar diferentes partes de los deltoide",
    "media_url": "/exercises/press-arnold.webp",
    "video_url": "/videos/press-arnold.mp4",
    "category": "Hombros y trapecios",
    "tags": [
      "hombros y trapecios"
    ],
    "variants": [
      {
        "nombre": "Press arnold",
        "descripcion": "Es un excelente ejercicio que nos va ayudar a desarrollar por completo nuestros hombros, gracias a su rotación en el movimiento podemos trabajar diferentes partes de los deltoide",
        "media_url": "/exercises/press-arnold.webp",
        "video_url": "/videos/press-arnold.mp4"
      },
      {
        "nombre": "Press militar con barra parado",
        "descripcion": "Ejercicio multiarticular el cual nos va a permitir un muy buen desarrollo en la parte anterior del hombro,lo vamos a trabajar con cargas altas y repeticiones mas bajas,aprovechando su libertad de movimiento y la implicancia de otros músculos como los tríceps",
        "media_url": "/exercises/press-militar-con-barra-parado.webp",
        "video_url": "/videos/press-militar-con-barra-parado.mp4"
      },
      {
        "nombre": "Press militar con barra sentado",
        "descripcion": "Ejercicio multiarticular el cual nos va a permitir un muy buen desarrollo en la parte anterior del hombro,lo vamos a trabajar con cargas altas y repeticiones mas bajas,aprovechando su libertad de movimiento y la implicancia de otros músculos como los tríceps",
        "media_url": "/exercises/press-militar-con-barra-sentado.webp",
        "video_url": "/videos/press-militar-con-barra-sentado.mp4"
      },
      {
        "nombre": "Press militar con mancuerna",
        "descripcion": "Ejercicio multiarticular el cual nos va a permitir un muy buen desarrollo en la parte anterior del hombro,lo vamos a trabajar con cargas altas y repeticiones mas bajas,aprovechando su libertad de movimiento y la implicancia de otros músculos como los tríceps",
        "media_url": "/exercises/press-militar-con-mancuerna.webp",
        "video_url": "/videos/press-militar-con-mancuerna.mp4"
      },
      {
        "nombre": "Press militar en máquina",
        "descripcion": "Ejercicio multiarticular el cual nos va a permitir un muy buen desarrollo en la parte anterior del hombro,lo vamos a trabajar con cargas altas y repeticiones mas bajas,aprovechando su libertad de movimiento y la implicancia de otros músculos como los tríceps",
        "media_url": "/exercises/press-militar-en-maquina.webp",
        "video_url": "/videos/press-militar-en-maquina.mp4"
      },
      {
        "nombre": "Press militar en maquina smith",
        "descripcion": "Ejercicio multiarticular el cual nos va a permitir un muy buen desarrollo en la parte anterior del hombro,lo vamos a trabajar con cargas altas y repeticiones mas bajas,aprovechando su libertad de movimiento y la implicancia de otros músculos como los tríceps",
        "media_url": "/exercises/press-militar-en-maquina-smith.webp",
        "video_url": "/videos/press-militar-en-maquina-smith.mp4"
      },
      {
        "nombre": "Press declinado con mancuernas",
        "descripcion": "Ejercicio muy eficiente a la hora de trabajar la parte inferior de los músculos pectorales, gracias a su ubicación nos permiten un gran estiramiento y por ende una mayor activacion",
        "media_url": "/exercises/press-declinado-con-mancuernas.webp",
        "video_url": "/videos/press-declinado-con-mancuernas.mp4"
      },
      {
        "nombre": "Press declinado en máquina Smith",
        "descripcion": "Los press en maquina smith son una muy buena opcion para hipertrofia, ya que nos ofrecen un movimiento con una barra fija, de esa manera podemos mover una mayor carga de manera estable y segura ",
        "media_url": "/exercises/press-declinado-en-maquina-smith.webp",
        "video_url": "/videos/press-declinado-en-maquina-smith.mp4"
      },
      {
        "nombre": "Press en máquina",
        "descripcion": "Es una excelente opción si de hipertrofia hablamos,ya que nos dan una gran estabilidad a la hora de empujar y poder enfatizarnos en la musculatura específica del pectoral, podemos trabajar de manera muy exigente,gracias a su estabilidad y seguridad",
        "media_url": "/exercises/press-en-maquina.webp",
        "video_url": "/videos/press-en-maquina.mp4"
      },
      {
        "nombre": "Press inclinado con mancuernas",
        "descripcion": "Ejercicio muy eficiente para el desarrollo del pectoral superior,al trabajarlo con mancuernas vamos a estirar más la musculatura y así conseguir un mayor estímulo en su fase de contracción excéntrica",
        "media_url": "/exercises/press-inclinado-con-mancuernas.webp",
        "video_url": "/videos/press-inclinado-con-mancuernas.mp4"
      },
      {
        "nombre": "Press inclinado en máquina Smith",
        "descripcion": "Los press en maquina smith son una muy buena opcion para hipertrofia, ya que nos ofrecen un movimiento con una barra fija, de esa manera podemos mover una mayor carga de manera estable y segura ",
        "media_url": "/exercises/press-inclinado-en-maquina-smith.webp",
        "video_url": "/videos/press-inclinado-en-maquina-smith.mp4"
      },
      {
        "nombre": "Press plano con mancuernas",
        "descripcion": "Es un excelente ejercicio para el desarrollo de los pectorales,al trabajarlo con mancuernas nos va a permitir aumentar el rango de recorrido que no nos permite la barra",
        "media_url": "/exercises/press-plano-con-mancuernas.webp",
        "video_url": "/videos/press-plano-con-mancuernas.mp4"
      },
      {
        "nombre": "Press plano en máquina Smith",
        "descripcion": "Los press en maquina smith son una muy buena opcion para hipertrofia, ya que nos ofrecen un movimiento con una barra fija, de esa manera podemos mover una mayor carga de manera estable y segura ",
        "media_url": "/exercises/press-plano-en-maquina-smith.webp",
        "video_url": "/videos/press-plano-en-maquina-smith.mp4"
      },
      {
        "nombre": "Press cerrado con barra",
        "descripcion": "Es un ejercicio que trabaja la parte mas medial de los triceps, lo vamosa a realizar con cargas altas y moderadas, logrando un gran desarrollo de la fuerza y masa musclar , estas ganancias son transferibles para otros ejercicios como por ejemplo el press en banco plano de pectorales",
        "media_url": "/exercises/press-cerrado-con-barra.webp",
        "video_url": "/videos/press-cerrado-con-barra.mp4"
      },
      {
        "nombre": "Press francés con barra",
        "descripcion": "Es un ejercicio que trabaja el triceps con el hombro en flexion, gracias a su posicion nos va a permitir trabajar en mayor medida la porcion larga del triceps braquial y en menor medida la porcion medial y lateral, lo podemos trabajar con cargas altas y moderadas, generando un gran desarrollo en los triceps ",
        "media_url": "/exercises/press-frances-con-barra.webp",
        "video_url": "/videos/press-frances-con-barra.mp4"
      },
      {
        "nombre": "Press francés con mancuernas",
        "descripcion": "Es un ejercicio que trabaja el triceps con el hombro en flexion, gracias a su posicion nos va a permitir trabajar en mayor medida la porcion larga del triceps braquial y en menor medida la porcion medial y lateral, lo podemos trabajar con cargas altas y moderadas, generando un gran desarrollo en los triceps ",
        "media_url": "/exercises/press-frances-con-mancuernas.webp",
        "video_url": "/videos/press-frances-con-mancuernas.mp4"
      }
    ]
  },
  {
    "nombre": "Trapecios con barra",
    "descripcion": "Los encogimientos con mancuernas o barra son la mejor opción a la hora de trabajar los trapecios, lo podemos trabajar con cargas moderadas y altas, realizando siempre 2 segundos de contracción cuando llevamos la barra o mancuerna hacia arriba",
    "media_url": "/exercises/trapecios-con-barra.webp",
    "video_url": "/videos/trapecios-con-barra.mp4",
    "category": "Hombros y trapecios",
    "tags": [
      "hombros y trapecios"
    ],
    "variants": []
  },
  {
    "nombre": "Trapecios con mancuernas",
    "descripcion": "Los encogimientos con mancuernas o barra son la mejor opción a la hora de trabajar los trapecios, lo podemos trabajar con cargas moderadas y altas, realizando siempre 2 segundos de contracción cuando llevamos la barra o mancuerna hacia arriba",
    "media_url": "/exercises/trapecios-con-mancuernas.webp",
    "video_url": "/videos/trapecios-con-mancuernas.mp4",
    "category": "Hombros y trapecios",
    "tags": [
      "hombros y trapecios"
    ],
    "variants": []
  },
  {
    "nombre": "Vuelo",
    "descripcion": "Ejercicio muy eficiente a la hora de trabajar los deltoides y trapecios, lo vamos a trabajar con cargas moderadas, lo mas importante es realizar un buen rango de movimiento para estimular toda la musculatura involucrada",
    "media_url": "/exercises/vuelo-al-menton-con-barra-w.webp",
    "video_url": "/videos/vuelo-al-menton-con-barra-w.mp4",
    "category": "Hombros y trapecios",
    "tags": [
      "hombros y trapecios"
    ],
    "variants": [
      {
        "nombre": "Vuelo al mentón con barra w",
        "descripcion": "Ejercicio muy eficiente a la hora de trabajar los deltoides y trapecios, lo vamos a trabajar con cargas moderadas, lo mas importante es realizar un buen rango de movimiento para estimular toda la musculatura involucrada",
        "media_url": "/exercises/vuelo-al-menton-con-barra-w.webp",
        "video_url": "/videos/vuelo-al-menton-con-barra-w.mp4"
      },
      {
        "nombre": "Vuelo frontal con soga",
        "descripcion": "El vuelo frontal nos va a permitir trabajar de manera especifica la parte anterior del hombro, siempre lo vamos a trabajar con cargas bajas y repeticiones mas altas, y de esta manera lograr un aumento en el tiempo bajo tensió",
        "media_url": "/exercises/vuelo-frontal-con-soga.webp",
        "video_url": "/videos/vuelo-frontal-con-soga.mp4"
      },
      {
        "nombre": "Vuelo posterior con mancuernas",
        "descripcion": "Excelente ejercicio para el desarrollo de la parte posterior del hombro,debemos trabajarlo con cargas moderadas o bajas y concentrarnos en su contracción al final del recorrido",
        "media_url": "/exercises/vuelo-posterior-con-mancuernas.webp",
        "video_url": "/videos/vuelo-posterior-con-mancuernas.mp4"
      },
      {
        "nombre": "Vuelo posterior en polea",
        "descripcion": "Excelente ejercicio para el desarrollo de la parte posterior del hombro,debemos trabajarlo con cargas moderadas o bajas y concentrarnos en su contracción al final del recorrido",
        "media_url": "/exercises/vuelo-posterior-en-polea.webp",
        "video_url": "/videos/vuelo-posterior-en-polea.mp4"
      },
      {
        "nombre": "Vuelo posterior en polea cruzado",
        "descripcion": "Excelente ejercicio para el desarrollo de la parte posterior del hombro,debemos trabajarlo con cargas moderadas o bajas y concentrarnos en su contracción al final del recorrido",
        "media_url": "/exercises/vuelo-posterior-en-polea-cruzado.webp",
        "video_url": "/videos/vuelo-posterior-en-polea-cruzado.mp4"
      },
      {
        "nombre": "Vuelos frontales con mancuernas",
        "descripcion": "El vuelo frontal nos va a permitir trabajar de manera especifica la parte anterior del hombro, siempre lo vamos a trabajar con cargas bajas y repeticiones mas altas, y de esta manera lograr un aumento en el tiempo bajo tensión",
        "media_url": "/exercises/vuelos-frontales-con-mancuernas.webp",
        "video_url": "/videos/vuelos-frontales-con-mancuernas.mp4"
      },
      {
        "nombre": "Vuelos laterales con mancuernas parado",
        "descripcion": "Son la mejor opción para estimular la porción lateral del hombro, es el ejercicio clave que le va a dar ese aspecto redondo a nuestro hombro, lo podemos trabajar con cargas altas , moderadas y bajas",
        "media_url": "/exercises/vuelos-laterales-con-mancuernas-parado.webp",
        "video_url": "/videos/vuelos-laterales-con-mancuernas-parado.mp4"
      },
      {
        "nombre": "Vuelos laterales con mancuernas sentado",
        "descripcion": "Son la mejor opción para estimular la porción lateral del hombro, es el ejercicio clave que le va a dar ese aspecto redondo a nuestro hombro, lo podemos trabajar con cargas altas , moderadas y bajas",
        "media_url": "/exercises/vuelos-laterales-con-mancuernas-sentado.webp",
        "video_url": "/videos/vuelos-laterales-con-mancuernas-sentado.mp4"
      },
      {
        "nombre": "Vuelos laterales en polea",
        "descripcion": "Son la mejor opción para estimular la porción lateral del hombro, es el ejercicio clave que le va a dar ese aspecto redondo a nuestro hombro, lo podemos trabajar con cargas altas , moderadas y bajas",
        "media_url": "/exercises/vuelos-laterales-en-polea.webp",
        "video_url": "/videos/vuelos-laterales-en-polea.mp4"
      }
    ]
  },
  {
    "nombre": "Buenos días con barra",
    "descripcion": "Es un ejercicio excelente para estimular toda la cadena posterior,desde la espalda baja, glúteos e isquiotibiales, debemos trabajarlo con una carga moderada, ya que requiere de una técnica muy bien aplicada, y ademas el exceso de peso puede llegar a generar grandes molestias en la zona lumbar",
    "media_url": "/exercises/buenos-dias-con-barra.webp",
    "video_url": "/videos/buenos-dias-con-barra.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": []
  },
  {
    "nombre": "Camilla de isquiotibiales",
    "descripcion": "Es un ejercicio excelente para trabajar la musculatura posterior de la pierna, ya que nos permite trabajar la flexión de la rodillas en un ángulo donde vamos a estar acostados, lo podemos trabajar con repeticiones moderadas y altas, generando un gran tiempo bajo tensión",
    "media_url": "/exercises/camilla-de-isquiotibiales.webp",
    "video_url": "/videos/camilla-de-isquiotibiales.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": []
  },
  {
    "nombre": "Isquio",
    "descripcion": "En este ejercicio vamos a trabajar de manera unilateral y concentrarnos muy bien en la flexión de una sola pierna, la carga debe ser moderada y las repeticiones también, lo mas importante es apretar bien el isquiotibial cuando llegamos a la flexión completa de la rodilla",
    "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/isquiotibiales/isquio-parado/image.jpg",
    "video_url": "/videos/isquio-parado.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": [
      {
        "nombre": "Isquio parado",
        "descripcion": "En este ejercicio vamos a trabajar de manera unilateral y concentrarnos muy bien en la flexión de una sola pierna, la carga debe ser moderada y las repeticiones también, lo mas importante es apretar bien el isquiotibial cuando llegamos a la flexión completa de la rodilla",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/isquiotibiales/isquio-parado/image.jpg",
        "video_url": "/videos/isquio-parado.mp4"
      },
      {
        "nombre": "Isquios acostado con mancuerna",
        "descripcion": "Es un muy buen ejercicio para estimular por completos los isquiotibiales, podemos trabajarlo con cargas moderadas y pesadas,lo mas importante es evitar algún otro movimiento con la espalda para su ejecución, Sin duda es de las mejores opciones para este grupo muscular",
        "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/isquiotibiales/isquios-acostado-con-mancuerna/image.jpg",
        "video_url": "/videos/isquios-acostado-con-mancuerna.mp4"
      }
    ]
  },
  {
    "nombre": "Peso muerto a una pierna",
    "descripcion": "Es un excelente ejercicio para trabajar los isquiotibiales y gluteos, al trabajarlo de manera unilateral, no vamos a mover cargas muy pesadas, pero si vamos a trabajar de manera especifica sobre una pierna, trabajando en la contraccion y estabilidad del mismo",
    "media_url": "/exercises/peso-muerto-a-una-pierna.webp",
    "video_url": "/videos/peso-muerto-a-una-pierna.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": []
  },
  {
    "nombre": "Peso muerto convencional",
    "descripcion": "Es considerado uno de los mejores ejercicios para trabajar todos los músculos de la cadena posterior, espalda, glúteos e isquiotibiales, lo vamos a trabajar con cargas altas y máximas, gracias a la cantidad de musculos involucrados a la hora de realizar el ejercicio",
    "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/isquiotibiales/peso-muerto-convencional/image.jpg",
    "video_url": "/videos/peso-muerto-convencional.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": []
  },
  {
    "nombre": "Peso muerto rumano con barra",
    "descripcion": "Es un ejercicio muy eficiente para trabajar los isquiotibiales desde el estiramiento, lo podemos realizar con cargas altas y moderadas, lo mas importante es aprovechar el momento en que bajamos con la barra, ya que si lo realizamos lento y controlado, vamos a lograr un estimulo muy eficiente",
    "media_url": "/exercises/peso-muerto-rumano-con-barra.webp",
    "video_url": "/videos/peso-muerto-rumano-con-barra.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": []
  },
  {
    "nombre": "Peso muerto rumano con mancuerna",
    "descripcion": "Es un ejercicio muy eficiente para trabajar los isquiotibiales desde el estiramiento, lo podemos realizar con cargas altas y moderadas, lo mas importante es aprovechar el momento en que bajamos con la barra, ya que si lo realizamos lento y controlado, vamos a lograr un estimulo muy eficiente",
    "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/isquiotibiales/peso-muerto-rumano-con-mancuerna/image.jpg",
    "video_url": "/videos/peso-muerto-rumano-con-mancuerna.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": []
  },
  {
    "nombre": "Sillón de isquiotibiales",
    "descripcion": "En esta maquina vamos a poder trabajar de manera muy eficiente los isquiotibiales, logrando el máximo estimulo en la flexión de rodilla que es su acción principal, vamos a trabajar con cargas moderadas y en rangos de repeticiones optimas para la ganancia de masa muscular",
    "media_url": "https://wypnebmtdjfoazgvpvba.supabase.co/storage/v1/object/public/static/exercises/isquiotibiales/sillon-de-isquiotibiales/image.jpg",
    "video_url": "/videos/sillon-de-isquiotibiales.mp4",
    "category": "Isquiotibiales",
    "tags": [
      "tren inferior",
      "piernas",
      "isquios"
    ],
    "variants": []
  },
  {
    "nombre": "Apertura",
    "descripcion": "Ejercicio de aislamiento en el cual vamos a poder realizar una aducción perfecta de manera segura y estable, debemos aprovechar su seguridad y estabilidad para estirar y apretar al máximo la musculatura,podemos trabajar con repeticiones moderadas y altas con un grado de exigencia muy alto",
    "media_url": "/exercises/apertura-en-maquina.webp",
    "video_url": "/videos/apertura-en-maquina.mp4",
    "category": "Pectorales",
    "tags": [
      "pectorales"
    ],
    "variants": [
      {
        "nombre": "Apertura en máquina",
        "descripcion": "Ejercicio de aislamiento en el cual vamos a poder realizar una aducción perfecta de manera segura y estable, debemos aprovechar su seguridad y estabilidad para estirar y apretar al máximo la musculatura,podemos trabajar con repeticiones moderadas y altas con un grado de exigencia muy alto",
        "media_url": "/exercises/apertura-en-maquina.webp",
        "video_url": "/videos/apertura-en-maquina.mp4"
      },
      {
        "nombre": "Aperturas en banco declinado",
        "descripcion": "Las aperturas nos van a permitir realizar la aducción de los brazos(movimiento propio de los pectorales) nos permiten estirar y contraer  la musculatura de manera muy eficiente,siempre lo vamos a trabajar con cargas moderadas",
        "media_url": "/exercises/aperturas-en-banco-declinado.webp",
        "video_url": "/videos/aperturas-en-banco-declinado.mp4"
      },
      {
        "nombre": "Aperturas en banco inclinado",
        "descripcion": "Las aperturas nos van a permitir realizar la aducción de los brazos(movimiento propio de los pectorales) nos permiten estirar y contraer  la musculatura de manera muy eficiente,siempre lo vamos a trabajar con cargas moderadas",
        "media_url": "/exercises/aperturas-en-banco-inclinado.webp",
        "video_url": "/videos/aperturas-en-banco-inclinado.mp4"
      },
      {
        "nombre": "Aperturas en banco plano",
        "descripcion": "Las aperturas nos van a permitir realizar la aducción de los brazos(movimiento propio de los pectorales) nos permiten estirar y contraer  la musculatura de manera muy eficiente,siempre lo vamos a trabajar con cargas moderadas",
        "media_url": "/exercises/aperturas-en-banco-plano.webp",
        "video_url": "/videos/aperturas-en-banco-plano.mp4"
      },
      {
        "nombre": "Aperturas en polea",
        "descripcion": "Ejercicio de aislamiento para trabajar la musculatura del pectoral,nos permiten una tensión constante durante todo su rango de recorrido, podemos trabajarlo en tres ángulos distintos y así estimular por completo el pectoral",
        "media_url": "/exercises/aperturas-en-polea.webp",
        "video_url": "/videos/aperturas-en-polea.mp4"
      }
    ]
  },
  {
    "nombre": "Banco inclinado con barra",
    "descripcion": "Es un ejercicio básico para el desarrollo de los pectorales,al trabajarlo en un banco inclinado,su incidencia va a ser mayor en la parte superior del pectoral,lo trabajamos con cargas moderadas ya que al trabajarse en un banco inclinado,debemos cuidar la articulación del hombro",
    "media_url": "/exercises/banco-inclinado-con-barra.webp",
    "video_url": "/videos/banco-inclinado-con-barra.mp4",
    "category": "Pectorales",
    "tags": [
      "pectorales"
    ],
    "variants": []
  },
  {
    "nombre": "Banco plano con barra",
    "descripcion": "Es un ejercicio básico en el cual vamos a trabajar los músculos pectorales,hombros y tríceps, su desarrollo muscular va a incidir más en los pectorales y gracias a trabajar con una gran cantidad de músculos,podemos llevarlo a cabo con cargas altas",
    "media_url": "/exercises/banco-plano-con-barra.webp",
    "video_url": "/videos/banco-plano-con-barra.mp4",
    "category": "Pectorales",
    "tags": [
      "pectorales"
    ],
    "variants": []
  },
  {
    "nombre": "Flexiones",
    "descripcion": "Ejercicio de fuerza con el propio peso corporal donde vamos a trabajar los pectorales,hombros y tríceps, aquí el apoyo de nuestras manos juega un rol fundamental para poder llevar el trabajo hacia la músculos pectorales, las manos van ligeramente separadas del cuerpo con los codos a 45 grados",
    "media_url": "/exercises/flexiones-de-brazos.webp",
    "video_url": "/videos/flexiones-de-brazos.mp4",
    "category": "Pectorales",
    "tags": [
      "pectorales"
    ],
    "variants": [
      {
        "nombre": "Flexiones de brazos",
        "descripcion": "Ejercicio de fuerza con el propio peso corporal donde vamos a trabajar los pectorales,hombros y tríceps, aquí el apoyo de nuestras manos juega un rol fundamental para poder llevar el trabajo hacia la músculos pectorales, las manos van ligeramente separadas del cuerpo con los codos a 45 grados",
        "media_url": "/exercises/flexiones-de-brazos.webp",
        "video_url": "/videos/flexiones-de-brazos.mp4"
      },
      {
        "nombre": "Flexiones cerradas",
        "descripcion": "Es un ejercicio multiarticular en el cual vamos a trabajar triceps, hombros y pectorales, para lograr una mayor activacion en los triceps debemos realizar una aduccion de los brazos",
        "media_url": "/exercises/flexiones-cerradas.webp",
        "video_url": "/videos/flexiones-cerradas.mp4"
      }
    ]
  },
  {
    "nombre": "Fondo en paralelas",
    "descripcion": "Los fondos en paralelas nos van a permitir trabajar, los pectrales,los hombros y los triceps, para enfatizar mas el trabajo en el pectoral, vamos a realizar un agarre un poco mas amplio y llevar nuestro tronco un poco inclinado hacia adelante, de esta manera vamos a lograr una muy buena activacion y trabajo en el mismo",
    "media_url": "/exercises/fondo-en-paralelas.webp",
    "video_url": "/videos/fondo-en-paralelas.mp4",
    "category": "Pectorales",
    "tags": [
      "pectorales"
    ],
    "variants": []
  },
  {
    "nombre": "Fondos en banco",
    "descripcion": "Es un ejercicio en el cual vamos a realizar un empuje con los dos brazos en posicion extendida, lo vamos a realizar con el propio peso del cuerpo, esto quiere decir que a medida que aumentamos de nivel, podemos agregar una carga externa ",
    "media_url": "/exercises/fondos-en-banco.webp",
    "video_url": "/videos/fondos-en-banco.mp4",
    "category": "Tríceps",
    "tags": [
      "tren superior",
      "brazos",
      "tríceps"
    ],
    "variants": []
  },
  {
    "nombre": "Fondos en paralelas",
    "descripcion": "Es un ejercicio multiarticular en el cual involucramos, triceps, hombro y pectorales, para lograr un mayor trabajo en los triceps vamos a posicionarnos con el tronco mas recto y que nuestros brazos queden a 90 grados,  de esta manera vamos a lograr una gran extension de codo y optimizar el trabajo en los triceps",
    "media_url": "/exercises/fondos-en-paralelas.webp",
    "video_url": "/videos/fondos-en-paralelas.mp4",
    "category": "Tríceps",
    "tags": [
      "tren superior",
      "brazos",
      "tríceps"
    ],
    "variants": []
  },
  {
    "nombre": "Triceps",
    "descripcion": "Es un ejercicio de aislamiento en el cual vamos a trabajar la cabeza larga del triceps, lo vamos a llevar a cabo con cargas moderadas y livianas para poder aumentar el tiempo bajo tension",
    "media_url": "/exercises/triceps-con-soga-por-detras-de-la-cabeza.webp",
    "video_url": "/videos/triceps-con-soga-por-detras-de-la-cabeza.mp4",
    "category": "Tríceps",
    "tags": [
      "tren superior",
      "brazos",
      "tríceps"
    ],
    "variants": [
      {
        "nombre": "Tríceps con soga por detrás de la cabeza",
        "descripcion": "Es un ejercicio de aislamiento en el cual vamos a trabajar la cabeza larga del triceps, lo vamos a llevar a cabo con cargas moderadas y livianas para poder aumentar el tiempo bajo tension",
        "media_url": "/exercises/triceps-con-soga-por-detras-de-la-cabeza.webp",
        "video_url": "/videos/triceps-con-soga-por-detras-de-la-cabeza.mp4"
      },
      {
        "nombre": "Tríceps copa con mancuernas",
        "descripcion": "Es un ejercicio en el cual vamos a trabajar con una flexion total del hombro, de esta menera vamos a estimular la poricon mas medial del triceps, lo vamos a trabajar con cargas altas y moderadas generando un desarrollo optimo de la masa muscular",
        "media_url": "/exercises/triceps-copa-con-mancuernas.webp",
        "video_url": "/videos/triceps-copa-con-mancuernas.mp4"
      },
      {
        "nombre": "Tríceps en polea con agarre recto",
        "descripcion": "Es un ejercicio de aislamiento en el cual vamos a trabajar la cabeza lateral del triceps, lo vamos a llevar a cabo con repeticiones mas altas, de esta manera vamos a aumentar el tiempo bajo tension, uno de los tres principios para la hipertrofia ",
        "media_url": "/exercises/triceps-en-polea-con-agarre-recto.webp",
        "video_url": "/videos/triceps-en-polea-con-agarre-recto.mp4"
      },
      {
        "nombre": "Tríceps en polea con soga",
        "descripcion": "Es un ejercicio de aislamiento en el cual vamos a trabajar la cabeza lateral del triceps, lo vamos a llevar a cabo con repeticiones mas altas, de esta manera vamos a aumentar el tiempo bajo tension, uno de los tres principios para la hipertrofia ",
        "media_url": "/exercises/triceps-en-polea-con-soga.webp",
        "video_url": "/videos/triceps-en-polea-con-soga.mp4"
      },
      {
        "nombre": "Tríceps unilateral con mancuerna",
        "descripcion": "Es un ejercicio de aislamiento, lo vamos a trabajar de manera unilateral, esto nos va a permitir corregir desiquilibrios musculares en los brazos, las cargas van a ser moderadas o livianas, ya que vamos a trabajar sobre una sola articulacion ",
        "media_url": "/exercises/triceps-unilateral-con-mancuerna.webp",
        "video_url": "/videos/triceps-unilateral-con-mancuerna.mp4"
      },
      {
        "nombre": "Tríceps unilateral en polea",
        "descripcion": "Es un ejercicio de aislamiento, al trabajarlo en una polea y de manera unilateral, nos va a permitir aumentar la conexion mente musculo",
        "media_url": "/exercises/triceps-unilateral-en-polea.webp",
        "video_url": "/videos/triceps-unilateral-en-polea.mp4"
      }
    ]
  }
];
