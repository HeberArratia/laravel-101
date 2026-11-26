export type Step = {
  title: string
  body: string
  code?: string
}

export type HttpTest = {
  method: string
  path: string
  headers?: string[]
  body?: string
  expect: string
}

export type Milestone = {
  slug: string
  number: string
  title: string
  goal: string
  minutes: string
  star?: boolean
  doneWhen: string[]
  steps: Step[]
  tests: HttpTest[]
  tips?: string[]
}

export const resourceHint =
  'En los ejemplos usamos el recurso `tareas`. Puedes cambiarlo por `posts`, `libros`, etc.'

export const milestones: Milestone[] = [
  {
    slug: 'preparar',
    number: '01',
    title: 'Preparar el proyecto',
    goal: 'Tener Laravel corriendo con scaffolding de API y base de datos lista.',
    minutes: '20–30 min',
    doneWhen: [
      'El servidor responde en http://127.0.0.1:8000',
      'Existe el archivo routes/api.php',
      'php artisan route:list --path=api muestra rutas de API',
    ],
    steps: [
      {
        title: 'Crear el proyecto',
        body: 'Desde la carpeta donde guardas tus proyectos:',
        code: `composer create-project laravel/laravel api-tareas
cd api-tareas`,
      },
      {
        title: 'Instalar el scaffolding de API',
        body: 'Este comando prepara Laravel para trabajar como API REST (incluye routes/api.php y lo necesario para Sanctum).',
        code: `php artisan install:api`,
      },
      {
        title: 'Configurar entorno y base de datos',
        body: 'Copia el entorno, genera la key y revisa DB_CONNECTION / DB_DATABASE en el .env (SQLite alcanza para el curso).',
        code: `cp .env.example .env
php artisan key:generate
php artisan migrate`,
      },
      {
        title: 'Arrancar el servidor',
        body: 'Deja el servidor corriendo mientras trabajas los hitos.',
        code: `php artisan serve`,
      },
      {
        title: 'Instalar un cliente HTTP',
        body: 'En VS Code instala Thunder Client o REST Client. Sin esto, el POST del hito estrella se vuelve imposible de probar con claridad. Alternativa: curl en la terminal.',
      },
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000',
        expect: 'Respuesta de Laravel (página o welcome). El servidor está vivo.',
      },
      {
        method: 'CLI',
        path: 'php artisan route:list --path=api',
        expect: 'Lista rutas bajo el prefijo /api.',
      },
    ],
    tips: [
      'Si migrate falla, revisa que el archivo de SQLite exista o que MySQL/Postgres esté levantado.',
      'install:api es el paso que muchos se saltan: sin él no hay routes/api.php listo.',
    ],
  },
  {
    slug: 'warmup',
    number: '02',
    title: 'Warm-up: ruta → controlador',
    goal: 'Conectar una ruta API a un controlador que devuelve JSON, sin modelo ni base de datos.',
    minutes: '15–20 min',
    doneWhen: [
      'GET /api/hola responde 200 con JSON',
      'Entiendes dónde se declara la ruta (routes/api.php)',
    ],
    steps: [
      {
        title: 'Crear el controlador',
        body: 'Un controlador solo para practicar la cadena ruta → método → respuesta.',
        code: `php artisan make:controller Api/HolaController`,
      },
      {
        title: 'Devolver JSON',
        body: 'En HolaController:',
        code: `public function __invoke()
{
    return response()->json([
        'mensaje' => 'Hola desde la API',
        'ok' => true,
    ]);
}`,
      },
      {
        title: 'Registrar la ruta',
        body: 'En routes/api.php:',
        code: `use App\\Http\\Controllers\\Api\\HolaController;

Route::get('/hola', HolaController::class);`,
      },
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/hola',
        headers: ['Accept: application/json'],
        expect: '200 con { "mensaje": "Hola desde la API", "ok": true }',
      },
    ],
    tips: [
      'Las rutas de api.php llevan el prefijo /api automáticamente.',
      'Si ves HTML de error, agrega el header Accept: application/json.',
    ],
  },
  {
    slug: 'modelo-migracion',
    number: '03',
    title: 'Modelo + migración',
    goal: 'Crear la tabla tareas y el modelo Eloquent correspondiente.',
    minutes: '20 min',
    doneWhen: [
      'La migración corre sin error',
      'Existe la tabla tareas en la base de datos',
      'El modelo Tarea tiene $fillable (o $guarded) listo para create',
    ],
    steps: [
      {
        title: 'Generar modelo y migración',
        body: 'El flag -m crea la migración junto al modelo.',
        code: `php artisan make:model Tarea -m`,
      },
      {
        title: 'Definir columnas',
        body: 'En database/migrations/..._create_tareas_table.php:',
        code: `$table->id();
$table->string('titulo');
$table->text('descripcion')->nullable();
$table->boolean('completada')->default(false);
$table->timestamps();`,
      },
      {
        title: 'Migrar',
        body: 'Aplica los cambios en la base de datos.',
        code: `php artisan migrate`,
      },
      {
        title: 'Abrir el modelo a asignación masiva',
        body: 'En app/Models/Tarea.php:',
        code: `protected $fillable = [
    'titulo',
    'descripcion',
    'completada',
];`,
      },
    ],
    tests: [
      {
        method: 'CLI',
        path: 'php artisan migrate:status',
        expect: 'La migración de tareas aparece como Ran.',
      },
    ],
    tips: [
      'Si después necesitás agregar, quitar o cambiar columnas → estación 04.',
      'Un solo recurso hasta el hito de relaciones. No te disperses.',
    ],
  },
  {
    slug: 'alterar-migracion',
    number: '04',
    title: 'Alterar la tabla',
    goal: 'Agregar, quitar o cambiar campos sin romper la base (migración nueva, no editar la vieja).',
    minutes: '20–30 min',
    doneWhen: [
      'Sabés cuándo usar migrate:fresh y cuándo una migración nueva',
      'Agregaste al menos un campo con una migración de alteración',
      'Actualizaste $fillable del modelo para el campo nuevo',
    ],
    steps: [
      {
        title: 'Regla de oro',
        body: 'Si la migración create_tareas_table ya corrió (aparece en migrate:status), no la edites y vuelvas a esperar que “se actualice sola”. Laravel no re-ejecuta migraciones ya corridas. En el curso, en tu máquina, podés borrar todo con fresh; la forma correcta (y la que usan en equipo) es una migración nueva que altera la tabla.',
      },
      {
        title: 'Opción rápida solo en local: editar + fresh',
        body: 'Útil al principio del curso si todavía no te importa perder datos. Editás la migración create_…, después:',
        code: `php artisan migrate:fresh
# o con datos de prueba:
php artisan migrate:fresh --seed`,
      },
      {
        title: 'Opción correcta: migración nueva para agregar un campo',
        body: 'Ejemplo: agregar prioridad a tareas.',
        code: `php artisan make:migration add_prioridad_to_tareas_table --table=tareas`,
      },
      {
        title: 'up() agrega, down() revierte',
        body: 'En el archivo nuevo de database/migrations:',
        code: `public function up(): void
{
    Schema::table('tareas', function (Blueprint $table) {
        $table->string('prioridad')->default('media')->after('descripcion');
    });
}

public function down(): void
{
    Schema::table('tareas', function (Blueprint $table) {
        $table->dropColumn('prioridad');
    });
}`,
      },
      {
        title: 'Aplicar el cambio',
        body: '',
        code: `php artisan migrate
php artisan migrate:status`,
      },
      {
        title: 'Quitar un campo',
        body: 'Misma idea: migración nueva, no borrar a mano la columna en la create vieja (si ya corrió).',
        code: `php artisan make:migration remove_descripcion_from_tareas_table --table=tareas

// up()
Schema::table('tareas', function (Blueprint $table) {
    $table->dropColumn('descripcion');
});

// down() — para poder revertir
Schema::table('tareas', function (Blueprint $table) {
    $table->text('descripcion')->nullable();
});`,
      },
      {
        title: 'Cambiar o renombrar un campo',
        body: 'Para renombrar:',
        code: `php artisan make:migration rename_titulo_to_nombre_on_tareas_table --table=tareas

// up()
Schema::table('tareas', function (Blueprint $table) {
    $table->renameColumn('titulo', 'nombre');
});

// Cambiar tipo / nullability (ejemplos):
$table->string('titulo', 200)->nullable()->change();
// En Laravel reciente change() suele funcionar sin paquetes extra.
// Si falla, revisá la docs de tu versión o usá una migración que drop + add (con cuidado: perdés datos de esa columna).`,
      },
      {
        title: 'Actualizar el modelo',
        body: 'La migración cambia la base; el modelo debe conocer los campos asignables.',
        code: `protected $fillable = [
    'titulo',
    'descripcion',
    'prioridad', // nuevo
    'completada',
];`,
      },
    ],
    tests: [
      {
        method: 'CLI',
        path: 'php artisan migrate:status',
        expect: 'La migración add_… (o la que creaste) aparece como Ran.',
      },
      {
        method: 'CLI',
        path: 'php artisan tinker',
        expect: 'Tarea::first() muestra el campo nuevo (o null/default).',
      },
    ],
    tips: [
      'Error “nothing to migrate” después de editar un archivo viejo = esa migración ya corrió. Fresh (local) o migración nueva.',
      'after() no existe en todos los motores igual; en SQLite a veces se ignora. No te bloquees por el orden visual de columnas.',
      'Siempre pensá el down(): si no podés revertir, migrate:rollback se vuelve un problema.',
      'Después de agregar campos, actualizá también validaciones y seeders cuando llegues a esos hitos.',
    ],
  },
  {
    slug: 'index',
    number: '05',
    title: 'Index — GET colección',
    goal: 'Listar todas las tareas en JSON.',
    minutes: '20 min',
    doneWhen: [
      'GET /api/tareas responde 200',
      'El body es un array JSON (aunque esté vacío)',
    ],
    steps: [
      {
        title: 'Controlador API de tareas',
        body: 'El flag --api genera métodos pensados para REST (sin create/edit de vistas).',
        code: `php artisan make:controller Api/TareaController --api`,
      },
      {
        title: 'Implementar index',
        body: 'En TareaController:',
        code: `use App\\Models\\Tarea;

public function index()
{
    return response()->json(Tarea::all());
}`,
      },
      {
        title: 'Ruta de colección',
        body: 'En routes/api.php (puedes usar apiResource más adelante; por ahora una ruta basta):',
        code: `use App\\Http\\Controllers\\Api\\TareaController;

Route::get('/tareas', [TareaController::class, 'index']);`,
      },
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: ['Accept: application/json'],
        expect: '200 con [] si aún no hay datos, o un array de objetos.',
      },
    ],
    tips: [
      'Ver [] es un éxito. El siguiente hito llena la lista.',
      'php artisan route:list --path=api confirma que la ruta existe.',
    ],
  },
  {
    slug: 'seed',
    number: '06',
    title: 'Seed — datos de prueba',
    goal: 'Tener filas reales en la base para no trabajar a ciegas.',
    minutes: '15–25 min',
    doneWhen: [
      'db:seed corre sin error',
      'GET /api/tareas muestra al menos 3 registros',
    ],
    steps: [
      {
        title: 'Crear seeder',
        body: '',
        code: `php artisan make:seeder TareaSeeder`,
      },
      {
        title: 'Insertar datos',
        body: 'En database/seeders/TareaSeeder.php:',
        code: `use App\\Models\\Tarea;

public function run(): void
{
    Tarea::insert([
        [
            'titulo' => 'Configurar Laravel',
            'descripcion' => 'Proyecto + install:api',
            'completada' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'titulo' => 'Hacer el index',
            'descripcion' => 'GET /api/tareas',
            'completada' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'titulo' => 'Lograr el POST',
            'descripcion' => 'El hito estrella',
            'completada' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
}`,
      },
      {
        title: 'Registrar el seeder',
        body: 'En DatabaseSeeder.php llama a TareaSeeder, luego:',
        code: `php artisan db:seed --class=TareaSeeder
# o
php artisan migrate:fresh --seed`,
      },
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas',
        expect: 'Array con 3 (o más) tareas.',
      },
    ],
    tips: [
      'migrate:fresh --seed borra todo y vuelve a crear. Ideal en desarrollo, nunca en producción.',
      'Más adelante puedes reemplazar insert() por factories.',
    ],
  },
  {
    slug: 'store',
    number: '07',
    title: 'Store — POST (hito estrella)',
    goal: 'Crear una tarea enviando JSON desde Thunder Client.',
    minutes: '25–40 min',
    star: true,
    doneWhen: [
      'POST /api/tareas con JSON válido responde 201',
      'La nueva tarea aparece en GET /api/tareas',
    ],
    steps: [
      {
        title: 'Implementar store',
        body: 'En TareaController (sin validación todavía; eso es el siguiente hito):',
        code: `public function store(Request $request)
{
    $tarea = Tarea::create([
        'titulo' => $request->input('titulo'),
        'descripcion' => $request->input('descripcion'),
        'completada' => $request->boolean('completada'),
    ]);

    return response()->json($tarea, 201);
}`,
      },
      {
        title: 'Ruta POST',
        body: 'En routes/api.php:',
        code: `Route::post('/tareas', [TareaController::class, 'store']);`,
      },
      {
        title: 'Probar en Thunder Client',
        body: 'Método POST, URL /api/tareas, Body → JSON. Headers obligatorios abajo. Si el body llega vacío, casi siempre es Content-Type incorrecto.',
      },
    ],
    tests: [
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Estudiar validaciones",
  "descripcion": "Siguiente hito",
  "completada": false
}`,
        expect: '201 Created con el objeto creado (incluye id).',
      },
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas',
        expect: 'La nueva tarea está en la lista.',
      },
    ],
    tips: [
      'Sin Content-Type: application/json Laravel no parsea el body como JSON.',
      'Si recibes 404, revisa que la ruta esté en api.php y el path lleve /api.',
      'Si recibes 500 por MassAssignmentException, falta $fillable en el modelo.',
    ],
  },
  {
    slug: 'validaciones',
    number: '08',
    title: 'Validaciones básicas',
    goal: 'Rechazar datos inválidos con 422 y mensajes claros.',
    minutes: '20–30 min',
    doneWhen: [
      'POST sin titulo responde 422',
      'POST válido sigue respondiendo 201',
    ],
    steps: [
      {
        title: 'Validar en el controlador',
        body: 'Reemplaza el store para validar antes de crear:',
        code: `public function store(Request $request)
{
    $datos = $request->validate([
        'titulo' => ['required', 'string', 'max:150'],
        'descripcion' => ['nullable', 'string'],
        'completada' => ['sometimes', 'boolean'],
    ]);

    $tarea = Tarea::create($datos);

    return response()->json($tarea, 201);
}`,
      },
      {
        title: 'Probar el caso feliz y el error',
        body: 'Primero un body vacío o sin titulo. Luego uno correcto. En API, el fallo de validación debe verse como JSON 422 (usa Accept: application/json).',
      },
    ],
    tests: [
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": ""
}`,
        expect: '422 Unprocessable Entity con errors.titulo',
      },
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Tarea válida"
}`,
        expect: '201 Created',
      },
    ],
    tips: [
      'Más adelante puedes mover las reglas a un Form Request (make:request).',
      '422 no es un bug: es la API diciéndote qué corregir.',
      'La estación 14 suma más reglas (email, min/max, integer) con desafíos.',
    ],
  },
  {
    slug: 'show',
    number: '09',
    title: 'Show — GET por id',
    goal: 'Obtener una sola tarea. Practicar parámetros de ruta y 404.',
    minutes: '15–20 min',
    doneWhen: [
      'GET /api/tareas/{id} existente → 200',
      'GET /api/tareas/{id} inexistente → 404',
    ],
    steps: [
      {
        title: 'Implementar show',
        body: 'Route model binding hace el trabajo pesado:',
        code: `public function show(Tarea $tarea)
{
    return response()->json($tarea);
}`,
      },
      {
        title: 'Ruta con parámetro',
        body: '',
        code: `Route::get('/tareas/{tarea}', [TareaController::class, 'show']);`,
      },
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas/1',
        expect: '200 con un objeto tarea',
      },
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas/99999',
        headers: ['Accept: application/json'],
        expect: '404 Not Found',
      },
    ],
    tips: [
      'El nombre {tarea} debe coincidir con la variable Tarea $tarea (singular del modelo).',
    ],
  },
  {
    slug: 'update',
    number: '10',
    title: 'Update — PUT/PATCH',
    goal: 'Actualizar campos de una tarea existente.',
    minutes: '20–30 min',
    doneWhen: [
      'PUT o PATCH cambia al menos un campo',
      'GET show refleja el cambio',
    ],
    steps: [
      {
        title: 'Implementar update',
        body: '',
        code: `public function update(Request $request, Tarea $tarea)
{
    $datos = $request->validate([
        'titulo' => ['sometimes', 'required', 'string', 'max:150'],
        'descripcion' => ['sometimes', 'nullable', 'string'],
        'completada' => ['sometimes', 'boolean'],
    ]);

    $tarea->update($datos);

    return response()->json($tarea);
}`,
      },
      {
        title: 'Ruta',
        body: 'PUT reemplaza/actualiza; PATCH es parcial. Con validate + sometimes ambos sirven.',
        code: `Route::put('/tareas/{tarea}', [TareaController::class, 'update']);
Route::patch('/tareas/{tarea}', [TareaController::class, 'update']);`,
      },
    ],
    tests: [
      {
        method: 'PATCH',
        path: 'http://127.0.0.1:8000/api/tareas/1',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "completada": true
}`,
        expect: '200 con completada: true',
      },
    ],
    tips: [
      'En Thunder Client elige PATCH o PUT; no uses POST para update.',
    ],
  },
  {
    slug: 'destroy',
    number: '11',
    title: 'Destroy — DELETE',
    goal: 'Eliminar una tarea y confirmar que ya no aparece en el index.',
    minutes: '10–15 min',
    doneWhen: [
      'DELETE responde 204 o 200',
      'La tarea ya no está en GET /api/tareas',
    ],
    steps: [
      {
        title: 'Implementar destroy',
        body: '',
        code: `public function destroy(Tarea $tarea)
{
    $tarea->delete();

    return response()->noContent(); // 204
}`,
      },
      {
        title: 'Ruta',
        body: '',
        code: `Route::delete('/tareas/{tarea}', [TareaController::class, 'destroy']);`,
      },
      {
        title: 'Atajo: apiResource',
        body: 'Cuando ya tienes index/store/show/update/destroy, puedes reemplazar las rutas sueltas por:',
        code: `Route::apiResource('tareas', TareaController::class);`,
      },
    ],
    tests: [
      {
        method: 'DELETE',
        path: 'http://127.0.0.1:8000/api/tareas/1',
        expect: '204 No Content',
      },
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas/1',
        headers: ['Accept: application/json'],
        expect: '404',
      },
    ],
  },
  {
    slug: 'relaciones',
    number: '12',
    title: 'Relaciones',
    goal: 'Conectar un segundo modelo y devolverlo en el JSON.',
    minutes: '30–45 min',
    doneWhen: [
      'Una tarea pertenece a una categoría (o similar)',
      'GET show incluye la relación (o un endpoint la carga)',
    ],
    steps: [
      {
        title: 'Segundo modelo',
        body: 'Ejemplo: Categoria hasMany Tarea; Tarea belongsTo Categoria.',
        code: `php artisan make:model Categoria -m
# en la migración de categorias: nombre (string)
# en tareas: categoria_id (foreignId) — nueva migración si la tabla ya existe`,
      },
      {
        title: 'Declarar relaciones',
        body: '',
        code: `// Categoria.php
public function tareas()
{
    return $this->hasMany(Tarea::class);
}

// Tarea.php
public function categoria()
{
    return $this->belongsTo(Categoria::class);
}`,
      },
      {
        title: 'Incluir en la respuesta',
        body: 'Evita N+1 con eager loading:',
        code: `public function show(Tarea $tarea)
{
    return response()->json(
        $tarea->load('categoria')
    );
}

// o en index:
return Tarea::with('categoria')->get();`,
      },
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas/1',
        expect: 'JSON con clave categoria (objeto o null).',
      },
    ],
    tips: [
      'Seed también categorías y asigna categoria_id a las tareas.',
      'No inventes endpoints de más: primero que la relación se vea en show/index.',
    ],
  },
  {
    slug: 'logica',
    number: '13',
    title: 'Lógica de negocio',
    goal: 'Agregar una regla real del dominio (filtros, conflictos, cupos o totales). Crucial para la evaluación.',
    minutes: '40–60 min',
    doneWhen: [
      'Hay al menos una regla que NO es solo CRUD (filtro, conflicto, cupo o cálculo)',
      'La regla responde con el código HTTP correcto (200, 409 o 422)',
      'Podés explicar la regla en voz alta en 30 segundos',
    ],
    steps: [
      {
        title: 'Qué cuenta como “lógica de negocio”',
        body: 'CRUD solo guarda y lee. La lógica decide: ¿se puede reservar esta hora? ¿queda cupo? ¿el total del pedido es correcto? En la evaluación te piden al menos una regla propia del dominio.',
      },
      {
        title: 'Opción A — filtrar pendientes',
        body: 'Scope en el modelo + query en index:',
        code: `// Tarea.php
public function scopePendientes($query)
{
    return $query->where('completada', false);
}

// TareaController@index
public function index(Request $request)
{
    $query = Tarea::query()->with('categoria');

    if ($request->boolean('pendientes')) {
        $query->pendientes();
    }

    return response()->json($query->get());
}`,
      },
      {
        title: 'Opción B — regla al eliminar',
        body: 'Ejemplo de lógica: no permitir borrar tareas completadas.',
        code: `public function destroy(Tarea $tarea)
{
    if ($tarea->completada) {
        return response()->json([
            'message' => 'No se puede eliminar una tarea completada',
        ], 409);
    }

    $tarea->delete();
    return response()->noContent();
}`,
      },
      {
        title: 'Opción C — evitar conflictos de horario (reservas)',
        body: 'Patrón típico de la EV2 (canchas, hotel, peluquería). Antes de crear, buscá si ya existe una reserva que se solapa.',
        code: `public function store(Request $request)
{
    $datos = $request->validate([
        'cancha_id' => ['required', 'exists:canchas,id'],
        'fecha' => ['required', 'date'],
        'hora_inicio' => ['required', 'date_format:H:i'],
        'hora_fin' => ['required', 'date_format:H:i', 'after:hora_inicio'],
    ]);

    $conflicto = Reserva::query()
        ->where('cancha_id', $datos['cancha_id'])
        ->whereDate('fecha', $datos['fecha'])
        ->where('hora_inicio', '<', $datos['hora_fin'])
        ->where('hora_fin', '>', $datos['hora_inicio'])
        ->exists();

    if ($conflicto) {
        return response()->json([
            'message' => 'Ya existe una reserva en ese horario.',
        ], 409);
    }

    $reserva = Reserva::create($datos);

    return response()->json($reserva, 201);
}`,
      },
      {
        title: 'Opción D — controlar cupos',
        body: 'Si tu dominio es inscripciones o actividades: no aceptes más gente que el máximo.',
        code: `public function store(Request $request)
{
    $datos = $request->validate([
        'actividad_id' => ['required', 'exists:actividades,id'],
        'alumno' => ['required', 'string', 'max:120'],
    ]);

    $actividad = Actividad::findOrFail($datos['actividad_id']);
    $inscritos = Inscripcion::where('actividad_id', $actividad->id)->count();

    if ($inscritos >= $actividad->cupo_maximo) {
        return response()->json([
            'message' => 'No quedan cupos disponibles.',
        ], 409);
    }

    $inscripcion = Inscripcion::create($datos);

    return response()->json($inscripcion, 201);
}`,
      },
      {
        title: 'Opción E — calcular totales',
        body: 'Pedidos, cine o tienda: el backend calcula; no confíes solo en el número que manda el cliente.',
        code: `public function store(Request $request)
{
    $datos = $request->validate([
        'items' => ['required', 'array', 'min:1'],
        'items.*.producto_id' => ['required', 'exists:productos,id'],
        'items.*.cantidad' => ['required', 'integer', 'min:1'],
    ]);

    $total = 0;
    foreach ($datos['items'] as $item) {
        $producto = Producto::findOrFail($item['producto_id']);
        $total += $producto->precio * $item['cantidad'];
    }

    $pedido = Pedido::create([
        'total' => round($total, 2),
    ]);

    // …guardar detalles…

    return response()->json($pedido, 201);
}`,
      },
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas?pendientes=1',
        expect: 'Solo tareas con completada: false (si elegiste la opción A).',
      },
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/reservas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "cancha_id": 1,
  "fecha": "2026-12-01",
  "hora_inicio": "10:00",
  "hora_fin": "11:00"
}`,
        expect: 'Primera vez 201; segunda vez mismo horario → 409 (si elegiste opción C).',
      },
    ],
    tips: [
      'Elige UNA regla alineada a tu proyecto de la EV1 y hazla bien. Calidad > cantidad.',
      '409 = conflicto de negocio. 422 = datos inválidos. No uses 500 para un “no se puede”.',
      'Documentá en el README qué regla implementaste y cómo probarla.',
      'En la defensa te pueden pedir: “agregá una validación para que el precio no sea negativo” o “filtrá por condición”.',
    ],
  },
  {
    slug: 'validaciones-fuertes',
    number: '14',
    title: 'Validaciones fuertes',
    goal: 'Conocer más reglas de validate() con ejemplos, y después resolver desafíos por tu cuenta.',
    minutes: '30–45 min',
    doneWhen: [
      'Probaste al menos 4 reglas nuevas en un endpoint',
      'Personalizaste al menos un mensaje de error en español',
      'Resolviste los 6 desafíos',
      'Cada fallo responde 422 con Accept: application/json',
    ],
    steps: [
      {
        title: 'Recordatorio: dónde va validate()',
        body: 'Siempre al inicio del método, antes de crear o actualizar. Si falla, Laravel corta ahí y responde 422. Si pasa, $datos solo tiene campos válidos.',
        code: `public function store(Request $request)
{
    $datos = $request->validate([
        'titulo' => ['required', 'string', 'max:150'],
    ]);

    // acá ya podés confiar en $datos
}`,
      },
      {
        title: 'Números: numeric, integer, min, max',
        body: 'numeric acepta 10 o "10". integer exige entero (rechaza 10.5). min / max fijan el rango. gt:0 = mayor que cero (excluye el 0).',
        code: `$datos = $request->validate([
    'edad' => ['required', 'integer', 'min:18', 'max:120'],
    'precio' => ['required', 'numeric', 'min:0'],
    'cantidad' => ['required', 'integer', 'gt:0'],
]);

// OK:  { "edad": 25, "precio": 9.90, "cantidad": 3 }
// 422: { "edad": 15 }           → min:18
// 422: { "precio": -1 }         → min:0
// 422: { "cantidad": 0 }        → gt:0
// 422: { "cantidad": 2.5 }      → integer`,
      },
      {
        title: 'Texto: email, min/max de caracteres, in',
        body: 'email chequea formato. En strings, min/max cuentan caracteres. in:a,b,c limita a una lista de valores.',
        code: `$datos = $request->validate([
    'email' => ['required', 'email'],
    'nombre' => ['required', 'string', 'min:3', 'max:80'],
    'rol' => ['required', 'in:admin,editor,viewer'],
]);

// OK:  { "email": "ana@mail.com", "nombre": "Ana", "rol": "editor" }
// 422: { "email": "ana@" }      → email
// 422: { "nombre": "Al" }       → min:3
// 422: { "rol": "super" }       → in:…`,
      },
      {
        title: 'Booleanos y campos opcionales',
        body: 'boolean acepta true/false, 1/0, "1"/"0". sometimes = solo validá si el campo viene. nullable = puede ser null.',
        code: `$datos = $request->validate([
    'titulo' => ['required', 'string'],
    'completada' => ['sometimes', 'boolean'],
    'notas' => ['nullable', 'string', 'max:500'],
]);

// OK:  { "titulo": "Hola" }                    → completada no vino, ok
// OK:  { "titulo": "Hola", "completada": true }
// OK:  { "titulo": "Hola", "notas": null }
// 422: { "titulo": "Hola", "completada": "sí" } → boolean`,
      },
      {
        title: 'Fechas (cuando tu recurso las use)',
        body: 'date valida una fecha. after / before comparan con otro campo o con today.',
        code: `$datos = $request->validate([
    'fecha_inicio' => ['required', 'date'],
    'fecha_fin' => ['required', 'date', 'after:fecha_inicio'],
    'cumple' => ['nullable', 'date', 'before:today'],
]);

// OK:  fecha_inicio "2026-01-01", fecha_fin "2026-01-10"
// 422: fecha_fin anterior o igual a fecha_inicio → after:fecha_inicio`,
      },
      {
        title: 'Cómo se ve el 422',
        body: 'Con el header Accept: application/json, Laravel responde solo. Por defecto los mensajes vienen en inglés.',
        code: `// Request inválido → HTTP 422
{
  "message": "The edad field must be at least 18.",
  "errors": {
    "edad": ["The edad field must be at least 18."]
  }
}`,
      },
      {
        title: 'Mensajes de retorno personalizados',
        body: 'El segundo argumento de validate() es un array de mensajes. La clave es campo.regla. Así el 422 habla en español (o con el texto que quieras).',
        code: `$datos = $request->validate(
    [
        'edad' => ['required', 'integer', 'min:18'],
        'email' => ['required', 'email'],
        'precio' => ['required', 'numeric', 'min:0'],
    ],
    [
        'edad.required' => 'La edad es obligatoria.',
        'edad.integer' => 'La edad debe ser un número entero.',
        'edad.min' => 'Debés ser mayor de 18 años.',
        'email.required' => 'El email es obligatorio.',
        'email.email' => 'Ingresá un email válido.',
        'precio.required' => 'El precio es obligatorio.',
        'precio.numeric' => 'El precio debe ser numérico.',
        'precio.min' => 'El precio no puede ser negativo.',
    ]
);

// Con edad: 15 → 422
// errors.edad[0] = "Debés ser mayor de 18 años."`,
      },
      {
        title: 'Desafío 1 — edad mínima',
        body: 'Validá edad: obligatorio, entero, no menor a 18. Probá 17 (422) y 18 (ok).',
      },
      {
        title: 'Desafío 2 — email válido',
        body: 'Agregá email obligatorio con formato de correo. Probá "hola" (422) y "hola@ejemplo.com" (ok).',
      },
      {
        title: 'Desafío 3 — precio no negativo + tope',
        body: 'Validá precio: numérico, no menor a 0, no mayor a 1000000. Casos: -5 → 422, 0 → ok, 1000001 → 422.',
      },
      {
        title: 'Desafío 4 — nombre con largo mínimo',
        body: 'Validá nombre: string obligatorio de al menos 3 caracteres. "Al" → 422, "Ana" → ok.',
      },
      {
        title: 'Desafío 5 — rol de una lista',
        body: 'Validá rol: solo puede ser admin, editor o viewer. "super" → 422, "editor" → ok.',
      },
      {
        title: 'Desafío 6 — mensajes en español',
        body: 'Tomá edad (o precio) y personalizá los mensajes de required y min. Cuando falle, el JSON 422 debe mostrar tu texto, no el inglés por defecto.',
      },
    ],
    tests: [
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Probar edad",
  "edad": 17
}`,
        expect: 'Desafío 1 → 422 (menor a 18)',
      },
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Probar email",
  "email": "hola"
}`,
        expect: 'Desafío 2 → 422 (no es email)',
      },
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Probar precio",
  "precio": -5
}`,
        expect: 'Desafío 3 → 422 (min:0)',
      },
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Probar nombre",
  "nombre": "Al"
}`,
        expect: 'Desafío 4 → 422 (min:3 caracteres)',
      },
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Probar rol",
  "rol": "super"
}`,
        expect: 'Desafío 5 → 422 (fuera de in:…)',
      },
      {
        method: 'POST',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: [
          'Accept: application/json',
          'Content-Type: application/json',
        ],
        body: `{
  "titulo": "Probar mensaje",
  "edad": 15
}`,
        expect: 'Desafío 6 → 422 con tu mensaje en español (ej. "Debés ser mayor de 18 años.")',
      },
    ],
    tips: [
      'Podés practicar en el store de tareas: agregá campos solo para validar (aunque no los guardes en la BD).',
      'Si no los vas a persistir, no hace falta meterlos en $fillable ni en la migración.',
      'La clave del mensaje es campo.regla → edad.min, email.email, precio.required.',
      'Sin Accept: application/json el 422 puede venir como HTML.',
      'min/max en string = largo; en number = valor. No es lo mismo min:3 en nombre que en edad.',
    ],
  },
  {
    slug: 'colecciones',
    number: '15',
    title: 'Colecciones',
    goal: 'Transformar, filtrar y resumir datos con Collection: filter, map, pluck, sortBy, sum… y un toque de paginate.',
    minutes: '30–45 min',
    doneWhen: [
      'Usaste Collection (o el resultado de Eloquent) con al menos 3 métodos',
      'Resolviste los 6 desafíos',
      'Probaste paginate en el index (aunque sea de a 5)',
    ],
    steps: [
      {
        title: 'Qué es una Collection',
        body: 'Cuando hacés Tarea::all() o ->get(), Laravel te devuelve una Collection: un array con superpoderes. También podés armar una a mano con collect().',
        code: `use App\\Models\\Tarea;

$tareas = Tarea::all();          // Illuminate\\Support\\Collection
$nums = collect([10, 20, 5, 40]);

$nums->sum();    // 75
$nums->count();  // 4
$nums->avg();    // 18.75`,
      },
      {
        title: 'Filtrar: filter y where',
        body: 'filter recibe un callback. where filtra por clave/valor (muy cómodo con modelos).',
        code: `$tareas = Tarea::all();

// Solo completadas
$hechas = $tareas->where('completada', true);

// Con callback
$pendientes = $tareas->filter(function ($t) {
    return $t->completada === false;
});

// Atajo (mismo resultado)
$pendientes = $tareas->where('completada', false);

return response()->json($pendientes->values());
// ->values() reindexa 0,1,2… (útil en JSON)`,
      },
      {
        title: 'Proyectar: pluck y map',
        body: 'pluck saca un solo campo. map transforma cada ítem en otra cosa.',
        code: `$tareas = Tarea::all();

// Solo títulos: ["Estudiar", "Comprar pan", …]
$titulos = $tareas->pluck('titulo');

// Armar un array custom por cada tarea
$resumen = $tareas->map(function ($t) {
    return [
        'id' => $t->id,
        'titulo' => strtoupper($t->titulo),
        'estado' => $t->completada ? 'ok' : 'pendiente',
    ];
});

return response()->json($resumen->values());`,
      },
      {
        title: 'Ordenar y resumir',
        body: 'sortBy / sortByDesc ordenan. sum, avg, count, max, min resumen.',
        code: `$tareas = Tarea::all();

$porTitulo = $tareas->sortBy('titulo')->values();
$porIdDesc = $tareas->sortByDesc('id')->values();

// Si tuvieras precio en el modelo:
// $tareas->sum('precio');
// $tareas->avg('precio');

$cantidad = $tareas->count();
$primeraPendiente = $tareas->firstWhere('completada', false);`,
      },
      {
        title: 'Usarlo en el index',
        body: 'Podés combinar query de Eloquent + Collection. Para filtros simples, a veces alcanza con where en la query; Collection brilla cuando ya tenés los datos en memoria o querés transformar la respuesta.',
        code: `public function index()
{
    $tareas = Tarea::all();

    return response()->json([
        'total' => $tareas->count(),
        'pendientes' => $tareas->where('completada', false)->count(),
        'items' => $tareas->values(),
    ]);
}`,
      },
      {
        title: 'Bonus: paginate',
        body: 'Cuando la lista crece, no devolváis todo. paginate() parte en páginas y arma meta (links, total). Probadlo en el index.',
        code: `public function index()
{
    return Tarea::paginate(5);
    // GET /api/tareas?page=1
    // GET /api/tareas?page=2
}

// JSON típico:
// { "data": [...], "current_page": 1, "per_page": 5, "total": …, "links": {…} }`,
      },
      {
        title: 'Desafío 1 — solo pendientes',
        body: 'Devolvé (en tinker o en el index) únicamente las tareas con completada = false. El JSON no debe incluir las completadas.',
      },
      {
        title: 'Desafío 2 — solo títulos',
        body: 'Obtené un array/lista solo con los títulos (strings), sin id ni el resto de campos.',
      },
      {
        title: 'Desafío 3 — contar pendientes',
        body: 'Respondé un JSON con la cantidad de pendientes, por ejemplo { "pendientes": N }. Sin listar las tareas.',
      },
      {
        title: 'Desafío 4 — ordenar por título',
        body: 'Listá todas las tareas ordenadas alfabéticamente por titulo (A→Z).',
      },
      {
        title: 'Desafío 5 — map a resumen',
        body: 'Transformá cada tarea a { id, titulo, estado } donde estado sea "ok" si completada y "pendiente" si no.',
      },
      {
        title: 'Desafío 6 — paginar de a 5',
        body: 'En el index, usá paginate(5). Pedí ?page=1 y ?page=2 en Thunder Client y verificá data + current_page.',
      },
    ],
    tests: [
      {
        method: 'CLI',
        path: 'php artisan tinker',
        expect: 'Desafío 1 — Tarea::all()->where("completada", false) (o filter) sin completadas.',
      },
      {
        method: 'CLI',
        path: 'php artisan tinker',
        expect: 'Desafío 2 — pluck("titulo") devuelve solo strings.',
      },
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas',
        headers: ['Accept: application/json'],
        expect: 'Desafío 3 (si lo exponés en index) — JSON con pendientes: N',
      },
      {
        method: 'CLI',
        path: 'php artisan tinker',
        expect: 'Desafío 4 — sortBy("titulo")->values()',
      },
      {
        method: 'CLI',
        path: 'php artisan tinker',
        expect: 'Desafío 5 — map con id, titulo, estado ok|pendiente',
      },
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas?page=2',
        headers: ['Accept: application/json'],
        expect: 'Desafío 6 — current_page: 2 y como máximo 5 ítems en data',
      },
    ],
    tips: [
      'Después de filter/where/sortBy, usá ->values() si el JSON se ve raro (saltos de índice).',
      'Tarea::all() carga todo en memoria. Con muchas filas, filtrá en la query (Tarea::where(...)->get()) o paginate.',
      'paginate() se usa en el query builder (Tarea::paginate), no sobre una Collection ya cargada.',
      'Podés practicar todo en tinker antes de tocarlo en el controlador.',
    ],
  },
]

export type SupportPage = {
  slug: string
  title: string
  goal: string
  minutes: string
  doneWhen: string[]
  steps: Step[]
  tips?: string[]
  trouble?: { problem: string; fix: string }[]
}

/** Secciones de apoyo (no son estaciones del CRUD). */
export const supportPages: SupportPage[] = [
  {
    slug: 'entregas',
    title: 'Preparar Tarea 4 + EV2',
    goal: 'Checklist de entrega, mini-ejercicios y preguntas típicas de la defensa oral.',
    minutes: '20–30 min (lectura) + práctica',
    doneWhen: [
      'Sabés qué pide la Tarea 4 vs qué pide la EV2',
      'Tu README cubre install, .env, migrate (si aplica) y endpoints',
      'Podés responder 3 preguntas de defensa sin mirar el código',
    ],
    steps: [
      {
        title: 'Mapa rápido: dos entregas distintas',
        body: 'Tarea 4 = API de conversión CLP→USD sin base de datos (validación + cálculo + JSON). EV2 = Back-End completo de tu proyecto EV1: ≥3 modelos, relación, CRUD real, validación, lógica de negocio, GitHub y defensa oral.',
      },
      {
        title: 'Checklist Tarea 4',
        body: 'Marcá uno por uno antes de subir el repo:',
        code: `[ ] Proyecto Laravel con routes/api.php
[ ] GET  /api/exchange-rate  → tasa 950
[ ] POST /api/convert        → amount_clp, amount_usd, exchange_rate
[ ] Redondeo a 2 decimales (1000 → 1.05)
[ ] Validaciones: required, numeric, integer, >0, max 100000000
[ ] Errores → 422 con message descriptivo
[ ] Casos: 19000, 1000, 950, 0, -5000, "hola", 1500.50, 100000001, ausente
[ ] README.md con instalación + documentación de endpoints
[ ] Repo público en GitHub (sin tocar después de la fecha límite)`,
      },
      {
        title: 'Checklist EV2',
        body: 'Requisitos mínimos de la rúbrica:',
        code: `[ ] Proyecto Laravel independiente (Composer)
[ ] BD configurada (SQLite / MySQL / PostgreSQL)
[ ] ≥ 3 modelos Eloquent propios del dominio
[ ] ≥ 1 relación (belongsTo / hasMany + FK)
[ ] Migraciones aplicadas (php artisan migrate)
[ ] CRUD real de al menos 1 entidad principal
[ ] Rutas en routes/api.php + controladores
[ ] GET, POST, PUT|PATCH, DELETE
[ ] $request->validate() (o Form Request)
[ ] Códigos HTTP + JSON coherentes
[ ] ≥ 1 regla de negocio (conflicto, cupo, total, filtro…)
[ ] Pruebas en Thunder Client / Postman (evidencia)
[ ] README completo + .env.example (sin vendor/ ni .env)
[ ] USO_IA.md con declaración honesta
[ ] Ensayo de presentación 4 min + defensa 6 min`,
      },
      {
        title: 'Mini-ejercicio A — validar un precio',
        body: 'En cualquier store: agregá que precio sea required, numeric y min:0. Probá -10 (422) y 0 (200/201 si min:0 lo permite). Es la modificación típica que piden en defensa.',
        code: `'precio' => ['required', 'numeric', 'min:0'],`,
      },
      {
        title: 'Mini-ejercicio B — filtrar por query',
        body: 'En un index, filtrá por un query string (ej. ?completada=1 o ?disponibles=1). Es otra modificación típica de defensa.',
        code: `if ($request->has('disponibles')) {
    $query->where('disponible', $request->boolean('disponibles'));
}`,
      },
      {
        title: 'Mini-ejercicio C — lógica de conflicto',
        body: 'Si tu dominio es reservas: intentá crear dos veces el mismo slot. La segunda debe fallar con 409. Si es catálogo/pedidos: calculá un total en el servidor.',
      },
      {
        title: 'Plantilla corta de README',
        body: 'Adaptá a tu proyecto. Sin esto la rúbrica de documentación baja fuerte.',
        code: `# Nombre del proyecto

## Descripción
API REST de …

## Requisitos
- PHP 8.2+
- Composer
- SQLite (o MySQL)

## Instalación
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/... | ... |
| POST | /api/... | Body ejemplo: { ... } |

## Lógica de negocio
Describe la regla (conflicto / cupo / total) y cómo probarla.

## Pruebas
Thunder Client / Postman — capturas o colección exportada.`,
      },
      {
        title: 'USO_IA.md (obligatorio en EV2)',
        body: 'No se penaliza el porcentaje. Se evalúa si entendés y podés modificar el código.',
        code: `# Uso de inteligencia artificial

## Herramientas
- ChatGPT / Copilot / Cursor: …

## Estimación por carpeta
| Archivo / carpeta | % IA | Qué hizo |
|-------------------|------|----------|
| app/Models/ | 20% | Relaciones |
| app/Http/Controllers/ | 50% | Borrador de endpoints |
| Validaciones | 30% | Reglas sugeridas |
| routes/api.php | 10% | Sintaxis |

## Reflexión
1. ¿En qué usamos IA?
2. ¿Qué escribimos nosotros?
3. ¿Qué errores nos dio la IA?
4. ¿Cómo verificamos (Thunder Client, logs)?
5. ¿Qué aprendimos?`,
      },
      {
        title: 'Preguntas típicas de defensa (ensayá en voz alta)',
        body: 'Modelo Eloquent = clase PHP que representa una tabla y habla con la BD. GET lee / POST crea. make:migration crea el archivo; migrate lo aplica. belongsTo/hasMany unen modelos por FK. validate() corta el request si los datos fallan y responde 422. Si te piden un cambio en vivo: precio >= 0 o un filtro en index — son los dos más comunes.',
        code: `¿Qué hace un modelo Eloquent?
¿Diferencia GET vs POST?
¿Qué hace make:migration y migrate?
¿Cómo se relacionan modelos (belongsTo / hasMany)?
¿Cómo validás con $request->validate()?
¿Qué pasa si llega data inválida?
Modificá: precio no negativo / filtrá un endpoint`,
      },
      {
        title: 'Orden de estudio recomendado',
        body: '1) Estaciones 01→13 del CRUD. 2) Estación 14 validaciones fuertes. 3) Estación 15 colecciones (opcional pero útil). 4) Checklist Tarea 4 de esta página (sin mirar soluciones externas: validar + calcular vos). 5) Lógica (13) con la regla de TU dominio EV2. 6) Ensayo oral.',
      },
    ],
    tips: [
      'La defensa es individual aunque el proyecto sea en pareja: ambos deben poder modificar código.',
      'Evidencia de pruebas: capturas o una colección de Thunder Client en el repo ayuda.',
      'No subas vendor/ ni .env con secretos; sí subí .env.example, composer.lock y USO_IA.md.',
      'La estación 14 practica validaciones; la Tarea 4 la armás vos con el checklist de arriba.',
    ],
    trouble: [
      {
        problem: 'La tarea pide message y Laravel me devuelve errors: {…}',
        fix: 'Capturá ValidationException y devolvé success:false + el primer mensaje, o personalizá los messages del validate().',
      },
      {
        problem: 'Mi lógica de negocio es solo un if en el controller y no sé si alcanza',
        fix: 'Alcanza si es del dominio (conflicto, cupo, total, restricción). Documentala y demostrala con un caso que falle (409/422).',
      },
      {
        problem: 'En defensa me trabo explicando el código',
        fix: 'Ensayá 3 frases: qué endpoint, qué valida, qué regla de negocio. Abrí Thunder Client y mostrá un 200 y un 422.',
      },
    ],
  },
  {
    slug: 'react',
    title: 'React + API REST',
    goal: 'Consumir tu API Laravel desde una app React (listar y crear), resolviendo CORS y el fetch con JSON.',
    minutes: '30–45 min',
    doneWhen: [
      'Laravel en :8000 y React en :5173 corren a la vez',
      'Un componente lista GET /api/tareas',
      'Un formulario hace POST y la lista se actualiza',
      'Si mandás datos inválidos, ves el 422 en pantalla o en la consola',
    ],
    steps: [
      {
        title: 'Dos proyectos, dos servidores',
        body: 'Laravel es el backend (API). React es el frontend. No “se conectan solos”: el navegador llama a URLs de la API con fetch. En local vas a tener dos terminales abiertas.',
        code: `# Terminal 1 — API
cd api-tareas
php artisan serve
# → http://127.0.0.1:8000

# Terminal 2 — React (Vite)
cd frontend
npm run dev
# → http://localhost:5173`,
      },
      {
        title: 'Crear el frontend (si no lo tenés)',
        body: 'Proyecto aparte del de Laravel. Vite + React alcanza para el curso.',
        code: `npm create vite@latest frontend -- --template react
cd frontend
npm install
npm run dev`,
      },
      {
        title: 'URL base de la API',
        body: 'No hardcodees la URL en diez archivos. En la raíz del frontend creá un .env:',
        code: `# frontend/.env
VITE_API_URL=http://127.0.0.1:8000/api`,
      },
      {
        title: 'Habilitar CORS en Laravel',
        body: 'El navegador bloquea pedidos cross-origin si Laravel no autoriza el origen de React. En config/cors.php (Laravel 11/12 ya trae CORS):',
        code: `// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];

# Después de tocar config:
php artisan config:clear`,
      },
      {
        title: 'Helper mínimo de fetch',
        body: 'Un archivo para no repetir headers. Ejemplo frontend/src/api.js:',
        code: `const API_URL = import.meta.env.VITE_API_URL

export async function api(path, options = {}) {
  const { headers, ...rest } = options
  const res = await fetch(\`\${API_URL}\${path}\`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const error = new Error(data?.message || 'Error de API')
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}`,
      },
      {
        title: 'GET — listar tareas en un componente',
        body: 'useEffect carga al montar. Separá loading / error / datos.',
        code: `import { useEffect, useState } from 'react'
import { api } from './api'

export default function ListaTareas() {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/tareas')
      .then(setTareas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando…</p>
  if (error) return <p>Error: {error}</p>

  return (
    <ul>
      {tareas.map((t) => (
        <li key={t.id}>{t.titulo}</li>
      ))}
    </ul>
  )
}`,
      },
      {
        title: 'POST — crear desde un form',
        body: 'El body va como JSON string. Después del 201, volvé a pedir la lista o agregá el ítem al state.',
        code: `import { useState } from 'react'
import { api } from './api'

export default function FormTarea({ onCreated }) {
  const [titulo, setTitulo] = useState('')
  const [errors, setErrors] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors(null)
    try {
      const nueva = await api('/tareas', {
        method: 'POST',
        body: JSON.stringify({ titulo }),
      })
      setTitulo('')
      onCreated?.(nueva)
    } catch (err) {
      // Validación Laravel → 422 con err.data.errors
      if (err.status === 422) {
        setErrors(err.data?.errors || { titulo: [err.message] })
      } else {
        setErrors({ general: [err.message] })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título"
      />
      {errors?.titulo && <p>{errors.titulo[0]}</p>}
      <button type="submit">Crear</button>
    </form>
  )
}`,
      },
      {
        title: 'Juntar lista + form',
        body: 'Al crear, actualizá el state sin recargar la página.',
        code: `function App() {
  const [tareas, setTareas] = useState([])
  // …cargar con useEffect como arriba…

  return (
    <>
      <FormTarea onCreated={(nueva) => setTareas((prev) => [...prev, nueva])} />
      <ListaTareas tareas={tareas} />
    </>
  )
}`,
      },
      {
        title: 'Probar el flujo completo',
        body: '1) API arriba y con seed. 2) React arriba. 3) Abrí DevTools → Network. 4) Deberías ver GET /api/tareas 200 y, al enviar, POST 201.',
      },
    ],
    tips: [
      'Si la API anda en Thunder Client pero falla en React, casi siempre es CORS o la URL mal escrita.',
      'Accept + Content-Type application/json también aplican en fetch, no solo en Thunder Client.',
      'No mezcles puertos: React no sirve la API; Laravel no renderiza el JSX.',
      'Auth con Sanctum/cookies es otro nivel. Primero dejá el CRUD público funcionando.',
    ],
    trouble: [
      {
        problem: 'Access-Control-Allow-Origin / CORS error en consola',
        fix: 'Agregá http://localhost:5173 a allowed_origins en config/cors.php y corré php artisan config:clear. Reiniciá artisan serve.',
      },
      {
        problem: 'Failed to fetch / NetworkError',
        fix: '¿php artisan serve está corriendo? ¿VITE_API_URL apunta a http://127.0.0.1:8000/api? Reiniciá npm run dev después de crear el .env.',
      },
      {
        problem: 'GET funciona, POST no',
        fix: 'Revisá method: "POST", JSON.stringify(body) y Content-Type. Mirá la pestaña Network el status (422 vs 500).',
      },
      {
        problem: 'Veo HTML en vez de JSON',
        fix: 'Falta header Accept: application/json, o pegaste una URL web (/) en lugar de /api/tareas.',
      },
      {
        problem: 'import.meta.env.VITE_API_URL es undefined',
        fix: 'La variable debe empezar con VITE_. Reiniciá el servidor de Vite tras crear/editar .env.',
      },
    ],
  },
]

export type UtilityGroup = {
  title: string
  items: { label: string; command: string }[]
}

export const utilities: UtilityGroup[] = [
  {
    title: 'Proyecto y Artisan',
    items: [
      { label: 'Servidor local', command: 'php artisan serve' },
      { label: 'Scaffold API', command: 'php artisan install:api' },
      { label: 'Listar rutas', command: 'php artisan route:list' },
      { label: 'Solo rutas API', command: 'php artisan route:list --path=api' },
      { label: 'Migrar', command: 'php artisan migrate' },
      { label: 'Estado migraciones', command: 'php artisan migrate:status' },
      { label: 'Fresh (borra datos)', command: 'php artisan migrate:fresh' },
      { label: 'Fresh + seed', command: 'php artisan migrate:fresh --seed' },
      { label: 'Rollback último batch', command: 'php artisan migrate:rollback' },
      {
        label: 'Migración: agregar columna',
        command: 'php artisan make:migration add_prioridad_to_tareas_table --table=tareas',
      },
      {
        label: 'Migración: quitar columna',
        command: 'php artisan make:migration remove_descripcion_from_tareas_table --table=tareas',
      },
      { label: 'Seed', command: 'php artisan db:seed' },
      { label: 'Seed de una clase', command: 'php artisan db:seed --class=TareaSeeder' },
      { label: 'Tinker', command: 'php artisan tinker' },
    ],
  },
  {
    title: 'Generadores',
    items: [
      { label: 'Modelo + migración', command: 'php artisan make:model Tarea -m' },
      {
        label: 'Modelo completo',
        command: 'php artisan make:model Tarea -mfsc',
      },
      {
        label: 'Controlador API',
        command: 'php artisan make:controller Api/TareaController --api',
      },
      {
        label: 'Form Request',
        command: 'php artisan make:request StoreTareaRequest',
      },
      { label: 'Seeder', command: 'php artisan make:seeder TareaSeeder' },
      { label: 'Factory', command: 'php artisan make:factory TareaFactory' },
    ],
  },
  {
    title: 'Composer y entorno',
    items: [
      { label: 'Instalar deps', command: 'composer install' },
      { label: 'Autoload', command: 'composer dump-autoload' },
      { label: 'Copiar env', command: 'cp .env.example .env' },
      { label: 'App key', command: 'php artisan key:generate' },
    ],
  },
  {
    title: 'HTTP — recordatorios',
    items: [
      { label: 'Accept JSON', command: 'Accept: application/json' },
      { label: 'Body JSON', command: 'Content-Type: application/json' },
      {
        label: 'curl POST ejemplo',
        command:
          'curl -X POST http://127.0.0.1:8000/api/tareas -H "Accept: application/json" -H "Content-Type: application/json" -d \'{"titulo":"Hola"}\'',
      },
    ],
  },
]

export const httpCheat = [
  { code: '200', meaning: 'OK — lectura, update o cálculo exitoso' },
  { code: '201', meaning: 'Created — recurso creado (POST)' },
  { code: '204', meaning: 'No Content — delete exitoso sin body' },
  { code: '404', meaning: 'Not Found — id o ruta inexistente' },
  { code: '409', meaning: 'Conflict — regla de negocio (horario ocupado, sin cupo)' },
  { code: '422', meaning: 'Validation error — datos inválidos' },
  { code: '500', meaning: 'Error del servidor — mira storage/logs/laravel.log' },
]

export const troubleShoot = [
  {
    problem: '404 en /api/...',
    fix: '¿La ruta está en routes/api.php? ¿Llevas el prefijo /api? Revisa route:list.',
  },
  {
    problem: 'POST con body vacío / campos null',
    fix: 'Falta Content-Type: application/json en Thunder Client.',
  },
  {
    problem: 'Redirect raro o HTML en vez de JSON',
    fix: 'Agrega Accept: application/json.',
  },
  {
    problem: 'MassAssignmentException',
    fix: 'Agrega los campos a $fillable del modelo.',
  },
  {
    problem: 'Table not found',
    fix: 'Corre php artisan migrate (o migrate:fresh --seed).',
  },
  {
    problem: 'Edité la migración create_… y no cambia la tabla',
    fix: 'Esa migración ya corrió. En local: migrate:fresh. En serio: make:migration nueva que haga Schema::table(...).',
  },
  {
    problem: 'Column already exists / Unknown column',
    fix: 'Revisá migrate:status. Puede que el campo ya esté, o que falte correr migrate / actualizar $fillable.',
  },
  {
    problem: 'Cambié una ruta y no aparece',
    fix: 'route:list de nuevo. Reinicia php artisan serve si hace falta.',
  },
]
