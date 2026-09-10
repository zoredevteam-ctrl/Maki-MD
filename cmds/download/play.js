import yts from 'yt-search'

const handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      '⚠️ Escribe el nombre de su búsqueda.'
    )
  }

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    const input = text.trim()

    const isUrl = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(input)

    let youtubeUrl = input
    let videoInfo = null

    if (!isUrl) {
      const search = await yts(input)

      if (!search?.videos?.length) {
        throw new Error('No encontré resultados para esa búsqueda.')
      }

      const video = search.videos[0]

      youtubeUrl = video.url

      videoInfo = {
        title: video.title,
        thumbnail: video.thumbnail,
        duration: video.timestamp || video.duration?.toString() || 'Desconocida',
        views: video.views || 0,
        author: video.author?.name || 'Desconocido',
        ago: video.ago || 'Desconocido',
        url: video.url
      }
    }

    const apiUrl =
      `${global.api}/download/audio` +
      `?url=${encodeURIComponent(youtubeUrl)}` +
      `&apikey=${encodeURIComponent(global.apikey)}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`La API respondió con HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data?.status || !data?.result?.status) {
      throw new Error(
        data?.message ||
        data?.result?.message ||
        'La API no pudo descargar el audio.'
      )
    }

    const result = data.result
    const info = result.info || {}

    const audioUrl = result.url

    if (!audioUrl) {
      throw new Error('La API no devolvió el enlace del audio.')
    }

    if (!isUrl) {
      const title = videoInfo?.title || info.title || 'Sin título'
      const thumbnail = videoInfo?.thumbnail || info.thumbnail

      const duration =
        videoInfo?.duration ||
        info.duration ||
        'Desconocida'

      const views = Number(videoInfo?.views || 0).toLocaleString('es-ES')

      const channel =
        videoInfo?.author ||
        info.channel ||
        'Desconocido'

      const caption =
        `🎵 ${title}\n\n` +
        `👤 Canal: ${channel}\n` +
        `⏱️ Duración: ${duration}\n` +
        `👁️ Vistas: ${views}\n` +
        `📦 Formato: ${result.format || 'mp3'}\n` +
        `💾 Tamaño: ${info.sizeB || 'Desconocido'}\n\n` +
        `▶️ Link: ${youtubeUrl}`

      if (thumbnail) {
        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: thumbnail
            },
            caption
          },
          {
            quoted: m
          }
        )
      } else {
        await conn.sendMessage(
          m.chat,
          {
            text: caption
          },
          {
            quoted: m
          }
        )
      }
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: {
          url: audioUrl
        },
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${(info.title || videoInfo?.title || 'audio')
          .replace(/[\\/:*?"<>|]/g, '')
          .trim()}.mp3`
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
    console.error('❌ Error en el plugin play:', err)

    await conn.sendMessage(
      m.chat,
      {
        text: `❌ No se pudo obtener el audio.\n\n${err.message}`
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

handler.command = ['play', 'mp3', 'ytmp3']
handler.tags = ['descargas']
handler.group = true

export default handler