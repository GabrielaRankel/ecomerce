const baseUrl = 'http://localhost:3000'
const token = localStorage.getItem('token')


// ======================================================
// VERIFICAR LOGIN
// ======================================================

if (!token) {

    window.location.href = 'admin_login.html'

}

const quantidadeProdutos = document.getElementById('quantidadeProdutos')
const quantidadePedidos = document.getElementById('quantidadePedidos')
const valorVendas = document.getElementById('valorVendas')


// ======================================================
// QUANTIDADE DE LIVROS CADASTRADOS
// ======================================================

async function carregarProdutos() {

    try {

        const resposta = await fetch(`${baseUrl}/produtos`)

        const dados = await resposta.json()

        if (!resposta.ok) {
            return
        }

        const produtos = dados.produtos || dados

        quantidadeProdutos.textContent = produtos.length

    } catch (erro) {

        console.error('Erro ao carregar produtos:', erro)

    }

}


// ======================================================
// RESUMO DAS VENDAS (rota exclusiva para administradores)
// ======================================================

async function carregarVendas() {

    try {

        const resposta = await fetch(`${baseUrl}/relatorios/vendas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const dados = await resposta.json()

        if (!resposta.ok) {

            // 403 = quem entrou não é administrador
            alert(dados.message || 'Não foi possível carregar o resumo de vendas.')

            return

        }

        let totalVendas = 0

        dados.forEach(pedido => {
            totalVendas += Number(pedido.valor_total)
        })

        quantidadePedidos.textContent = dados.length

        valorVendas.textContent = `R$ ${totalVendas.toFixed(2)}`

    } catch (erro) {

        console.error('Erro ao carregar vendas:', erro)

    }

}


if (token) {

    carregarProdutos()
    carregarVendas()

}
