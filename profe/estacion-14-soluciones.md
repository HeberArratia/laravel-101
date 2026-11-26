# Estación 14 — Soluciones (profe)

Referencia rápida para revisar o destrabar en clase. Los estudiantes **no** tienen estas pistas en la guía.

Contexto: se practican en el `store` (o un endpoint de prueba). Los campos pueden validarse aunque no se guarden en la BD.

---

## Setup típico

```php
public function store(Request $request)
{
    $datos = $request->validate(
        [
            // reglas de cada desafío…
        ],
        [
            // mensajes (desafío 6)
        ]
    );

    // …crear recurso con lo que sí persistas
}
```

Headers al probar: `Accept: application/json` + `Content-Type: application/json`.

---

## Desafío 1 — edad mínima

**Pedido:** `edad` obligatorio, entero, no menor a 18.  
17 → 422 · 18 → ok.

```php
'edad' => ['required', 'integer', 'min:18'],
```

| Body | Resultado |
|------|-----------|
| `"edad": 17` | 422 (`min`) |
| `"edad": 18` | ok |
| `"edad": 18.5` | 422 (`integer`) |
| sin `edad` | 422 (`required`) |

Nota: `min:18` en número = valor ≥ 18. No confundir con `min` en strings (largo).

---

## Desafío 2 — email válido

**Pedido:** `email` obligatorio con formato de correo.  
`"hola"` → 422 · `"hola@ejemplo.com"` → ok.

```php
'email' => ['required', 'email'],
```

| Body | Resultado |
|------|-----------|
| `"email": "hola"` | 422 |
| `"email": "hola@"` | 422 |
| `"email": "hola@ejemplo.com"` | ok |

---

## Desafío 3 — precio no negativo + tope

**Pedido:** numérico, ≥ 0, ≤ 1_000_000.  
-5 → 422 · 0 → ok · 1000001 → 422.

```php
'precio' => ['required', 'numeric', 'min:0', 'max:1000000'],
```

| Body | Resultado |
|------|-----------|
| `"precio": -5` | 422 (`min`) |
| `"precio": 0` | ok |
| `"precio": 9.90` | ok (`numeric` permite decimales) |
| `"precio": 1000001` | 422 (`max`) |
| `"precio": "hola"` | 422 (`numeric`) |

Si alguien usa `integer` acá, `9.90` fallaría: el desafío pide `numeric`.

---

## Desafío 4 — nombre con largo mínimo

**Pedido:** string obligatorio de al menos 3 caracteres.  
`"Al"` → 422 · `"Ana"` → ok.

```php
'nombre' => ['required', 'string', 'min:3'],
```

| Body | Resultado |
|------|-----------|
| `"nombre": "Al"` | 422 (2 chars) |
| `"nombre": "Ana"` | ok |
| `"nombre": ""` | 422 (`required` / `min`) |

Truco frecuente: confundir con `min` de números. Acá `min:3` = longitud.

---

## Desafío 5 — rol de una lista

**Pedido:** solo `admin`, `editor` o `viewer`.  
`"super"` → 422 · `"editor"` → ok.

```php
'rol' => ['required', 'in:admin,editor,viewer'],
```

| Body | Resultado |
|------|-----------|
| `"rol": "super"` | 422 |
| `"rol": "editor"` | ok |
| `"rol": "Admin"` | 422 (case-sensitive por defecto) |

Si falla con mayúsculas, está bien: `in` es sensible a mayúsculas/minúsculas.

---

## Desafío 6 — mensajes en español

**Pedido:** personalizar `required` y `min` (edad o precio) para que el 422 muestre texto propio.

```php
$datos = $request->validate(
    [
        'edad' => ['required', 'integer', 'min:18'],
        // …otras reglas
    ],
    [
        'edad.required' => 'La edad es obligatoria.',
        'edad.min' => 'Debés ser mayor de 18 años.',
        // opcionales:
        'edad.integer' => 'La edad debe ser un número entero.',
    ]
);
```

Clave del mensaje: `campo.regla` → `edad.min`, `email.email`, `precio.required`.

Con `"edad": 15` el JSON debería incluir algo como:

```json
{
  "message": "Debés ser mayor de 18 años.",
  "errors": {
    "edad": ["Debés ser mayor de 18 años."]
  }
}
```

Si sigue en inglés: no pasaron el 2º argumento, o la clave no coincide con la regla que falló (`edad.min` vs `edad.gt`).

---

## Todo junto (referencia completa)

```php
$datos = $request->validate(
    [
        'titulo' => ['required', 'string', 'max:150'],
        'edad' => ['required', 'integer', 'min:18'],
        'email' => ['required', 'email'],
        'precio' => ['required', 'numeric', 'min:0', 'max:1000000'],
        'nombre' => ['required', 'string', 'min:3'],
        'rol' => ['required', 'in:admin,editor,viewer'],
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
        'precio.max' => 'El precio no puede superar 1.000.000.',
        'nombre.required' => 'El nombre es obligatorio.',
        'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
        'rol.required' => 'El rol es obligatorio.',
        'rol.in' => 'El rol debe ser admin, editor o viewer.',
    ]
);
```

No hace falta que los 6 campos estén activos a la vez en clase: se pueden ir sumando desafío a desafío.

---

## Errores típicos en laboratorio

1. Sin `Accept: application/json` → ven HTML, no el JSON 422.
2. Validan pero no mandan el campo en el body → siempre `required`.
3. `min:18` en un string `"18"` con regla `string` cuenta caracteres, no valor.
4. Mensajes personalizados con clave mal escrita (`edad.minimum` en vez de `edad.min`).
5. Quieren persistir `edad`/`email` sin `$fillable` ni columna → MassAssignment / SQL error (para práctica, validar sin guardar alcanza).
