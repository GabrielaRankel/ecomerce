const baseUrl = 'http://localhost:3000'

async function listarProdutos() {
    const lista = document.getElementById('lista_produtos')

    try {
        const resposta = await fetch(`${baseUrl}/produtos`)
        const produtos = await resposta.json()

        if (!resposta.ok) {
            alert(produtos.message)
            return
        }

        if (produtos.length === 0) {
            lista.innerHTML = '<p>Nenhum produto encontrado!</p>'
            return
        }

        lista.innerHTML = ''

        produtos.forEach(produto => {
            const imagem = produto.imagem
                ? (produto.imagem.startsWith('http')
                    ? produto.imagem
                    : `${baseUrl}${produto.imagem.startsWith('/') ? '' : '/'}${produto.imagem}`)
                : ''

            lista.innerHTML += `
                <div class="card">

                    ${imagem ? `<img src="${imagem}" alt="${textoSeguro(produto.colecao)}" width="150">` : ''}

                    <h3>${textoSeguro(produto.nome)}</h3>

                    <p>Escritor: ${textoSeguro(produto.escritor)}</p>
                    <p>Livro: ${textoSeguro(produto.colecao)}</p>
                    <p>Formato: ${nomeDoFormato(produto.formato)}</p>
                    <p>Publicação: ${produto.ano}</p>
                    <p>Preço: R$ ${Number(produto.preco).toFixed(2)}</p>

                    <p>Categoria: ${produto.categoria?.nome || produto.categoria_id}</p>

                    <p>Estoque: ${
                        produto.formato === 'EBOOK'
                            ? 'Não se aplica (digital)'
                            : (produto.estoque
                                ? produto.estoque.quantidade
                                : 'Não cadastrado')
                    }</p>

                    <p>${textoSeguro(produto.descricao)}</p>

                </div>
            `
        })

    } catch (erro) {
        console.error(erro)
        alert('Erro ao listar produtos!')
    }
}

listarProdutos()
