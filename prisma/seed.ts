// ⚠️ ADVERTENCIA: Este seed borra TODOS los datos existentes antes de insertar.
// Correr solo en entornos limpios o cuando quieras resetear la DB completamente.
// Para correr: npx prisma db seed
// Para la cátedra: yo cargué a mano todos los datos, así que no es necesario correr este seed.
// Solo úsalo si quieres probar con datos nuevos o resetear la DB.
// Este seed crea 7 pagos (3 aprobados, 2 pendientes, 2 rechazados), 3 transacciones y 3 disputas (1 abierta, 1 resuelta, 1 perdida).
// Fue generado automáticamente por IA para facilitar las pruebas, pero podés modificarlo a tu gusto para crear otros escenarios.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // Limpiar datos existentes
  await prisma.transaccion.deleteMany()
  await prisma.disputa.deleteMany()
  await prisma.pago.deleteMany()

  // Crear pagos de ejemplo
  const pagos = await Promise.all([
    // Pagos aprobados
    prisma.pago.create({
      data: {
        ordenId: 'order-001',
        userId: 'user-001',
        monto: 249999,
        estado: 'APROBADO',
        preferenceId: 'pref-mp-001',
      },
    }),
    prisma.pago.create({
      data: {
        ordenId: 'order-002',
        userId: 'user-002',
        monto: 179999,
        estado: 'APROBADO',
        preferenceId: 'pref-mp-002',
      },
    }),
    prisma.pago.create({
      data: {
        ordenId: 'order-003',
        userId: 'user-003',
        monto: 359999,
        estado: 'APROBADO',
        preferenceId: 'pref-mp-003',
      },
    }),
    // Pagos pendientes
    prisma.pago.create({
      data: {
        ordenId: 'order-004',
        userId: 'user-004',
        monto: 99999,
        estado: 'PENDIENTE',
        preferenceId: 'pref-mp-004',
      },
    }),
    prisma.pago.create({
      data: {
        ordenId: 'order-005',
        userId: 'user-005',
        monto: 449999,
        estado: 'PENDIENTE',
        preferenceId: 'pref-mp-005',
      },
    }),
    // Pagos rechazados
    prisma.pago.create({
      data: {
        ordenId: 'order-006',
        userId: 'user-006',
        monto: 129999,
        estado: 'RECHAZADO',
        preferenceId: 'pref-mp-006',
      },
    }),
    prisma.pago.create({
      data: {
        ordenId: 'order-007',
        userId: 'user-007',
        monto: 299999,
        estado: 'RECHAZADO',
        preferenceId: 'pref-mp-007',
      },
    }),
  ])

  console.log(`✅ ${pagos.length} pagos creados`)

  // Crear transacciones para pagos aprobados
  const transacciones = await Promise.all([
    prisma.transaccion.create({
      data: {
        pagoId: pagos[0].id,
        metodo: 'credit_card',
        saleId: 'sale-001',
        shipmentId: 'ship-001',
      },
    }),
    prisma.transaccion.create({
      data: {
        pagoId: pagos[1].id,
        metodo: 'debit_card',
        saleId: 'sale-002',
        shipmentId: 'ship-002',
      },
    }),
    prisma.transaccion.create({
      data: {
        pagoId: pagos[2].id,
        metodo: 'credit_card',
        saleId: 'sale-003',
        shipmentId: 'ship-003',
      },
    }),
  ])

  console.log(`✅ ${transacciones.length} transacciones creadas`)

  // Crear disputas de ejemplo
  const disputas = await Promise.all([
    prisma.disputa.create({
      data: {
        pagoId: pagos[0].id,
        userId: 'user-001',
        motivo: 'Producto no recibido',
        estado: 'ABIERTA',
        origen: 'usuario',
      },
    }),
    prisma.disputa.create({
      data: {
        pagoId: pagos[1].id,
        userId: 'user-002',
        motivo: 'Producto diferente al solicitado',
        estado: 'RESUELTA',
        origen: 'usuario',
      },
    }),
    prisma.disputa.create({
      data: {
        pagoId: pagos[2].id,
        userId: 'user-003',
        motivo: 'Transacción fraudulenta',
        estado: 'PERDIDA',
        origen: 'chargeback',
      },
    }),
  ])

  console.log(`✅ ${disputas.length} disputas creadas`)

  console.log('🌱 Seed completado exitosamente!')
  console.log(`
📊 Datos precargados:
  • Pagos: 7 (3 aprobados, 2 pendientes, 2 rechazados)
  • Transacciones: 3
  • Disputas: 3 (1 abierta, 1 resuelta, 1 perdida)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
