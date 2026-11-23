
const Pedido = require('../models/Pedido')
const ItemPedido = require('../models/ItemPedido')
const Produto = require('../models/Produto')
const Estoque = require('../models/Estoque')

// ======================================================
// RELATÓRIO DE VENDAS
// ======================================================

const vendas = async (req, res) => {

    try {

        const pedidos = await Pedido.findAll({

            where: {
                status: 'PAGO'
            },

            include: [
                {
                    model: ItemPedido,
                    as: 'itens',
                    include: [
                        {
                            model: Produto,
                            as: 'produto'
                        }
                    ]
                }
            ],

            order: [['data_pedido', 'ASC']]

        })

        const resultado = pedidos.map(pedido => ({

            id: pedido.id,

            data: pedido.data_pedido,

            valor_total: Number(pedido.valor_total),

            itens: pedido.itens.map(item => ({

                produto: item.produto
                    ? item.produto.colecao
                    : 'Produto não encontrado',

                formato: item.produto
                    ? item.produto.formato
                    : null,

                quantidade: item.quantidade,

                subtotal: Number(item.subtotal)

            }))

        }))

        res.status(200).json(resultado)

    } catch (err) {

        console.error('Erro ao gerar relatório de vendas!', err)

        res.status(500).json({
            message: 'Erro ao gerar relatório de vendas!'
        })

    }

}


// ======================================================
// RELATÓRIO DE ESTOQUE (somente livros físicos)
// ======================================================

const estoque = async (req, res) => {

    try {

        const produtos = await Produto.findAll({

            where: {
                formato: 'FISICO'
            },

            include: [
                {
                    model: Estoque,
                    as: 'estoque'
                }
            ],

            order: [['nome', 'ASC']]

        })

        const resultado = produtos.map(produto => ({

            id: produto.id,

            nome: produto.colecao,

            escritor: produto.escritor,

            formato: produto.formato,

            quantidade: produto.estoque
                ? produto.estoque.quantidade
                : 0

        }))

        res.status(200).json(resultado)

    } catch (err) {

        console.error('Erro ao gerar relatório de estoque!', err)

        res.status(500).json({
            message: 'Erro ao gerar relatório de estoque!'
        })

    }

}


module.exports = {
    vendas,
    estoque
}
