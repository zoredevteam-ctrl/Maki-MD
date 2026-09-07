import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: '✦ Por favor escribe la pregunta que quieras hacerle a Gemini.'
        }, { quoted: m })
    }

    const res = await fetch('https://aquire-api.vercel.app/ai/gemini?text=' + encodeURIComponent(text))
    const data = await res.json()

    await conn.sendMessage(m.chat, {
        text: `${data.respuesta}`
    }, { quoted: m })
}

handler.command = ['gemini']
handler.tags = ['ai']

export default handler