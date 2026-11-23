const listaProdutos = document.getElementById('listaProdutos')

const baseUrl = 'http://localhost:3000'

let produtosEncontrados = []

// Quantos livros aparecem por gênero (o botão "Ver mais" libera outros)
const LIVROS_POR_GENERO = 12

const limitesPorGenero = new Map()


// ======================================================
// CARREGAR PRODUTOS
// ======================================================

async function carregarProdutos() {

    try {

        const resposta =
            await fetch(`${baseUrl}/produtos`)


        if (!resposta.ok) {

            throw new Error(
                'Erro ao buscar produtos'
            )

        }


        produtosEncontrados = await resposta.json()

        localStorage.setItem('produtos', JSON.stringify(produtosEncontrados))

        preencherGeneros()
        mostrarProdutos()


    } catch (erro) {

        console.error(
            'Erro ao carregar produtos:',
            erro
        )


        listaProdutos.innerHTML = `
            <p class="erro">
                Não foi possível carregar os produtos.
            </p>
        `

    }
}


// ======================================================
// MOSTRAR PRODUTOS
// ======================================================


function mostrarProdutos() {

    listaProdutos.innerHTML = ''

    const listaGeneros = document.getElementById('listaGeneros')

    const grupos = new Map()

    // Separa os produtos por gênero
    produtosEncontrados.forEach(produto => {

        const genero = produto.categoria
            ? produto.categoria.nome
            : 'Outros'

        if (!grupos.has(genero)) {
            grupos.set(genero, [])
        }

        grupos.get(genero).push(produto)

    })

    // Cria os atalhos dos gêneros
    listaGeneros.innerHTML = ''

    let numero = 0

    grupos.forEach((produtos, genero) => {

        numero++

        const id = genero
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')

        const atalho = document.createElement('a')

        atalho.href = `#genero-${id}`
        atalho.textContent = genero

        listaGeneros.appendChild(atalho)

    })

    // Mostra uma mensagem se não houver produtos
    if (grupos.size === 0) {

        listaProdutos.innerHTML = `
            <p class="sem-produtos">
                Nenhum produto encontrado. Tente outra busca!
            </p>
        `

        return
    }

    // Cria uma seção para cada gênero
    grupos.forEach((produtos, genero) => {

        const id = genero
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')

        const secao = document.createElement('section')
        secao.classList.add('secao-genero')
        secao.id = `genero-${id}`

        const titulo = document.createElement('div')
        titulo.classList.add('titulo-genero')

        titulo.innerHTML = `
            <div>
                <span>✿ NOSSA SELEÇÃO</span>
                <h2>${textoSeguro(genero)}</h2>
            </div>

            <p>${produtos.length} livro(s)</p>
        `

        const grade = document.createElement('div')
        grade.classList.add('grade-genero')

        const limite = limitesPorGenero.get(genero) || LIVROS_POR_GENERO

        produtos.slice(0, limite).forEach(produto => {

            const card = document.createElement('div')
            card.classList.add('card-produto')

            let imagemHTML

            if (produto.imagem) {

                let caminhoImagem = produto.imagem

                if (
                    caminhoImagem.startsWith('../imagens/') ||
                    caminhoImagem.startsWith('./imagens/')
                ) {

                    caminhoImagem = caminhoImagem.replace(
                        /^(\.\.\/|\.\/)/,
                        ''
                    )

                    caminhoImagem = `${baseUrl}/${caminhoImagem}`

                }

                imagemHTML = `
                    <img
                        src="${caminhoImagem}"
                        alt="Capa de ${textoSeguro(produto.colecao)}"
                        loading="lazy"
                        onerror="mostrarCapaIndisponivel(this)"
                    >
                `

            } else {

                imagemHTML = `
                    <div class="capa-indisponivel">
                        📚
                        <span>Capa indisponível</span>
                    </div>
                `

            }

            card.innerHTML = `
                <div class="imagem-produto">
                    ${imagemHTML}
                </div>

                <div class="info-produto">

                    <span class="etiqueta-formato ${produto.formato === 'EBOOK' ? 'formato-ebook' : 'formato-fisico'}">
                        ${nomeDoFormato(produto.formato)}
                    </span>

                    <h3>${textoSeguro(produto.colecao)}</h3>

                    <p class="escritor">${textoSeguro(produto.escritor)}</p>

                    <p class="ano">Publicação: ${produto.ano || 'Não informado'}</p>

                    <p class="preco">
                        R$ ${Number(produto.preco).toFixed(2)}
                    </p>

                    <span class="ver-detalhes">
                        Ver detalhes →
                    </span>

                </div>
            `

            card.addEventListener('click', () => {
                abrirDetalhes(produto)
            })

            grade.appendChild(card)

        })

        secao.appendChild(titulo)
        secao.appendChild(grade)

        // Botão para mostrar mais livros deste gênero
        if (produtos.length > limite) {

            const botaoMais = document.createElement('button')

            botaoMais.type = 'button'
            botaoMais.classList.add('btn-ver-mais')
            botaoMais.textContent =
                `Ver mais livros de ${genero} (${produtos.length - limite} restantes)`

            botaoMais.addEventListener('click', () => {
                limitesPorGenero.set(genero, limite + LIVROS_POR_GENERO)
                mostrarProdutos()
            })

            secao.appendChild(botaoMais)

        }

        listaProdutos.appendChild(secao)

    })

}


// ======================================================
// QUANDO A CAPA NÃO CARREGA
// ======================================================

function mostrarCapaIndisponivel(imagem) {

    const container =
        imagem.parentElement


    container.innerHTML = `
        <div class="capa-indisponivel">
            📚
            <span>
                Capa indisponível
            </span>
        </div>
    `

}


// ======================================================
// ABRIR DETALHES DO PRODUTO
// ======================================================

function abrirDetalhes(produto) {

    const modal = document.getElementById('modalProduto')
    const detalhes = document.getElementById('detalhesProduto')

    // Verifica a categoria do produto
    const categoria = produto.categoria
        ? produto.categoria.nome
        : 'Categoria não informada'

    // E-books não têm estoque: estão sempre disponíveis
    const ehEbook = produto.formato === 'EBOOK'

    // Verifica o estoque disponível (somente livros físicos)
    const estoque = ehEbook
        ? 1
        : (produto.estoque ? produto.estoque.quantidade : 0)

    // Prepara a imagem do produto
    let imagemHTML

    if (produto.imagem) {

        let caminhoImagem = produto.imagem

        if (
            caminhoImagem.startsWith('../imagens/') ||
            caminhoImagem.startsWith('./imagens/')
        ) {
            caminhoImagem = caminhoImagem.replace(
                /^(\.\.\/|\.\/)/,
                ''
            )

            caminhoImagem = `${baseUrl}/${caminhoImagem}`
        }

        imagemHTML = `
            <img
                src="${caminhoImagem}"
                alt="Capa de ${textoSeguro(produto.colecao)}"
                class="imagem-detalhes"
                onerror="mostrarCapaIndisponivel(this)"
            >
        `

    } else {

        imagemHTML = `
            <div class="capa-indisponivel">
                📚
                <span>Capa indisponível</span>
            </div>
        `
    }

    // Monta as informações completas do livro
    detalhes.innerHTML = `
        <div class="detalhes-conteudo">

            <div class="detalhes-imagem">
                ${imagemHTML}
            </div>

            <div class="detalhes-informacoes">

                <h2>${textoSeguro(produto.colecao)}</h2>

                <p class="escritor">
                    <strong>Escritor:</strong> ${textoSeguro(produto.escritor)}
                </p>

                <p>
                    <strong>Gênero:</strong> ${textoSeguro(categoria)}
                </p>

                <p>
                    <strong>Formato:</strong> ${nomeDoFormato(produto.formato)}
                </p>

                <p>
                    <strong>Primeira publicação:</strong> ${produto.ano}
                </p>

                <p class="preco">
                    R$ ${Number(produto.preco).toFixed(2)}
                </p>

                <p>
                    <strong>Descrição:</strong>
                    ${textoSeguro(produto.descricao) || 'Descrição não disponível.'}
                </p>

                ${
                    ehEbook
                        ? `<p>
                               <strong>Entrega:</strong>
                               digital — o download é liberado depois do pagamento.
                           </p>`
                        : `<p>
                               <strong>Estoque disponível:</strong>
                               ${estoque}
                           </p>`
                }

                <button
                    id="btnAdicionarCarrinho"
                    ${estoque <= 0 ? 'disabled' : ''}
                >
                    ${estoque <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
                </button>

            </div>

        </div>
    `

    // Abre o modal
    modal.style.display = 'flex'

    // Permite adicionar o produto ao carrinho sem fechar o modal
    const botaoCarrinho = document.getElementById(
        'btnAdicionarCarrinho'
    )

    botaoCarrinho.addEventListener('click', (evento) => {
        evento.stopPropagation()
        adicionarAoCarrinho(produto.id)
    })
}


// ======================================================
// FECHAR DETALHES DO PRODUTO
// ======================================================

function fecharModal() {

    const modal = document.getElementById('modalProduto')

    modal.style.display = 'none'
}

// Fecha o modal ao clicar fora do conteúdo
document.getElementById('modalProduto').addEventListener(
    'click',
    function(evento) {

        if (evento.target === this) {
            fecharModal()
        }

    }
)

// Fecha o modal ao pressionar Esc
document.addEventListener('keydown', function(evento) {

    if (evento.key === 'Escape') {
        fecharModal()
    }

})


// ======================================================
// INICIAR
// ======================================================



// Chamada pelo comum.js a cada lote importado
function atualizarAposImportacao() {
    carregarProdutos()
}


carregarProdutos()
