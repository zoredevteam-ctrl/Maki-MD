import { exec } from 'child_process'
import { buildCtx } from '../../core/system/context.js'

const handler = async (m, { conn }) => {
    const ctx  = await buildCtx()
    const start = Date.now()

    const sent = await conn.sendMessage(m.chat, {
        text: '〔 ◈ 〕Verificando repositorio...',
        contextInfo: ctx
    }, { quoted: m })

    exec('git fetch --all && git pull', async (err, stdout, stderr) => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1)

        if (err) {
            await conn.sendMessage(m.chat, {
                text:
                    `〔 ✖ 〕*Actualización fallida*\n\n` +
                    `> ${err.message.slice(0, 400)}\n\n` +
                    `> ◌ Tiempo: ${elapsed}s`,
                edit: sent.key
            })
            return m.react('✖️')
        }

        const raw     = (stdout || stderr || '').trim()
        const updated = !raw.includes('Already up to date') && !raw.includes('Ya está actualizado') && raw.length > 0

        const lines = raw
            .split('\n')
            .filter(l => l.trim())
            .slice(0, 6)
            .map(l => `> ◌ ${l.trim()}`)
            .join('\n')

        if (!updated) {
            await conn.sendMessage(m.chat, {
                text:
                    `〔 ◈ 〕*Sin cambios pendientes*\n\n` +
                    `> ◌ El repositorio ya está en su versión más reciente.\n` +
                    `> ◌ Tiempo: ${elapsed}s`,
                edit: sent.key
            })
            return m.react('✅')
        }

        await conn.sendMessage(m.chat, {
            text:
                `〔 ◈ 〕*Actualización completada*\n\n` +
                `${lines}\n\n` +
                `> ◌ Tiempo: ${elapsed}s\n` +
                `> ◌ Reinicia el bot para aplicar los cambios.`,
            edit: sent.key
        })

        m.react('✅')
    })
}

handler.command = ['update', 'actualizar']
handler.tags    = ['owner']
handler.owner   = true
export default handler
