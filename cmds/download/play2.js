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

    const isUrl =
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(input)

    let youtubeUrl = input
    let searchInfo = null

    if (!isUrl) {
      const search = await yts(input)

      if (!search?.videos?.length) {
        throw new Error('No encontré resultados para esa búsqueda.')
      }

      const video = search.videos[0]

      youtubeUrl = video.url

      searchInfo = {
        title: video.title,
        thumbnail: video.thumbnail,
        author: video.author?.name || 'Desconocido',
        duration: video.timestamp || 'Desconocida',
        views: video.views || 0,
        ago: video.ago || 'Desconocido'
      }
    }

    const apiUrl =
      `${global.api}/download/ytv2` +
      `?url=${encodeURIComponent(youtubeUrl)}` +
      `&apikey=${encodeURIComponent(global.apikey)}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`La API respondió con HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data?.status || !data?.result?.dl_url) {
      throw new Error(
        data?.message ||
        data?.result?.message ||
        'La API no pudo descargar el video.'
      )
    }

    const result = data.result

    const title =
      result.title ||
      searchInfo?.title ||
      'Sin título'

    const thumbnail =
      result.thumb ||
      searchInfo?.thumbnail

    const author =
      result.author ||
      searchInfo?.author ||
      'Desconocido'

    const duration =
      result.duration ||
      searchInfo?.duration ||
      'Desconocida'

    const views = Number(
      searchInfo?.views || 0
    ).toLocaleString('es-ES')

    const quality =
      result.quality ||
      '360p'

    const caption =
      `🎬 ${title}\n\n` +
      `👤 Canal: ${author}\n` +
      `⏱️ Duración: ${duration}\n` +
      `👁️ Vistas: ${views}\n` +
      `📺 Calidad: ${quality}\n\n` +
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

    await conn.sendMessage(
      m.chat,
      {
        video: {
          url: result.dl_url
        },
        mimetype: 'video/mp4',
        fileName: `${title
          .replace(/[\\/:*?"<>|]/g, '')
          .trim()}.mp4`,
        caption: `🎬 ${title}`
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
    console.error('❌ Error en el plugin play2:', err)

    await conn.sendMessage(
      m.chat,
      {
        text: `❌ No se pudo descargar el video.\n\n${err.message}`
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

handler.command = ['play2', 'mp4', 'ytmp4']
handler.tags = ['descargas']
handler.group = true

export default handler