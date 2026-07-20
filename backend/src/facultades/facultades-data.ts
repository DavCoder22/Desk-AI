export interface Carrera {
  nombre: string;
}

export interface Facultad {
  nombre: string;
  carreras: Carrera[];
}

export const FACULTADES: Facultad[] = [
  {
    nombre: 'Facultad de Arquitectura y Urbanismo',
    carreras: [
      { nombre: 'Arquitectura' },
      { nombre: 'Urbanismo' },
    ],
  },
  {
    nombre: 'Facultad de Artes',
    carreras: [
      { nombre: 'Artes Plásticas' },
      { nombre: 'Artes Musicales' },
      { nombre: 'Artes Escénicas' },
      { nombre: 'Danza' },
      { nombre: 'Artes Visuales' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Administrativas',
    carreras: [
      { nombre: 'Administración de Empresas' },
      { nombre: 'Administración Pública' },
      { nombre: 'Contabilidad y Auditoría' },
      { nombre: 'Administración Turística' },
      { nombre: 'Administración de Negocios Internacionales' },
      { nombre: 'Gestión del Talento Humano' },
      { nombre: 'Mercadotecnia' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Agrícolas',
    carreras: [
      { nombre: 'Ingeniería Agronómica' },
      { nombre: 'Ingeniería Agroindustrial' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Biológicas',
    carreras: [
      { nombre: 'Biología' },
      { nombre: 'Microbiología' },
      { nombre: 'Ciencias Ambientales' },
      { nombre: 'Bioquímica y Farmacia' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias de la Discapacidad, Atención Prehospitalaria y Desastres',
    carreras: [
      { nombre: 'Atención Prehospitalaria y Desastres' },
      { nombre: 'Terapia Ocupacional' },
      { nombre: 'Terapia Física' },
      { nombre: 'Estimulación Temprana y Desarrollo Infantil' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Económicas',
    carreras: [
      { nombre: 'Economía' },
      { nombre: 'Finanzas' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Médicas',
    carreras: [
      { nombre: 'Medicina' },
      { nombre: 'Enfermería' },
      { nombre: 'Obstetricia' },
      { nombre: 'Nutrición Humana' },
      { nombre: 'Imagenología y Diagnóstico por Imágenes' },
      { nombre: 'Laboratorio Clínico' },
      { nombre: 'Terapia Respiratoria' },
      { nombre: 'Medicina Ocupacional' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Psicológicas',
    carreras: [
      { nombre: 'Psicología Clínica' },
      { nombre: 'Psicología Educativa' },
      { nombre: 'Psicología Organizacional' },
      { nombre: 'Psicología Laboral' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Químicas',
    carreras: [
      { nombre: 'Química' },
      { nombre: 'Química Farmacéutica' },
      { nombre: 'Ingeniería Química' },
    ],
  },
  {
    nombre: 'Facultad de Comunicación Social',
    carreras: [
      { nombre: 'Comunicación Social' },
      { nombre: 'Periodismo' },
      { nombre: 'Comunicación Organizacional' },
      { nombre: 'Comunicación Audiovisual' },
    ],
  },
  {
    nombre: 'Facultad de Cultura Física',
    carreras: [
      { nombre: 'Pedagogía de la Actividad Física y Deporte' },
      { nombre: 'Cultura Física' },
      { nombre: 'Entrenamiento Deportivo' },
    ],
  },
  {
    nombre: 'Facultad de Filosofía, Letras y Ciencias de la Educación',
    carreras: [
      { nombre: 'Ciencias de la Educación Básica' },
      { nombre: 'Ciencias de la Educación Inicial' },
      { nombre: 'Pedagogía de los Idiomas Nacionales y Extranjeros' },
      { nombre: 'Pedagogía de la Lengua y la Literatura' },
      { nombre: 'Pedagogía de la Historia y las Ciencias Sociales' },
      { nombre: 'Pedagogía de las Ciencias Experimentales' },
      { nombre: 'Filosofía' },
      { nombre: 'Psicopedagogía' },
      { nombre: 'Educación Especial' },
    ],
  },
  {
    nombre: 'Facultad de Ingeniería, Ciencias Físicas y Matemática',
    carreras: [
      { nombre: 'Ingeniería Civil' },
      { nombre: 'Ingeniería en Computación' },
      { nombre: 'Ingeniería en Sistemas Informáticos' },
      { nombre: 'Ingeniería en Telecomunicaciones' },
      { nombre: 'Matemática' },
      { nombre: 'Física' },
      { nombre: 'Ingeniería Matemática' },
    ],
  },
  {
    nombre: 'Facultad de Ingeniería en Geología, Minas, Petróleos y Ambiental',
    carreras: [
      { nombre: 'Ingeniería Geológica' },
      { nombre: 'Ingeniería de Minas' },
      { nombre: 'Ingeniería en Petróleos' },
      { nombre: 'Ingeniería Ambiental' },
    ],
  },
  {
    nombre: 'Facultad de Ingeniería Química',
    carreras: [
      { nombre: 'Ingeniería Química' },
      { nombre: 'Ingeniería de Procesos' },
    ],
  },
  {
    nombre: 'Facultad de Jurisprudencia, Ciencias Políticas y Sociales',
    carreras: [
      { nombre: 'Derecho' },
      { nombre: 'Ciencias Políticas' },
      { nombre: 'Sociología' },
      { nombre: 'Trabajo Social' },
    ],
  },
  {
    nombre: 'Facultad de Medicina Veterinaria y Zootecnia',
    carreras: [
      { nombre: 'Medicina Veterinaria y Zootecnia' },
      { nombre: 'Agropecuaria Sostenible' },
    ],
  },
  {
    nombre: 'Facultad de Odontología',
    carreras: [
      { nombre: 'Odontología' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias Sociales y Humanas',
    carreras: [
      { nombre: 'Antropología' },
      { nombre: 'Historia' },
      { nombre: 'Geografía' },
      { nombre: 'Trabajo Social' },
    ],
  },
  {
    nombre: 'Facultad de Ciencias de la Educación',
    carreras: [
      { nombre: 'Pedagogía de la Actividad Física y Deporte' },
      { nombre: 'Pedagogía de los Idiomas Nacionales y Extranjeros' },
      { nombre: 'Pedagogía de la Lengua y la Literatura' },
    ],
  },
  {
    nombre: 'Administración Central',
    carreras: [
      { nombre: 'Rectorado' },
      { nombre: 'Vicerrectorado Académico' },
      { nombre: 'Vicerrectorado de Investigación' },
      { nombre: 'Vicerrectorado Administrativo' },
      { nombre: 'Secretaría General' },
      { nombre: 'DTIC' },
      { nombre: 'Dirección Financiera' },
      { nombre: 'Dirección de Talento Humano' },
    ],
  },
];
