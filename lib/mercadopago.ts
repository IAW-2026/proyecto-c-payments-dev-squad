//Cliente mp configurado para usar en toda la app

import { MercadoPagoConfig } from 'mercadopago'

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})