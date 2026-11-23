let carrinho = JSON.parse(localStorage.getItem('carrinho')) || []


function salvarCarrinho() {

    localStorage.setItem('carrinho', JSON.stringify(carrinho))

}


function adicionarCarrinho(produto) {

    const produtoExistente = carrinho.find(
        item => item.id === produto.id
    )

    if (produtoExistente) {

        produtoExistente.quantidade++

    } else {

        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            formato: produto.formato,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: 1
        })

    }

    salvarCarrinho()

    alert(`${produto.nome} foi adicionado ao carrinho!`)

}


function removerDoCarrinho(id) {

    carrinho = carrinho.filter(
        item => item.id !== id
    )

    salvarCarrinho()

    exibirCarrinho()

}



function aumentarQuantidade(id) {
    const produto = carrinho.find(item => item.id === id)

    if (!produto) return

    // E-book é vendido uma vez por pedido
    if (produto.formato === 'EBOOK') {
        alert('E-books são vendidos em uma unidade por pedido.')
        return
    }

    // Busca o produto original carregado pela API
    const produtoOriginal = JSON.parse(
        localStorage.getItem('produtos')
    ) || []

    const dadosProduto = produtoOriginal.find(
        item => item.id === id
    )

    const estoqueTotal = dadosProduto?.estoque?.quantidade

    if (estoqueTotal === undefined) {
        alert('Não foi possível verificar o estoque deste produto.')
        return
    }

    if (produto.quantidade >= estoqueTotal) {
        alert('Você já atingiu o limite de estoque disponível!')
        return
    }

    produto.quantidade++

    salvarCarrinho()
    exibirCarrinho()
}



function diminuirQuantidade(id) {

    const produto = carrinho.find(
        item => item.id === id
    )

    if (!produto) return

    if (produto.quantidade > 1) {

        produto.quantidade--

    } else {

        removerDoCarrinho(id)

        return

    }

    salvarCarrinho()

    exibirCarrinho()

}


function calcularSubtotal(produto) {

    return produto.preco * produto.quantidade

}


function calcularTotal() {

    return carrinho.reduce(
        (total, produto) => {
            return total + calcularSubtotal(produto)
        },
        0
    )

}


function exibirCarrinho() {

    const container = document.getElementById('carrinho')

    if (!container) return

    container.innerHTML = ''

    if (carrinho.length === 0) {

        container.innerHTML = `
            <p>Seu carrinho está vazio.</p>
        `

        return

    }

    carrinho.forEach(produto => {

        const subtotal = calcularSubtotal(produto)

        const ehEbook = produto.formato === 'EBOOK'

        container.innerHTML += `
            <div class="item-carrinho">

                ${
                    produto.imagem
                        ? `<img
                               src="${textoSeguro(produto.imagem)}"
                               alt="${textoSeguro(produto.nome)}"
                           >`
                        : '<div class="sem-capa">📚</div>'
                }

                <div>

                    <span class="etiqueta-formato ${ehEbook ? 'formato-ebook' : 'formato-fisico'}">
                        ${nomeDoFormato(produto.formato)}
                    </span>

                    <h3>${textoSeguro(produto.nome)}</h3>

                    <p>
                        R$ ${produto.preco.toFixed(2)}
                    </p>

                    ${
                        ehEbook
                            ? `<p class="aviso-ebook">
                                   Entrega digital (1 unidade)
                               </p>`
                            : `<div class="quantidade">

                                   <button onclick="diminuirQuantidade(${produto.id})">
                                       -
                                   </button>

                                   <span>
                                       ${produto.quantidade}
                                   </span>

                                   <button onclick="aumentarQuantidade(${produto.id})">
                                       +
                                   </button>

                               </div>`
                    }

                    <p>
                        Subtotal:
                        R$ ${subtotal.toFixed(2)}
                    </p>

                    <button onclick="removerDoCarrinho(${produto.id})">
                        Remover
                    </button>

                </div>

            </div>
        `

    })

    const total = calcularTotal()

    container.innerHTML += `

        <div class="total-carrinho">

            <h2>
                Total:
                R$ ${total.toFixed(2)}
            </h2>

            <button onclick="finalizarCompra()">
                Finalizar compra
            </button>

        </div>

    `

}


function finalizarCompra() {

    if (carrinho.length === 0) {

        alert('Seu carrinho está vazio!')

        return

    }

    window.location.href = 'checkout.html'

}


document.addEventListener('DOMContentLoaded', () => {

    exibirCarrinho()

})






