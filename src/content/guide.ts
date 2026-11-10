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
      'Si cambias columnas después de migrar: migrate:fresh (borra datos) o una nueva migración.',
      'Un solo recurso hasta el hito de relaciones. No te disperses.',
    ],
  },
  {
    slug: 'index',
    number: '04',
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
    number: '05',
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
    number: '06',
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
    number: '07',
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
    ],
  },
  {
    slug: 'show',
    number: '08',
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
    number: '09',
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
    number: '10',
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
    number: '11',
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
    number: '12',
    title: 'Lógica de negocio',
    goal: 'Agregar una regla real del dominio (filtros, scopes o restricciones).',
    minutes: '30–45 min',
    doneWhen: [
      'Hay al menos un filtro por query string o un scope',
      'O una regla que impide una acción (ej. no borrar completadas)',
    ],
    steps: [
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
    ],
    tests: [
      {
        method: 'GET',
        path: 'http://127.0.0.1:8000/api/tareas?pendientes=1',
        expect: 'Solo tareas con completada: false (si elegiste la opción A).',
      },
    ],
    tips: [
      'Elige una sola regla y hazla bien. Calidad > cantidad.',
      'Documenta en un comentario o README del repo qué regla implementaste.',
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
  { code: '200', meaning: 'OK — lectura o update exitoso' },
  { code: '201', meaning: 'Created — recurso creado (POST)' },
  { code: '204', meaning: 'No Content — delete exitoso sin body' },
  { code: '404', meaning: 'Not Found — id o ruta inexistente' },
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
    problem: 'Cambié una ruta y no aparece',
    fix: 'route:list de nuevo. Reinicia php artisan serve si hace falta.',
  },
]
