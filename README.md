[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Ks7Ywtwc)

# Payments App

> Aplicación de gestión de pagos del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/). Procesa transacciones con MercadoPago, gestiona disputas y coordina con los módulos de Vendedor y Envíos. Incluye panel de administración y autenticación con Clerk.

🔗 **Deploy:** *https://proyecto-c-payments-dev-squad.vercel.app/*

---

## Cuentas de prueba

| Rol | Acceso |
|-----|--------|
| Administrador | admin+clerk_test@iaw.com |
| Usuario final | payments+clerk_test@iaw.com |

Contraseña: iawuser#

---

## Variables de entorno

Ver `.env.example` para la lista completa.

| Variable | Descripción |
|----------|-------------|
| `MP_ACCESS_TOKEN` | Access token de MercadoPago |
| `DATABASE_URL` | Connection string de PostgreSQL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key de Clerk |
| `CLERK_SECRET_KEY` | Secret key de Clerk |
| `NEXT_PUBLIC_URL` | URL pública de la app |
| `BUYER_APP_URL` | URL de la Buyer App |
| `SELLER_APP_URL` | URL de la Seller App |
| `SHIPPING_APP_URL` | URL de la app de Envíos |
| `ORS_API_KEY` | API key de OpenRouteService |

#### Debilidades de mi App
Me hubiera gustado tener un sistema de disputas que no sea meramente representativo. En el estado actual, no funciona como mediador entre Seller y Buyer para que se pueda retornar el dinero. Sirve para ver un pantallazo de cómo se vería desde un rol administrativo.

Otra funcionalidad que no hemos agregado, al menos en esta etapa, es la de Cancelar Pedido. Pensamos que probablemente sería mucho más sencillo de implementar cuando tengamos las integraciones hechas.

## Conocido / Known Issues

- El checkout de MercadoPago genera un warning de CSP en consola (`Executing inline script violates...`). No afecta el funcionamiento del pago ni el flujo de la app.
- Cuando el usuario accede a pagar (ya redirigido a MP), y presiona el botón para volver hacia atrás, salta Error de Pago, pero en la DB figura como pendiente. Esto sucede porque al regresar se consulta el estado de la transacción y este es "PENDIENTE". He explorado distintas soluciones y estará hecho en la siguiente etapa.
- El webhook de MercadoPago está implementado para entornos productivos. En pruebas, el procesamiento del pago se realiza a través de /api/payments/confirm.
- Mi App podría responder mucho más rápido, pero no he hallado el tiempo para mejorar el tiempo de respuesta. Es algo importante que mejoraré definitivamente para la tercera etapa.

#### Fortalezas de mi App
En el panel de Admin posee un gráfico ilustrativo para comparar las transacciones por monto entre 7 y 30 días. Es realmente útil para un usuario administrador, pues puede visualizar mejor el procesamiento de los datos. La sidebar se actualiza dependiendo del rol, así que el administrador tiene acceso a las disputas, listado de transacciones que filtra entre las diez que aparezcan por pantalla y el dashboard (donde están las stats).

El usuario puede realizar una disputa apenas el pago retorne como exitoso. Si bien no tenemos un botón de arrepentimiento, esto es lo más cercano porque, una vez iniciada una disputa, aparece en el panel de disputas del administrador.

La App presenta un modo oscuro/claro con un tamaño adecuado de las letras. Hemos adaptado el logo para que se vea claramente en ambos temas.

Además, se utiliza una API para calcular el costo de envío cuando corresponde (configurable mediante "ORS_API_KEY"). Mejora la precisión del precio mostrado al usuario al calcular el costo según dirección y carrier y automatiza el proceso evitando cálculos manuales. Se puede configurar el costo fácilmente.

Se puede utilizar tanto por la computadora como mediante un teléfono. Está adaptada para que sea amigable con el usuario si este desea emplear un celular.


#### NOTAS
- La asignación de roles se hace mediante publicMetadata.role en Clerk.
- En mi App, nunca utilicé el seed.ts; siempre cargué todo a mano. Lo dejé como opción para que la cátedra lo utilice si así lo cree conveniente.

