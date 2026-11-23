
const baseUrl = 'http://localhost:3000'
const token = localStorage.getItem('token')
const listaPedidos = document.getElementById('listaPedidos')

// Verifica se o usuário está logado
// Status em que o pagamento já foi confirmado (igual ao do servidor)
const STATUS_PAGOS = ['PAGO', 'EM_PREPARACAO', 'ENVIADO', 'ENTREGUE']


function nomeDoStatus(status) {

    const nomes = {
        AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
        PAGO: 'Pago',
        EM_PREPARACAO: 'Em preparação',
        ENVIADO: 'Enviado',
        ENTREGUE: 'Entregue',
        CANCELADO: 'Cancelado'
    }

    return nomes[status] || status

}


// ======================================================
// BAIXAR E-BOOKS DE UM PEDIDO PAGO
// ======================================================

async function carregarEbooks(pedidoId, botao) {

    const area = document.getElementById(`ebooks-${pedidoId}`)

    botao.disabled = true

    try {

        const resposta = await fetch(`${baseUrl}/pedido/${pedidoId}/ebooks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const dados = await resposta.json()

        if (!resposta.ok) {

            area.innerHTML = `<p>${textoSeguro(dados.message || 'Não foi possível liberar os e-books.')}</p>`

            botao.disabled = false

            return

        }

        area.innerHTML = ''

        dados.forEach(ebook => {

            const paragrafo = document.createElement('p')

            // Só cria o link se o endereço for http ou https
            if (/^https?:\/\//i.test(ebook.arquivo_url || '')) {

                const link = document.createElement('a')

                link.href = ebook.arquivo_url
                link.target = '_blank'
                link.rel = 'noopener noreferrer'
                link.textContent = `Baixar "${ebook.titulo}" (${ebook.escritor})`

                paragrafo.appendChild(link)

            } else {

                paragrafo.textContent =
                    `"${ebook.titulo}": arquivo ainda não cadastrado. Fale com a loja.`

            }

            area.appendChild(paragrafo)

        })

    } catch (erro) {

        console.error('Erro ao buscar e-books:', erro)

        area.innerHTML = '<p>Não foi possível conectar ao servidor.</p>'

        botao.disabled = false

    }

}


if (!token) {
    irParaLogin('Você precisa fazer login para ver seus pedidos!')
} else {
    carregarPedidos()
}

async function carregarPedidos() {
    try {
        const resposta = await fetch(`${baseUrl}/pedidos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const dados = await resposta.json()

        if (!resposta.ok) {
            listaPedidos.innerHTML = `
                <p>${dados.message || 'Não foi possível carregar seus pedidos.'}</p>
            `
            return
        }

        // A rota retorna diretamente a lista de pedidos
        const pedidos = Array.isArray(dados) ? dados : dados.pedidos

        if (!pedidos || pedidos.length === 0) {
            listaPedidos.innerHTML = `
                <p>Você ainda não realizou nenhum pedido.</p>
                <br>
                <a href="produto/produtos.html">Ver produtos</a>
            `
            return
        }

        listaPedidos.innerHTML = ''

        pedidos.forEach(pedido => {
            const data = new Date(pedido.data_pedido)
            const dataFormatada = data.toLocaleDateString('pt-BR')

            // Itens associados ao pedido
            let htmlItens = ''

            if (pedido.itens && pedido.itens.length > 0) {
                htmlItens = pedido.itens.map(item => {
                    const produto = item.produto

                    return `
                        <div class="item-pedido">
                            <p><strong>Livro:</strong> ${produto ? textoSeguro(produto.colecao) : 'Produto não encontrado'}</p>
                            <p><strong>Escritor:</strong> ${produto ? textoSeguro(produto.escritor) : '-'}</p>
                            <p><strong>Formato:</strong> ${produto ? nomeDoFormato(produto.formato) : '-'}</p>
                            <p><strong>Quantidade:</strong> ${item.quantidade}</p>
                            <p><strong>Preço unitário:</strong> R$ ${Number(item.preco_unitario).toFixed(2)}</p>
                            <p><strong>Subtotal:</strong> R$ ${Number(item.subtotal).toFixed(2)}</p>
                        </div>
                    `
                }).join('')
            } else {
                htmlItens = '<p>Nenhum item encontrado neste pedido.</p>'
            }

            // Só pedidos pagos que tenham e-books liberam o download
            const temEbook = (pedido.itens || []).some(
                item => item.produto && item.produto.formato === 'EBOOK'
            )

            const pedidoPago = STATUS_PAGOS.includes(pedido.status)

            let htmlEbooks = ''

            if (temEbook) {

                htmlEbooks = pedidoPago
                    ? `
                        <button
                            type="button"
                            class="btn-ebooks"
                            onclick="carregarEbooks(${pedido.id}, this)"
                        >
                            Baixar meus e-books
                        </button>

                        <div id="ebooks-${pedido.id}" class="area-ebooks"></div>
                    `
                    : `
                        <p class="aviso-ebook">
                            Os e-books deste pedido serão liberados depois da confirmação do pagamento.
                        </p>
                    `

            }

            listaPedidos.innerHTML += `
                <div class="pedido">
                    <h2>Pedido #${pedido.id}</h2>

                    <p><strong>Data:</strong> ${dataFormatada}</p>

                    <p><strong>Valor total:</strong>
                        R$ ${Number(pedido.valor_total).toFixed(2)}
                    </p>

                    <p><strong>Status:</strong> ${nomeDoStatus(pedido.status)}</p>

                    <h3>Itens comprados</h3>
                    ${htmlItens}
                    ${htmlEbooks}
                </div>
                <br>
            `
        })

    } catch (erro) {
        console.error('Erro ao carregar pedidos:', erro)

        listaPedidos.innerHTML = `
            <p>Não foi possível carregar seus pedidos.</p>
        `
    }
}

