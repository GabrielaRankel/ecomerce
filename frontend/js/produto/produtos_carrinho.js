// Carrinho do catálogo (usado por produtos.html)
// Usa a lista "produtosEncontrados" carregada em produtos.js


// ======================================================
// CARRINHO
// ======================================================


function adicionarAoCarrinho(id) {

    if (!usuarioLogado()) {
        irParaLogin('Faça login para adicionar livros ao carrinho!')
        return
    }

    const produto = produtosEncontrados.find(
        produto => produto.id === id
    )

    if (!produto) {
        alert('Produto não encontrado!')
        return
    }

    const ehEbook = produto.formato === 'EBOOK'

    let carrinho = JSON.parse(
        localStorage.getItem('carrinho')
    ) || []

    const produtoExistente = carrinho.find(
        item => item.id === produto.id
    )

    // E-book é vendido uma vez por pedido (não há estoque nem quantidade)
    if (ehEbook) {

        if (produtoExistente) {
            alert('Este e-book já está no seu carrinho!')
            return
        }

    } else {

        const estoqueTotal = produto.estoque
            ? produto.estoque.quantidade
            : 0

        if (estoqueTotal <= 0) {
            alert('Este livro está sem estoque!')
            return
        }

    }

    if (!ehEbook) {

        const quantidadeNoCarrinho = produtoExistente
            ? produtoExistente.quantidade
            : 0

        const estoqueDisponivel =
            produto.estoque.quantidade - quantidadeNoCarrinho

        if (estoqueDisponivel <= 0) {
            alert('Você já adicionou todo o estoque disponível ao carrinho!')
            return
        }

    }

    // Prepara o caminho da imagem
    let caminhoImagem = produto.imagem

    if (
        caminhoImagem &&
        (
            caminhoImagem.startsWith('../imagens/') ||
            caminhoImagem.startsWith('./imagens/')
        )
    ) {
        caminhoImagem = caminhoImagem.replace(
            /^(\.\.\/|\.\/)/,
            ''
        )

        caminhoImagem = `${baseUrl}/${caminhoImagem}`
    }

    if (produtoExistente) {

        produtoExistente.quantidade++
        produtoExistente.imagem = caminhoImagem

    } else {

        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            escritor: produto.escritor,
            colecao: produto.colecao,
            formato: produto.formato,
            preco: Number(produto.preco),
            imagem: caminhoImagem,
            quantidade: 1
        })

    }

    localStorage.setItem(
        'carrinho',
        JSON.stringify(carrinho)
    )

    alert(`${produto.nome} foi adicionado ao carrinho!`)
}
