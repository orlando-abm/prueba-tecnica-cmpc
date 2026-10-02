import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // Validar env vars
  const superAdminEmail    = requireEnv('SEED_SUPER_ADMIN_EMAIL');
  const superAdminPassword = requireEnv('SEED_SUPER_ADMIN_PASSWORD');
  const adminEmail         = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword      = requireEnv('SEED_ADMIN_PASSWORD');
  const userEmail          = requireEnv('SEED_USER_EMAIL');
  const userPassword       = requireEnv('SEED_USER_PASSWORD');

  // ─── Usuarios ──────────────────────────────────────────────────────────────

  const users = [
    {
      email:    superAdminEmail,
      password: superAdminPassword,
      role:     'SUPER_ADMIN' as const,
      profile:  { name: 'Admin', lastname: 'CMPC' },
    },
    {
      email:    adminEmail,
      password: adminPassword,
      role:     'ADMIN' as const,
      profile:  { name: 'Editor', lastname: 'CMPC' },
    },
    {
      email:    userEmail,
      password: userPassword,
      role:     'USER' as const,
      profile:  { name: 'Lector', lastname: 'CMPC' },
    },
  ];

  for (const u of users) {
    const hashed = await hash(u.password, 10);
    await prisma.user.upsert({
      where:  { email: u.email },
      update: { password: hashed, role: u.role },
      create: {
        email:    u.email,
        password: hashed,
        role:     u.role,
        profile:  { create: u.profile },
      },
    });
    console.log(`  ✓ Usuario: ${u.email} (${u.role})`);
  }

  // ─── Géneros ───────────────────────────────────────────────────────────────

  const genreNames = [
    'Novela', 'Ciencia Ficción', 'Fantasía', 'Historia',
    'Biografía', 'Ensayo', 'Terror', 'Romance', 'Thriller', 'Poesía',
  ];

  const genres: Record<string, string> = {};

  for (const name of genreNames) {
    const slug = slugify(name);
    const genre = await prisma.genre.upsert({
      where:  { slug },
      update: { name },
      create: { name, slug },
    });
    genres[name] = genre.id;
    console.log(`  ✓ Género: ${name}`);
  }

  // ─── Autores ───────────────────────────────────────────────────────────────

  const authorNames = [
    'Gabriel García Márquez',
    'Isabel Allende',
    'Pablo Neruda',
    'Mario Vargas Llosa',
    'Jorge Luis Borges',
    'Gabriela Mistral',
    'Roberto Bolaño',
    'Juan Rulfo',
    'Octavio Paz',
    'Julio Cortázar',
  ];

  const authors: Record<string, string> = {};

  for (const name of authorNames) {
    const slug = slugify(name);
    const author = await prisma.author.upsert({
      where:  { slug },
      update: { name },
      create: { name, slug },
    });
    authors[name] = author.id;
    console.log(`  ✓ Autor: ${name}`);
  }

  // ─── Editoriales ───────────────────────────────────────────────────────────

  const publisherNames = [
    'Alfaguara',
    'Planeta',
    'Seix Barral',
    'Anagrama',
    'Fondo de Cultura Económica',
  ];

  const publishers: Record<string, string> = {};

  for (const name of publisherNames) {
    const slug = slugify(name);
    const publisher = await prisma.publisher.upsert({
      where:  { slug },
      update: { name },
      create: { name, slug },
    });
    publishers[name] = publisher.id;
    console.log(`  ✓ Editorial: ${name}`);
  }

  // ─── Libros ────────────────────────────────────────────────────────────────

  const books = [
    {
      title:       'Cien años de soledad',
      author:      'Gabriel García Márquez',
      publisher:   'Alfaguara',
      genre:       'Novela',
      price:       14990,
      stock:       25,
      isbn:        '9780060883287',
      sku:         'GAR-001',
      year:        1967,
      pages:       471,
      language:    'Español',
      synopsis:    'La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.',
    },
    {
      title:       'El amor en los tiempos del cólera',
      author:      'Gabriel García Márquez',
      publisher:   'Alfaguara',
      genre:       'Romance',
      price:       12990,
      stock:       18,
      isbn:        '9780140058016',
      sku:         'GAR-002',
      year:        1985,
      pages:       368,
      language:    'Español',
      synopsis:    'Una historia de amor que dura más de cincuenta años entre Fermina Daza y Florentino Ariza.',
    },
    {
      title:       'La casa de los espíritus',
      author:      'Isabel Allende',
      publisher:   'Planeta',
      genre:       'Novela',
      price:       13990,
      stock:       20,
      isbn:        '9788408178415',
      sku:         'ALL-001',
      year:        1982,
      pages:       433,
      language:    'Español',
      synopsis:    'La saga de la familia Trueba a través de cuatro generaciones en Chile, desde los albores del siglo XX hasta la dictadura militar.',
    },
    {
      title:       'Eva Luna',
      author:      'Isabel Allende',
      publisher:   'Planeta',
      genre:       'Novela',
      price:       11990,
      stock:       0,
      isbn:        '9788408177289',
      sku:         'ALL-002',
      year:        1987,
      pages:       307,
      language:    'Español',
      synopsis:    'La historia de Eva Luna, una mujer con el don de contar historias, en un país latinoamericano imaginario.',
    },
    {
      title:       'Veinte poemas de amor y una canción desesperada',
      author:      'Pablo Neruda',
      publisher:   'Seix Barral',
      genre:       'Poesía',
      price:       7990,
      stock:       40,
      isbn:        '9780140258455',
      sku:         'NER-001',
      year:        1924,
      pages:       96,
      language:    'Español',
      synopsis:    'Una de las obras más leídas de la poesía en lengua española, que relata el amor y el desamor.',
    },
    {
      title:       'Canto general',
      author:      'Pablo Neruda',
      publisher:   'Fondo de Cultura Económica',
      genre:       'Poesía',
      price:       16990,
      stock:       12,
      isbn:        '9789681657291',
      sku:         'NER-002',
      year:        1950,
      pages:       592,
      language:    'Español',
      synopsis:    'Poema épico que narra la historia del continente americano desde su formación geológica hasta el siglo XX.',
    },
    {
      title:       'La ciudad y los perros',
      author:      'Mario Vargas Llosa',
      publisher:   'Seix Barral',
      genre:       'Novela',
      price:       13490,
      stock:       15,
      isbn:        '9788432217081',
      sku:         'VAR-001',
      year:        1963,
      pages:       408,
      language:    'Español',
      synopsis:    'Ambientada en el Colegio Militar Leoncio Prado de Lima, narra la violencia y los conflictos de un grupo de cadetes.',
    },
    {
      title:       'Conversación en La Catedral',
      author:      'Mario Vargas Llosa',
      publisher:   'Alfaguara',
      genre:       'Novela',
      price:       15990,
      stock:       8,
      isbn:        '9788420471839',
      sku:         'VAR-002',
      year:        1969,
      pages:       600,
      language:    'Español',
      synopsis:    'A través de una conversación entre dos hombres, se reconstruye la historia del Perú durante la dictadura de Odría.',
    },
    {
      title:       'Ficciones',
      author:      'Jorge Luis Borges',
      publisher:   'Anagrama',
      genre:       'Fantasía',
      price:       10990,
      stock:       30,
      isbn:        '9788420633169',
      sku:         'BOR-001',
      year:        1944,
      pages:       224,
      language:    'Español',
      synopsis:    'Colección de cuentos que exploran laberintos, espejos, bibliotecas infinitas y paradojas del tiempo.',
    },
    {
      title:       'El Aleph',
      author:      'Jorge Luis Borges',
      publisher:   'Anagrama',
      genre:       'Fantasía',
      price:       9990,
      stock:       22,
      isbn:        '9788420633176',
      sku:         'BOR-002',
      year:        1949,
      pages:       208,
      language:    'Español',
      synopsis:    'Cuentos que exploran temas como la infinitud, el tiempo circular y los mundos paralelos.',
    },
    {
      title:       'Poemas de Gabriela Mistral',
      author:      'Gabriela Mistral',
      publisher:   'Fondo de Cultura Económica',
      genre:       'Poesía',
      price:       8990,
      stock:       35,
      isbn:        '9789681615994',
      sku:         'MIS-001',
      year:        1922,
      pages:       180,
      language:    'Español',
      synopsis:    'Selección de los poemas más representativos de la primera latinoamericana en ganar el Premio Nobel de Literatura.',
    },
    {
      title:       'Los detectives salvajes',
      author:      'Roberto Bolaño',
      publisher:   'Anagrama',
      genre:       'Novela',
      price:       16490,
      stock:       14,
      isbn:        '9788433925923',
      sku:         'BOL-001',
      year:        1998,
      pages:       609,
      language:    'Español',
      synopsis:    'La búsqueda de dos jóvenes poetas por encontrar a la misteriosa fundadora de un movimiento literario mexicano.',
    },
    {
      title:       '2666',
      author:      'Roberto Bolaño',
      publisher:   'Anagrama',
      genre:       'Thriller',
      price:       19990,
      stock:       0,
      isbn:        '9788433925930',
      sku:         'BOL-002',
      year:        2004,
      pages:       1125,
      language:    'Español',
      synopsis:    'Novela póstuma que gira en torno a una ciudad ficticia en la frontera mexicana y sus feminicidios.',
    },
    {
      title:       'Pedro Páramo',
      author:      'Juan Rulfo',
      publisher:   'Fondo de Cultura Económica',
      genre:       'Novela',
      price:       8490,
      stock:       28,
      isbn:        '9789681600389',
      sku:         'RUL-001',
      year:        1955,
      pages:       124,
      language:    'Español',
      synopsis:    'Un hombre viaja a Comala para buscar a su padre y solo encuentra voces de muertos que reconstruyen el pasado.',
    },
    {
      title:       'El laberinto de la soledad',
      author:      'Octavio Paz',
      publisher:   'Fondo de Cultura Económica',
      genre:       'Ensayo',
      price:       11490,
      stock:       17,
      isbn:        '9789681600020',
      sku:         'PAZ-001',
      year:        1950,
      pages:       314,
      language:    'Español',
      synopsis:    'Ensayo que analiza la identidad y la psicología del pueblo mexicano desde sus raíces hasta la modernidad.',
    },
    {
      title:       'Rayuela',
      author:      'Julio Cortázar',
      publisher:   'Alfaguara',
      genre:       'Novela',
      price:       14490,
      stock:       20,
      isbn:        '9788420474441',
      sku:         'COR-001',
      year:        1963,
      pages:       560,
      language:    'Español',
      synopsis:    'Novela experimental que puede leerse en dos órdenes distintos, siguiendo las instrucciones del autor.',
    },
    {
      title:       'Cuentos completos',
      author:      'Julio Cortázar',
      publisher:   'Alfaguara',
      genre:       'Fantasía',
      price:       18990,
      stock:       10,
      isbn:        '9788420474458',
      sku:         'COR-002',
      year:        1994,
      pages:       688,
      language:    'Español',
      synopsis:    'Recopilación de todos los cuentos del maestro del fantástico latinoamericano.',
    },
    {
      title:       'Dune',
      author:      'Gabriel García Márquez',
      publisher:   'Planeta',
      genre:       'Ciencia Ficción',
      price:       17990,
      stock:       0,
      isbn:        '9788408273714',
      sku:         'SCI-001',
      year:        1965,
      pages:       896,
      language:    'Español',
      synopsis:    'En el planeta desértico de Arrakis, el joven Paul Atreides debe sobrevivir a las intrigas políticas y descubrir su destino.',
    },
    {
      title:       'Ensayo sobre la ceguera',
      author:      'Mario Vargas Llosa',
      publisher:   'Alfaguara',
      genre:       'Terror',
      price:       12490,
      stock:       16,
      isbn:        '9788420471853',
      sku:         'VAR-003',
      year:        1995,
      pages:       310,
      language:    'Español',
      synopsis:    'Una misteriosa epidemia de ceguera blanca se apodera de una ciudad, revelando lo más oscuro de la naturaleza humana.',
    },
    {
      title:       'Historia de Chile',
      author:      'Gabriela Mistral',
      publisher:   'Fondo de Cultura Económica',
      genre:       'Historia',
      price:       13990,
      stock:       9,
      isbn:        '9789681623456',
      sku:         'HIS-001',
      year:        2001,
      pages:       420,
      language:    'Español',
      synopsis:    'Un recorrido por los principales hitos históricos de Chile desde la época precolombina hasta el siglo XX.',
    },
    {
      title:       'Neruda: una biografía',
      author:      'Isabel Allende',
      publisher:   'Planeta',
      genre:       'Biografía',
      price:       14990,
      stock:       11,
      isbn:        '9788408189234',
      sku:         'BIO-001',
      year:        2004,
      pages:       380,
      language:    'Español',
      synopsis:    'La vida y obra del poeta chileno Pablo Neruda narrada con la sensibilidad literaria que caracteriza a la autora.',
    },
    {
      title:       'El nombre de la rosa',
      author:      'Jorge Luis Borges',
      publisher:   'Seix Barral',
      genre:       'Thriller',
      price:       15490,
      stock:       13,
      isbn:        '9788432228469',
      sku:         'THR-001',
      year:        1980,
      pages:       512,
      language:    'Español',
      synopsis:    'Un monje franciscano investiga una serie de misteriosas muertes en una abadía medieval italiana.',
    },
    {
      title:       'El túnel',
      author:      'Juan Rulfo',
      publisher:   'Seix Barral',
      genre:       'Novela',
      price:       9490,
      stock:       24,
      isbn:        '9788432228476',
      sku:         'RUL-002',
      year:        1948,
      pages:       154,
      language:    'Español',
      synopsis:    'Un pintor obsesionado narra desde la cárcel el crimen que cometió por amor, en una de las novelas más perturbadoras.',
    },
    {
      title:       'La vorágine',
      author:      'Octavio Paz',
      publisher:   'Anagrama',
      genre:       'Novela',
      price:       10490,
      stock:       7,
      isbn:        '9788433970123',
      sku:         'PAZ-002',
      year:        1924,
      pages:       293,
      language:    'Español',
      synopsis:    'Un poeta huye con su amante hacia los llanos colombianos y se pierde en la selva amazónica.',
    },
    {
      title:       'Los pasos perdidos',
      author:      'Roberto Bolaño',
      publisher:   'Planeta',
      genre:       'Ensayo',
      price:       11990,
      stock:       0,
      isbn:        '9788408312345',
      sku:         'BOL-003',
      year:        1953,
      pages:       285,
      language:    'Español',
      synopsis:    'Un músico abandona la civilización moderna para adentrarse en la selva latinoamericana en busca de los orígenes de la música.',
    },
  ];

  // Dos libros eliminados para demostrar soft delete
  const deletedSlugs = new Set([slugify('Eva Luna'), slugify('2666'), slugify('Los pasos perdidos')]);

  for (const b of books) {
    const slug = slugify(b.title);
    await prisma.book.upsert({
      where:  { slug },
      update: {
        price:       b.price,
        stock:       b.stock,
        deletedAt:   deletedSlugs.has(slug) ? new Date('2025-01-15') : null,
      },
      create: {
        title:      b.title,
        slug,
        isbn:       b.isbn,
        sku:        b.sku,
        synopsis:   b.synopsis,
        language:   b.language,
        pages:      b.pages,
        year:       b.year,
        price:      b.price,
        stock:      b.stock,
        genreId:    genres[b.genre],
        authorId:   authors[b.author],
        publisherId: publishers[b.publisher],
        deletedAt:  deletedSlugs.has(slug) ? new Date('2025-01-15') : null,
      },
    });
    const tag = deletedSlugs.has(slug) ? ' [eliminado]' : b.stock === 0 ? ' [sin stock]' : '';
    console.log(`  ✓ Libro: ${b.title}${tag}`);
  }

  console.log('\n✅ Seed completado.');
  console.log(`   → ${users.length} usuarios`);
  console.log(`   → ${genreNames.length} géneros`);
  console.log(`   → ${authorNames.length} autores`);
  console.log(`   → ${publisherNames.length} editoriales`);
  console.log(`   → ${books.length} libros (${deletedSlugs.size} eliminados, ${books.filter(b => b.stock === 0).length} sin stock)`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
