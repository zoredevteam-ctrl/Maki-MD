import { buildCtx } from '../../core/system/context.js'

const handler = async (m, { conn }) => {
    const response = await fetch(global.icon)
    const buffer   = Buffer.from(await response.arrayBuffer())
    const base64   = buffer.toString('base64')

    await conn.sendMessage(m.chat, {
        document:   buffer,
        mimetype:   'application/pdf',
        fileName:   '　.pdf',
        fileLength: 2199023255552,
        pageCount:  2026,
        caption:    `*ᐛ🎀* Hola *${m.pushName}*\n> Esto es una prueba del thumbnail. 👑`,
        contextInfo: {
            isForwarded:      true,
            forwardingScore:  999,
            externalAdReply: {
                title:                 global.botName,
                body:                  global.botText,
                mediaType:             1,
                thumbnail:             base64,
                renderLargerThumbnail: true,
                sourceUrl:             global.rcanal
            },
            forwardedNewsletterMessageInfo: {
                newsletterJid:   global.newsletterJid,
                newsletterName:  global.newsletterName,
                serverMessageId: -1
            }
        }
    }, { quoted: m })
}

handler.command = ['test', 'prueba']
handler.tags    = ['tools']
export default handler
