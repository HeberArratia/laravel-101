# Estación 15 — Colecciones · Soluciones (profe)

Los estudiantes no tienen estas pistas en la guía. Práctica en `tinker` o en el `index`.

```bash
php artisan tinker
```

Asumimos seed con varias tareas (algunas `completada: true/false`).

---

## Desafío 1 — solo pendientes

```php
use App\Models\Tarea;

Tarea::all()->where('completada', false)->values();

// o
Tarea::all()->filter(fn ($t) => $t->completada === false)->values();

// mejor en query si la tabla es grande:
Tarea::where('completada', false)->get();
```

En el controller:

```php
return response()->json(
    Tarea::all()->where('completada', false)->values()
);
```

---

## Desafío 2 — solo títulos

```php
Tarea::all()->pluck('titulo');
// => ["Estudiar validaciones", "Comprar pan", ...]
```

```php
return response()->json(Tarea::all()->pluck('titulo'));
```

---

## Desafío 3 — contar pendientes

```php
$n = Tarea::all()->where('completada', false)->count();
// o
$n = Tarea::where('completada', false)->count();
```

```php
return response()->json([
    'pendientes' => Tarea::all()->where('completada', false)->count(),
]);
```

---

## Desafío 4 — ordenar por título

```php
Tarea::all()->sortBy('titulo')->values();

// sortByDesc para Z→A
Tarea::all()->sortByDesc('titulo')->values();
```

Sin `->values()`, el JSON puede verse con claves “agujereadas” (índices originales).

En query:

```php
Tarea::orderBy('titulo')->get();
```

---

## Desafío 5 — map a resumen

```php
Tarea::all()->map(function ($t) {
    return [
        'id' => $t->id,
        'titulo' => $t->titulo,
        'estado' => $t->completada ? 'ok' : 'pendiente',
    ];
})->values();
```

Arrow (PHP 8+):

```php
Tarea::all()->map(fn ($t) => [
    'id' => $t->id,
    'titulo' => $t->titulo,
    'estado' => $t->completada ? 'ok' : 'pendiente',
])->values();
```

---

## Desafío 6 — paginar de a 5

```php
public function index()
{
    return Tarea::paginate(5);
}
```

Probar:

- `GET /api/tareas?page=1` → `current_page: 1`, hasta 5 en `data`
- `GET /api/tareas?page=2` → `current_page: 2`

**Importante:** `paginate` va en el builder (`Tarea::paginate(5)`), no en `Tarea::all()->paginate(5)` (eso no existe / no es el mismo API).

Para paginar una Collection ya cargada (raro en APIs):

```php
// no preferible en producción
Tarea::all()->forPage(2, 5)->values();
```

---

## Combo útil en clase (demo rápida)

```php
$tareas = Tarea::all();

[
    'total' => $tareas->count(),
    'pendientes' => $tareas->where('completada', false)->count(),
    'titulos' => $tareas->pluck('titulo'),
    'resumen' => $tareas->map(fn ($t) => [
        'id' => $t->id,
        'estado' => $t->completada ? 'ok' : 'pendiente',
    ])->values(),
];
```

---

## Errores típicos

1. Olvidar `->values()` después de `filter`/`where`/`sortBy` → JSON con índices raros.
2. Confundir `pluck('titulo')` con `map` (pluck = un campo; map = forma libre).
3. Intentar `Tarea::all()->paginate(5)` → usar `Tarea::paginate(5)`.
4. Filtrar en Collection con miles de filas → mejor `where` en la query.
5. `firstWhere` vs `where`: `where` devuelve colección; `firstWhere` un solo modelo o null.
