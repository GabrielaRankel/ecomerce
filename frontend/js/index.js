const baseUrl = 'http://localhost:3000'


// ======================================================
// MOSTRAR OS DESTAQUES DA PÁGINA INICIAL
// ======================================================

function montarCard(produto) {

    const imagem = caminhoDaImagem(produto.imagem)

    return `
        <a href="./html/produto/produtos.html" class="produto-card">

            <div class="capa">
                ${
                    imagem
                        ? `<img src="${textoSeguro(imagem)}"
                                alt="Capa de ${textoSeguro(produto.colecao)}"
                                loading="lazy"
                                onerror="this.replaceWith(Object.assign(document.createElement('span'), { textContent: '📚' }))">`
                        : '<span>📚</span>'
                }
            </div>

            <h3>${textoSeguro(produto.colecao)}</h3>

            <p>${textoSeguro(produto.escritor)}</p>

            <span class="produto-link">
                ${nomeDoFormato(produto.formato)} · R$ ${Number(produto.preco).toFixed(2)} →
            </span>

        </a>
    `

}


function preencher(idContainer, lista, mensagemVazia) {

    const container = document.getElementById(idContainer)

    if (lista.length === 0) {
        container.innerHTML = `<p class="carregando">${mensagemVazia}</p>`
        return
    }

    container.innerHTML = lista.slice(0, 3).map(montarCard).join('')

}


async function carregarDestaques() {

    try {

        const resposta = await fetch(`${baseUrl}/produtos`)

        if (!resposta.ok) {
            throw new Error('Erro ao buscar produtos')
        }

        const produtos = await resposta.json()

        preencher(
            'destaquesFisicos',
            produtos.filter(produto => produto.formato === 'FISICO'),
            'Nenhum livro físico cadastrado ainda.'
        )

        preencher(
            'destaquesEbooks',
            produtos.filter(produto => produto.formato === 'EBOOK'),
            'Nenhum e-book cadastrado ainda.'
        )

    } catch (erro) {

        console.error('Erro ao carregar destaques:', erro)

        document.getElementById('destaquesFisicos').innerHTML =
            '<p class="carregando">Não foi possível carregar os livros.</p>'

        document.getElementById('destaquesEbooks').innerHTML =
            '<p class="carregando">Não foi possível carregar os e-books.</p>'

    }

}


// Chamada pelo comum.js a cada lote importado
function atualizarAposImportacao() {
    carregarDestaques()
}


carregarDestaques()
