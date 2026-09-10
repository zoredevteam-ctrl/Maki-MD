const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Proporciona un enlace válido de Instagram.')

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const apiUrl =
      `${global.api}/download/instagram` +
      `?url=${encodeURIComponent(text.trim())}` +
      `&apikey=${encodeURIComponent(global.apikey)}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API respondió con HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data?.status) {
      throw new Error('La API no pudo procesar el enlace de Instagram.')
    }

    const downloadUrl = data?.result?.dl

    if (!downloadUrl) {
      throw new Error('La API no devolvió un enlace de descarga.')
    }

    await conn.sendMessage(
      m.chat,
      {
        video: {
          url: downloadUrl
        },
        caption: '✿ Aquí tienes'
      },
      {
        quoted: m
      }
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (err) {
    console.error('❌ Error en el plugin de Instagram:', err)

    await conn.sendMessage(
      m.chat,
      {
        text:
          `❌ Error al procesar la solicitud.\n` +
          `❌ Detalles: ${err.message}`
      },
      {
        quoted: m
      }
    )

    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    })
  }
}

handler.command = ['ig', 'instagram']
handler.tags = ['descargas']
handler.group = true

export default handler