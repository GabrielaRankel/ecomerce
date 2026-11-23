const Usuario = require('../models/Usuario')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Tentativas erradas no login de administrador, por IP
const MAX_FALHAS = 5
const BLOQUEIO_MS = 15 * 60 * 1000
const falhasPorIp = new Map()

const login = async (req, res) => {

    const { email, senha } = req.body

    if (!email || !senha) {

        return res.status(400).json({
            message: 'E-mail e senha são obrigatórios!'
        })

    }

    try {

        const usuario = await Usuario.findOne({
            where: {
                email: email
            }
        })

        if (!usuario) {

            return res.status(401).json({
                message: 'E-mail ou senha inválidos!'
            })

        }


        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        )


        if (!senhaValida) {

            return res.status(401).json({
                message: 'E-mail ou senha inválidos!'
            })

        }


        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo: usuario.tipo
            },
            'CHAVE_SECRETA_DO_PROJETO',
            { expiresIn: '3h' }
        );



        res.status(200).json({

            message: 'Login realizado com sucesso!',

            token: token

        })


    } catch (err) {

        console.error('Erro ao realizar login!', err)

        res.status(500).json({
            message: 'Erro ao realizar login!'
        })

    }

}

// ======================================================
// LOGIN DE ADMINISTRADOR
// ======================================================
//
// Só aceita contas do tipo ADMIN. Clientes recebem a mesma
// resposta de "e-mail ou senha inválidos", para não revelar
// quem é administrador. Depois de 5 erros seguidos, o IP fica
// bloqueado por 15 minutos.
//

const loginAdmin = async (req, res) => {

    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(400).json({
            message: 'E-mail e senha são obrigatórios!'
        })
    }

    const registro = falhasPorIp.get(req.ip) || { falhas: 0, ate: 0 }

    if (registro.ate > Date.now()) {
        return res.status(429).json({
            message: 'Muitas tentativas. Tente de novo em alguns minutos!'
        })
    }

    try {

        const usuario = await Usuario.findOne({
            where: {
                email: email
            }
        })

        const senhaValida = usuario
            ? await bcrypt.compare(senha, usuario.senha)
            : false

        if (!usuario || !senhaValida || usuario.tipo !== 'ADMIN') {

            registro.falhas++

            if (registro.falhas >= MAX_FALHAS) {
                registro.falhas = 0
                registro.ate = Date.now() + BLOQUEIO_MS
            }

            falhasPorIp.set(req.ip, registro)

            return res.status(401).json({
                message: 'E-mail ou senha inválidos!'
            })

        }

        falhasPorIp.delete(req.ip)

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo: usuario.tipo
            },
            'CHAVE_SECRETA_DO_PROJETO',
            { expiresIn: '3h' }
        );

        res.status(200).json({
            message: 'Login de administrador realizado com sucesso!',
            token: token
        })

    } catch (err) {

        console.error('Erro ao realizar login de administrador!', err)

        res.status(500).json({
            message: 'Erro ao realizar login!'
        })

    }

}


module.exports = {
    login,
    loginAdmin
}
