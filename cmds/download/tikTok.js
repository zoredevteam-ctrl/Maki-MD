const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Proporciona un enlace válido de TikTok.')

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const apiUrl =
      `${global.api}/download/tiktok` +
      `?url=${encodeURIComponent(text.trim())}` +
      `&apikey=${encodeURIComponent(global.apikey)}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API respondió con HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data?.status) {
      throw new Error(
        data?.message ||
        data?.result?.msg ||
        'La API no pudo procesar el enlace de TikTok.'
      )
    }

    const video = data?.result?.data

    if (!video) {
      throw new Error('La API no devolvió información del video.')
    }

    const videoUrl = video.hdplay || video.play

    if (!videoUrl) {
      throw new Error('No se encontró el video para descargar.')
    }

    const author = video.author || {}

    const formatNumber = n =>
      Number(n || 0).toLocaleString('es-ES')

    const caption =
      `📝 ${video.title || 'Sin título'}\n\n` +
      `👤 Autor: ${author.nickname || author.unique_id || 'Desconocido'}\n` +
      `🆔 ID: ${video.id || 'N/A'}\n` +
      `🌎 Región: ${video.region || 'N/A'}\n` +
      `⏱️ Duración: ${video.duration || 0}s\n\n` +
      `📊 ESTADÍSTICAS\n` +
      `👁️ Vistas: ${formatNumber(video.play_count)}\n` +
      `❤️ Likes: ${formatNumber(video.digg_count)}\n` +
      `💬 Comentarios: ${formatNumber(video.comment_count)}\n` +
      `🔄 Compartidos: ${formatNumber(video.share_count)}\n` +
      `⬇️ Descargas: ${formatNumber(video.download_count)}\n` +
      `⭐ Favoritos: ${formatNumber(video.collect_count)}`

    await conn.sendMessage(
      m.chat,
      {
        video: {
          url: videoUrl
        },
        caption
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
    console.error('❌ Error en el plugin de TikTok:', err)

    await conn.sendMessage(
      m.chat,
      {
        text: `❌ Error al procesar la solicitud.`
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

handler.command = ['tt', 'tiktok']
handler.tags = ['descargas']
handler.group = true

export default handler