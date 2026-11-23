const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

const verificarToken = (req, res, next) => {

    const authHeader = req.headers.authorization

    if (!authHeader) {

        return res.status(401).json({
            message: 'Token não informado!'
        })

    }


    const partes = authHeader.split(' ')

    const token = partes[1]


    if (!token) {

        return res.status(401).json({
            message: 'Token inválido!'
        })

    }


    try {

        const usuario = jwt.verify(
            token,
            'CHAVE_SECRETA_DO_PROJETO'
        )

        req.usuario = usuario

        next()

    } catch (err) {

        return res.status(401).json({
            message: 'Token inválido ou expirado!'
        })

    }

}



// O tipo é consultado no banco (e não no token) para que uma mudança
// de permissão valha imediatamente, sem esperar o token expirar.
const ehAdministrador = async (id) => {

    const usuario = await Usuario.findByPk(id, {
        attributes: ['id', 'tipo']
    })

    return Boolean(usuario) && usuario.tipo === 'ADMIN'

}


const verificarAdmin = async (req, res, next) => {

    try {

        if (!(await ehAdministrador(req.usuario.id))) {

            return res.status(403).json({
                message: 'Acesso restrito a administradores!'
            })

        }

        next()

    } catch (err) {

        console.error('Erro ao verificar permissão!', err)

        return res.status(500).json({
            message: 'Erro ao verificar permissão!'
        })

    }

}


// Rotas /usuario/:id: o próprio usuário ou um administrador
const verificarProprioOuAdmin = async (req, res, next) => {

    try {

        req.ehAdmin = await ehAdministrador(req.usuario.id)

        if (!req.ehAdmin && String(req.usuario.id) !== String(req.params.id)) {

            return res.status(403).json({
                message: 'Você não tem permissão para acessar este usuário!'
            })

        }

        next()

    } catch (err) {

        console.error('Erro ao verificar permissão!', err)

        return res.status(500).json({
            message: 'Erro ao verificar permissão!'
        })

    }

}


module.exports = verificarToken
module.exports.verificarAdmin = verificarAdmin
module.exports.verificarProprioOuAdmin = verificarProprioOuAdmin
