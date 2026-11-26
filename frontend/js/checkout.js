const resumoCheckout = document.getElementById('resumoCheckout')
const formulario = document.getElementById('formCheckout')

const carrinho = JSON.parse(localStorage.getItem('carrinho')) || []

const baseUrl = 'http://localhost:3000'


// ======================================================
// VERIFICAR CARRINHO
// ======================================================

if (carrinho.length === 0) {

    resumoCheckout.innerHTML = `
        <p>Seu carrinho está vazio.</p>
        <br>
        <a href="produto/produtos.html">
            Voltar para produtos
        </a>
    `

    formulario.style.display = 'none'

}


// ======================================================
// VERIFICAR O TIPO DE LIVROS DO CARRINHO
// ======================================================

const temLivroFisico = carrinho.some(
    produto => produto.formato !== 'EBOOK'
)

const temEbook = carrinho.some(
    produto => produto.formato === 'EBOOK'
)


// Carrinho só com e-books não precisa de endereço
if (carrinho.length > 0 && !temLivroFisico) {

    document.getElementById('areaEndereco').style.display = 'none'

    document.querySelectorAll('#areaEndereco input').forEach(campo => {
        campo.required = false
    })

}

if (carrinho.length > 0 && temEbook) {

    const avisoEbook = document.getElementById('avisoEbook')

    avisoEbook.textContent = temLivroFisico
        ? 'Os e-books ficam disponíveis para download na página "Pedidos" depois do pagamento. O endereço vale apenas para os livros físicos.'
        : 'Seu pedido tem apenas e-books: não é preciso informar endereço. O download fica disponível na página "Pedidos".'

    avisoEbook.style.display = 'block'

}


// ======================================================
// MOSTRAR RESUMO DO PEDIDO
// ======================================================

function mostrarResumo() {

    if (carrinho.length === 0) return

    let total = 0

    let html = `<h2>Resumo do pedido</h2>`

    carrinho.forEach(produto => {

        const subtotal =
            Number(produto.preco) * produto.quantidade

        total += subtotal

        html += `
            <p>
                ${textoSeguro(produto.colecao || produto.nome)}
                (${nomeDoFormato(produto.formato)})
                — ${produto.quantidade}x
                — R$ ${subtotal.toFixed(2)}
            </p>
        `

    })

    html += `
        <br>
        <h2>Total: R$ ${total.toFixed(2)}</h2>
        <br>
    `

    resumoCheckout.innerHTML = html

}

mostrarResumo()


// ======================================================
// LER RESPOSTA DA API
// ======================================================

async function lerResposta(resposta) {

    try {
        return await resposta.json()
    } catch {
        return {}
    }

}


// ======================================================
// FINALIZAR COMPRA
// ======================================================

formulario.addEventListener('submit', async (event) => {

    event.preventDefault()

    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!')
        return
    }

    const token = localStorage.getItem('token')

    if (!token) {

        irParaLogin('Você precisa fazer login para finalizar a compra!')

        return

    }


    // Pegar os campos do HTML (o endereço só é usado para livros físicos)
    let endereco = ''

    if (temLivroFisico) {

        const cep = document.getElementById('cep').value.trim()
        const rua = document.getElementById('rua').value.trim()
        const numero = document.getElementById('numero').value.trim()
        const bairro = document.getElementById('bairro').value.trim()
        const cidade = document.getElementById('cidade').value.trim()
        const estado = document.getElementById('estado').value.trim()

        // Juntar os campos em um endereço completo
        endereco = `${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`

    }


    // Calcular o valor total

    let total = 0

    carrinho.forEach(produto => {

        total += Number(produto.preco) * produto.quantidade

    })


    try {

        // ==============================================
        // CADASTRAR PEDIDO
        // ==============================================

        const respostaPedido = await fetch(`${baseUrl}/pedido`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

            body: JSON.stringify({
                valor_total: total
            })

        })

        const dadosPedido = await lerResposta(respostaPedido)

        if (!respostaPedido.ok) {

            alert(dadosPedido.message || 'Erro ao cadastrar pedido.')

            return

        }

        const pedidoId = dadosPedido.pedido.id


        // ==============================================
        // CADASTRAR ITENS DO PEDIDO
        // ==============================================

        for (const produto of carrinho) {

            const respostaItem = await fetch(`${baseUrl}/itemPedido`, {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({

                    pedido_id: pedidoId,

                    produto_id: produto.id,

                    quantidade: produto.quantidade

                })

            })

            const dadosItem = await lerResposta(respostaItem)

            if (!respostaItem.ok) {

                alert(dadosItem.message || 'Erro ao cadastrar item do pedido.')

                return

            }

        }


        // ==============================================
        // CADASTRAR ENTREGA (somente se houver livro físico)
        // ==============================================

        if (temLivroFisico) {

            const respostaEntrega = await fetch(`${baseUrl}/entrega`, {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({

                    pedido_id: pedidoId,

                    endereco: endereco

                })

            })

            const dadosEntrega = await lerResposta(respostaEntrega)

            if (!respostaEntrega.ok) {

                alert(dadosEntrega.message || 'Erro ao cadastrar entrega.')

                return

            }

        }


        // ==============================================
        // FINALIZAR PEDIDO
        // ==============================================

        const respostaFinalizar = await fetch(
            `${baseUrl}/pedido/${pedidoId}/finalizar`,
            {

                method: 'POST',

                headers: {
                    'Authorization': `Bearer ${token}`
                }

            }
        )

        const dadosFinalizar = await lerResposta(respostaFinalizar)

        if (!respostaFinalizar.ok) {

            alert(dadosFinalizar.message || 'Erro ao finalizar pedido.')

            return

        }


        // ==============================================
        // LIMPAR CARRINHO
        // ==============================================

        localStorage.removeItem('carrinho')

        alert('Compra realizada com sucesso! 📚')

        window.location.href = 'historico.html'


    } catch (erro) {

        console.error('Erro ao finalizar compra:', erro)

        alert('Não foi possível finalizar a compra. Verifique sua conexão com o servidor.')

    }

})
