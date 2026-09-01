import { buildCtx } from '../../core/system/context.js'

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const RESPUESTAS = {
    pedo: (n) => pick([
        `*ᐛ🎀* @${n} acaba de soltar algo imperdonable.\n> El grupo entero lo sabe. Yo también. 💨`,
        `*ᐛ🎀* Detecté una anomalía proveniente de @${n}.\n> El aire ya no es el mismo. 💨`,
        `*ᐛ🎀* @${n} pensó que nadie se daría cuenta.\n> Todos se dieron cuenta. 💨`,
    ]),
    robar: (n, sender) => pick([
        `*ᐛ🎀* Makima se llevó el cerebro de @${n}.\n> Si es que tenía uno.`,
        `*ᐛ🎀* @${sender} le robó la dignidad a @${n}.\n> Ya no le quedaba mucha igual.`,
        `*ᐛ🎀* Se reporta que @${n} perdió su cordura.\n> Última vez vista: hace semanas.`,
    ]),
    controlar: (n) => pick([
        `*ᐛ🎀* ⛓️ @${n} ahora está bajo el control de Makima.\n> No puede desobedecer. Ni quiere.`,
        `*ᐛ🎀* ⛓️ Los ojos de @${n} ya no son suyos.\n> El contrato fue firmado. Sin letra chica.`,
        `*ᐛ🎀* ⛓️ @${n} ha sido agregado a la lista de subordinados.\n> Posición: el último.`,
    ]),
    humillar: (n) => pick([
        `*ᐛ🎀* @${n} intentó ser relevante hoy.\n> No funcionó. Como siempre.`,
        `*ᐛ🎀* El CV de @${n} tiene una sola línea:\n> "Existí. No fue suficiente."`,
        `*ᐛ🎀* @${n} se preparó durante horas para este momento.\n> Y aun así, decepcionó.`,
        `*ᐛ🎀* @${n} es el tipo de persona que llega tarde\n> a su propia irrelevancia.`,
    ]),
    npc: (n) => pick([
        `*ᐛ🎀* Análisis completado.\n> @${n} es un NPC de fondo.\n> Sin misión. Sin historia. Sin propósito.`,
        `*ᐛ🎀* @${n} tiene tres diálogos disponibles\n> y los repite en loop desde hace meses.`,
        `*ᐛ🎀* @${n} no tiene arco narrativo.\n> Aparece, no aporta, desaparece. NPC confirmado.`,
    ]),
    juzgar: (n) => pick([
        `*ᐛ🎀* ⚖️ Veredicto sobre @${n}:\n> Culpable. De existir sin propósito claro.\n> Sentencia: seguir así.`,
        `*ᐛ🎀* ⚖️ Tras una revisión exhaustiva de @${n}...\n> El tribunal concluye: sospechoso por naturaleza.`,
        `*ᐛ🎀* ⚖️ @${n} fue juzgado por sus acciones.\n> Y también por las que no tomó. Ambas condenan.`,
    ]),
    culpable: (n) => pick([
        `*ᐛ🎀* @${n} — *CULPABLE.*\n> No necesito pruebas. Yo soy la prueba.`,
        `*ᐛ🎀* El juicio de @${n} duró 3 segundos.\n> Veredicto: culpable. Siempre lo fue.`,
        `*ᐛ🎀* @${n} apeló el veredicto.\n> La apelación fue rechazada. Culpable igual.`,
    ]),
    miedo: (n) => {
        const pct = Math.floor(Math.random() * 101)
        const nivel = pct < 20 ? 'No me temes. Error.' : pct < 50 ? 'Algo de instinto de supervivencia.' : pct < 80 ? 'Sabiduría. Bienvenida.' : 'Terror puro. Correcto.'
        return `*ᐛ🎀* Nivel de miedo de @${n} hacia Makima:\n> *${pct}%* — ${nivel}`
    },
    simp: (n) => {
        const pct = Math.floor(Math.random() * 101)
        const nivel = pct < 20 ? 'Casi nada. Interesante.' : pct < 50 ? 'Moderado. Controlable.' : pct < 80 ? 'Avanzado. Preocupante.' : 'Caso clínico. Sin cura.'
        return `*ᐛ🎀* Detector de simp activado en @${n}:\n> *${pct}%* simp — ${nivel}`
    },
    suerte: (n) => {
        const opciones = [
            `@${n} — suerte: *NULA* 🍀\n> El universo pasó de largo.`,
            `@${n} — suerte: *REGULAR* 🍀\n> Ni bien ni mal. Aburrido.`,
            `@${n} — suerte: *ALTA* 🍀\n> Disfrútala. Dura poco.`,
            `@${n} — suerte: *CRÍTICA* 🍀\n> No desperdicies este momento.`,
            `@${n} — suerte: *NEGATIVA* 🍀\n> Mejor quédate en casa.`,
        ]
        return `*ᐛ🎀* ${pick(opciones)}`
    },
    roast: (n) => pick([
        `*ᐛ🎀* @${n} es la razón por la que los tutoriales de YouTube tienen comentarios desactivados.`,
        `*ᐛ🎀* Si @${n} fuera un comando, sería *#error*.\n> Sin descripción. Sin función. Sin utilidad.`,
        `*ᐛ🎀* @${n} tiene la energía de un PDF que no abre.`,
        `*ᐛ🎀* @${n} llegó tarde a la repartición de carisma\n> y se fue antes de que llegara el sentido común.`,
        `*ᐛ🎀* @${n} es el tipo de persona que pone "gracias" después de leer un mensaje de error.`,
    ]),
    obediencia: (n) => {
        const pct = Math.floor(Math.random() * 101)
        const nivel = pct < 30 ? 'Rebelde. Por ahora.' : pct < 60 ? 'Parcialmente domesticado.' : pct < 90 ? 'Obediente. Bien.' : 'Obediencia total. Perfecto.'
        return `*ᐛ🎀* Nivel de obediencia de @${n}:\n> *${pct}%* — ${nivel}`
    },
    clonar: (n) => pick([
        `*ᐛ🎀* Se detectó un clon de @${n} en el servidor.\n> El original y la copia son igual de confusos.`,
        `*ᐛ🎀* @${n} fue clonado exitosamente.\n> Ninguno de los dos sabe qué hace.`,
        `*ᐛ🎀* Clon de @${n} creado.\n> Ya hay dos. El grupo empeora.`,
    ]),
    secuestrar: (n) => pick([
        `*ᐛ🎀* @${n} fue secuestrado por Makima.\n> Nadie ha pagado el rescate todavía.\n> Nadie lo ha pedido tampoco.`,
        `*ᐛ🎀* @${n} desapareció misteriosamente.\n> Última ubicación: bajo el control del Diablo del Control.`,
        `*ᐛ🎀* Operación completada.\n> @${n} está en custodia. Cómodo. Atrapado. Contento.`,
    ]),
}

const handler = async (m, { conn, who, command }) => {
    if (!who) {
        return m.reply(`*ᐛ🎀* Necesito un objetivo.\n> Uso: *#${command} @usuario*`)
    }

    const ctx     = await buildCtx()
    const num     = who.split('@')[0]
    const sender  = m.sender.split('@')[0]
    const mention = [who, m.sender]

    const fn = RESPUESTAS[command]
    if (!fn) return

    const texto = typeof fn === 'function' ? fn(num, sender) : fn

    await conn.sendMessage(m.chat, {
        text:     texto,
        mentions: mention,
        contextInfo: ctx
    }, { quoted: m })

    await m.react('🔴')
}

handler.command = [
    'pedo', 'robar', 'controlar', 'humillar', 'npc',
    'juzgar', 'culpable', 'miedo', 'simp', 'suerte',
    'roast', 'obediencia', 'clonar', 'secuestrar'
]
handler.tags = ['fun']
export default handler
