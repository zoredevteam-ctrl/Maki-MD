import { exec } from 'child_process'
import fs from 'fs'
import util from 'util'
import crypto from 'crypto'
import { generateWAMessageFromContent, downloadContentFromMessage } from '@whiskeysockets/baileys'

const execAsync = util.promisify(exec)

const BOT_NAME = () => global.botName || 'Makima'
const AUTHOR   = 'arom'

let _webpMod        = null
let _ffmpegStaticP  = undefined

async function getWebp() {
    if (_webpMod === null) {
        try { _webpMod = (await import('node-webpmux')).default } catch { _webpMod = false }
    }
    return _webpMod || null
}

async function getFfmpegStatic() {
    if (_ffmpegStaticP === undefined) {
        try {
            const m = await import('ffmpeg-static')
            _ffmpegStaticP = m.default || m || null
        } catch { _ffmpegStaticP = null }
    }
    return _ffmpegStaticP
}

async function resolveFfmpeg() {
    const p = await getFfmpegStatic()
    if (p && fs.existsSync(p)) return `"${p}"`
    return 'ffmpeg'
}

async function addExif(webpBuffer, packname, author) {
    const webp = await getWebp()
    if (!webp) return null

    const img = new webp.Image()
    const stickerPackId = crypto.randomBytes(32).toString('hex')
    const json = {
        'sticker-pack-id': stickerPackId,
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': ['\u{1F916}']
    }
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuffer])
    exif.writeUIntLE(jsonBuffer.length, 14, 4)
    await img.load(webpBuffer)
    img.exif = exif
    return await img.save(null)
}

const styles = {
    circle: 'C\u00edrculo (recorte redondo)',
    crop:   'Recorte centrado 512x512',
    bw:     'Blanco y negro',
    invert: 'Invertir colores',
    blur:   'Desenfoque',
    pixel:  'Pixelado',
    sepia:  'Sepia',
    neon:   'Bordes tipo ne\u00f3n'
}

const handler = async (m, { conn, args, usedPrefix }) => {
    const from = m?.chat || m?.key?.remoteJid
    if (!from) return

    const opt = (args?.[0] || '').toLowerCase()

    const listText =
        '\u25AE\u25AE _Lista de estilos_ (*s* <estilo>)\n\n' +
        Object.keys(styles).map(k => `\u2022 *s ${k}* \u2014 ${styles[k]}`).join('\n') +
        '\n\n\u2022 *s list*'

    if (opt === 'list') {
        return await conn.sendMessage(from, { text: listText }, { quoted: m })
    }

    if (opt === 'details') {
        try {
            const detailMsg = generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            header: {
                                title: BOT_NAME(),
                                hasMediaAttachment: false
                            },
                            body: {
                                text: 'Estos son todos los estilos disponibles para crear tu sticker personalizado:\n\n' +
                                    Object.keys(styles).map(k => `\u2022 *s ${k}* \u2014 ${styles[k]}`).join('\n')
                            },
                            footer: { text: `🔴 ${BOT_NAME()} · ${AUTHOR}` },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'inapp_signup',
                                        buttonParamsJson: '{}'
                                    }
                                ],
                                messageParamsJson: ''
                            },
                            contextInfo: {}
                        }
                    }
                }
            }, {
                quoted: m,
                userJid: conn.user?.id
            })

            await conn.relayMessage(from, detailMsg.message, { messageId: detailMsg.key.id })
        } catch {
            await conn.sendMessage(from, { text: listText }, { quoted: m })
        }
        return
    }

    const imageMessage = m.quoted?.mtype === 'imageMessage' ? m.quoted.msg : (m.mtype === 'imageMessage' ? m.msg : null)
    const videoMessage = m.quoted?.mtype === 'videoMessage' ? m.quoted.msg : (m.mtype === 'videoMessage' ? m.msg : null)

    const isImage = !!imageMessage
    const isVideo = !!videoMessage

    if (!isImage && !isVideo) {
        const helpText =
            `Hola ${m.pushName || 'usuario'}, responde a una *imagen* o *video* para crear tu sticker.\n\n` +
            `\u2022 *s circle* \u2014 circulo\n` +
            `\u2022 *s crop* \u2014 recorte 512x512\n` +
            `\u2022 *s bw* \u2014 blanco y negro\n` +
            `\u2022 *s blur* \u2014 desenfoque\n` +
            `\u2022 *s pixel* \u2014 pixelado\n` +
            `\u2022 *s neon* \u2014 bordes neon\n` +
            `\u2022 *s list* \u2014 ver todos los estilos`

        const interactivePayload = {
            header: {
                title: BOT_NAME(),
                hasMediaAttachment: false
            },
            body: {
                text: helpText
            },
            footer: { text: `🔴 ${BOT_NAME()} · ${AUTHOR}` },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({ display_text: 'Ver detalles', id: `${usedPrefix || '#'}s details` })
                    }
                ],
                messageParamsJson: ''
            },
            contextInfo: {}
        }

        try {
            const msg = generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: interactivePayload
                    }
                }
            }, {
                quoted: m,
                userJid: conn.user?.id
            })

            await conn.relayMessage(from, msg.message, { messageId: msg.key.id })
        } catch {
            await conn.sendMessage(from, { text: helpText }, { quoted: m })
        }
        return
    }

    const msg = isImage ? imageMessage : videoMessage
    const dlType = isImage ? 'image' : 'video'

    const stream = await downloadContentFromMessage(msg, dlType)

    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    const ts = Date.now()
    const input = `./temp_${ts}.${isImage ? 'jpg' : 'mp4'}`
    const output = `./temp_${ts}.webp`

    await fs.promises.writeFile(input, buffer)

    const style = opt || 'circle'
    if (style && !styles[style]) {
        await conn.sendMessage(from, { text: listText }, { quoted: m })
        if (fs.existsSync(input)) await fs.promises.unlink(input)
        return
    }

    const baseContain =
        'fps=15,' +
        'scale=512:512:force_original_aspect_ratio=decrease,' +
        'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0'

    const baseCoverCrop =
        'fps=15,' +
        'scale=512:512:force_original_aspect_ratio=increase,' +
        'crop=512:512'

    const geqCircle = "geq=lum='p(X,Y)':a='if(lte(hypot(X-256,Y-256),256),255,0)'"

    const vf =
        style === 'circle' ? `${baseCoverCrop},format=rgba,${geqCircle}` :
        style === 'crop' ? baseCoverCrop :
        style === 'bw' ? `${baseContain},hue=s=0` :
        style === 'invert' ? `${baseContain},negate` :
        style === 'blur' ? `${baseContain},gblur=sigma=6` :
        style === 'pixel' ? `${baseContain},scale=128:128:flags=neighbor,scale=512:512:flags=neighbor` :
        style === 'sepia' ? `${baseContain},colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131` :
        style === 'neon' ? `${baseContain},edgedetect=low=0.08:high=0.2` :
        `${baseCoverCrop},format=rgba,${geqCircle}`

    const ffmpegBin = await resolveFfmpeg()

    try {
        await execAsync(`${ffmpegBin} -version`)
    } catch {
        await conn.sendMessage(
            from,
            {
                text:
                    'No se pudo crear el sticker: el binario de *ffmpeg* no esta disponible.\n' +
                    'Instalalo en el servidor con:\n' +
                    '`sudo apt install ffmpeg`\n\n' +
                    'o reinstala el paquete `ffmpeg-static`:\n' +
                    '`npm install ffmpeg-static`'
            },
            { quoted: m }
        )
        if (fs.existsSync(input)) await fs.promises.unlink(input)
        return
    }

    const ffmpegCmd = isVideo
        ? `${ffmpegBin} -y -i "${input}" -t 8 -an -vf "${vf}" -loop 0 -fps_mode passthrough "${output}"`
        : `${ffmpegBin} -y -i "${input}" -an -vf "${vf}" -loop 0 -fps_mode passthrough "${output}"`

    try {
        await execAsync(ffmpegCmd)
        let stickerBuffer = await fs.promises.readFile(output)

        const withExif = await addExif(stickerBuffer, BOT_NAME(), AUTHOR)
        if (withExif) stickerBuffer = withExif

        await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: m })

        if (!withExif) {
            await conn.sendMessage(
                from,
                { text: '⚠️ El sticker se envió sin el paquete personalizado. Instala `node-webpmux` para el nombre y autor:\n`npm install node-webpmux`' },
                { quoted: m }
            )
        }
    } catch (e) {
        const err = (e?.stderr || e?.stdout || e?.message || String(e) || '').toString()
        await conn.sendMessage(
            from,
            {
                text:
                    'Error creando el sticker.\n\n' +
                    `Estilo: *${style}*\n` +
                    `Error:\n\`\`\`\n${err.slice(0, 3500)}\n\`\`\``
            },
            { quoted: m }
        )
    } finally {
        if (fs.existsSync(input)) await fs.promises.unlink(input)
        if (fs.existsSync(output)) await fs.promises.unlink(output)
    }
}

handler.command  = ['sticker', 's', 'stiker']
handler.tags     = ['sticker']
handler.category = ['sticker']
handler.help     = ['sticker', 's', 'stiker']
handler.desc     = 'Convierte imagenes/videos en stickers con estilos'

export default handler
