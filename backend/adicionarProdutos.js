const conn = require('./db/conn')

// Carrega os relacionamentos
require('./models/rel')

// Os livros vêm de bibliotecas públicas (Google Books / Open Library).
// Nenhum livro ou escritor é definido neste projeto.
const {
    importarRodada,
    LIMITE_CATALOGO
} = require('./controller/importar.controller')


// ======================================================
// FUNÇÃO PRINCIPAL
// ======================================================

async function adicionarProdutos() {

    try {

        console.log('\n========================================')
        console.log('   IMPORTAÇÃO DE LIVROS (BIBLIOTECA PÚBLICA)')
        console.log('========================================\n')

        await conn.authenticate()

        await conn.sync()

        let pagina = 1
        let acabou = false

        // Cada rodada consulta todos os assuntos ao mesmo tempo
        while (!acabou && pagina <= 20) {

            const inicio = Date.now()

            const resultado = await importarRodada('todos', pagina)

            const segundos = ((Date.now() - inicio) / 1000).toFixed(1)

            console.log(
                `Rodada ${pagina}: ${resultado.importados} novo(s) em ${segundos}s ` +
                `(catálogo: ${resultado.total}/${LIMITE_CATALOGO})`
            )

            acabou = resultado.acabou

            pagina++

        }

        console.log('\n✅ Importação finalizada!\n')

    } catch (err) {

        console.error('\n❌ Erro ao importar livros:')

        console.error(err)

    } finally {

        await conn.close()
    }
}


adicionarProdutos()
