const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Proporciona un enlace válido de Facebook.')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const videoUrl = `${global.api}/download/facebook?url=${encodeURIComponent(text)}&apikey=${global.apikey}`

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: '✿ Aquí tienes'
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error('❌ Error en el plugin de Facebook:', err)
    await conn.sendMessage(
      m.chat,
      { text: `❌ Error al procesar la solicitud.\n❌ Detalles: ${err.message}` },
      { quoted: m }
    )
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.command = ['fb', 'facebook']
handler.tags = ['descargas']
handler.group = true

export default handler
