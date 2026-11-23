const Entrega = require('../models/Entrega')
const Pedido = require('../models/Pedido')
const ItemPedido = require('../models/ItemPedido')
const Produto = require('../models/Produto')

const cadastrar = async (req, res) => {

    const valores = req.body

    if (!valores.pedido_id || !valores.endereco) {
        return res.status(400).json({
            message: 'Pedido e endereço são obrigatórios!'
        })
    }

    try {

        const pedido = await Pedido.findByPk(valores.pedido_id)

        if (!pedido) {
            return res.status(404).json({
                message: 'Pedido não encontrado!'
            })
        }

        // Só existe entrega para pedidos com pelo menos 1 livro físico.
        // Os e-books são liberados por download.
        const itemFisico = await ItemPedido.findOne({
            where: {
                pedido_id: valores.pedido_id
            },
            include: [
                {
                    model: Produto,
                    as: 'produto',
                    where: {
                        formato: 'FISICO'
                    },
                    attributes: ['id']
                }
            ]
        })

        if (!itemFisico) {
            return res.status(400).json({
                message: 'Este pedido não possui livros físicos para entregar!'
            })
        }

        const entregaExistente = await Entrega.findOne({
            where: {
                pedido_id: valores.pedido_id
            }
        })

        if (entregaExistente) {
            return res.status(409).json({
                message: 'Este pedido já possui uma entrega!'
            })
        }

        const entrega = await Entrega.create(valores)

        res.status(201).json({
            message: 'Entrega cadastrada com sucesso!',
            entrega
        })

    } catch (err) {

        console.error('Erro ao cadastrar entrega!', err)

        res.status(500).json({
            message: 'Erro ao cadastrar entrega!'
        })
    }
}


const listar = async (req, res) => {

    try {

        const entregas = await Entrega.findAll()

        res.status(200).json(entregas)

    } catch (err) {

        console.error('Erro ao listar entregas!', err)

        res.status(500).json({
            message: 'Erro ao listar entregas!'
        })
    }
}


const consultarPorCod = async (req, res) => {

    const id = req.params.id

    try {

        const entrega = await Entrega.findByPk(id)

        if (!entrega) {
            return res.status(404).json({
                message: 'Entrega não encontrada!'
            })
        }

        res.status(200).json(entrega)

    } catch (err) {

        console.error('Erro ao consultar entrega!', err)

        res.status(500).json({
            message: 'Erro ao consultar entrega!'
        })
    }
}


const atualizar = async (req, res) => {

    const id = req.params.id
    const valores = { ...req.body }

    try {

        const entrega = await Entrega.findByPk(id)

        if (!entrega) {
            return res.status(404).json({
                message: 'Entrega não encontrada!'
            })
        }

        if (['ENVIADO', 'EM_TRANSITO', 'ENTREGUE'].includes(valores.status)) {

            if (!entrega.data_envio && !valores.data_envio) {
                valores.data_envio = new Date()
            }

        }

        if (valores.status === 'ENTREGUE' && !entrega.data_entrega && !valores.data_entrega) {
            valores.data_entrega = new Date()
        }

        await entrega.update(valores)

        res.status(200).json(entrega)

    } catch (err) {

        console.error('Erro ao atualizar entrega!', err)

        res.status(500).json({
            message: 'Erro ao atualizar entrega!'
        })
    }
}



const atualizarParcial = async (req, res) => {

    const id = req.params.id
    const valores = { ...req.body }

    try {

        const entrega = await Entrega.findByPk(id)

        if (!entrega) {
            return res.status(404).json({
                message: 'Entrega não encontrada!'
            })
        }

        if (['ENVIADO', 'EM_TRANSITO', 'ENTREGUE'].includes(valores.status)) {

            if (!entrega.data_envio && !valores.data_envio) {
                valores.data_envio = new Date()
            }

        }

        if (valores.status === 'ENTREGUE' && !entrega.data_entrega && !valores.data_entrega) {
            valores.data_entrega = new Date()
        }

        await entrega.update(valores)

        res.status(200).json(entrega)

    } catch (err) {

        console.error('Erro ao atualizar entrega!', err)

        res.status(500).json({
            message: 'Erro ao atualizar entrega!'
        })
    }
}



const excluir = async (req, res) => {
    const id = req.params.id

    try {
        const entrega = await Entrega.findByPk(id)

        if (!entrega) {
            return res.status(404).json({
                message: 'Entrega não encontrada!'
            })
        }

        await entrega.destroy()

        return res.status(200).json({
            message: 'Entrega excluída com sucesso!'
        })
    } catch (err) {
        console.error('Erro ao excluir entrega!', err)

        return res.status(500).json({
            message: 'Erro ao excluir entrega!'
        })
    }
}


module.exports = {
    cadastrar,
    listar,
    consultarPorCod,
    atualizar,
    atualizarParcial,
    excluir
}
