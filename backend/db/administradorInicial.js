const Usuario = require('../models/Usuario')
const bcrypt = require('bcrypt')


// ======================================================
// CRIAR UM ADMINISTRADOR
// ======================================================
//
// Administradores não precisam de CPF, endereço etc.
// Os campos obrigatórios do banco recebem valores neutros.
//

async function criarAdministrador({ nome, sobreNome, email, senha }) {

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    return Usuario.create({
        nome,
        sobreNome,
        idade: 18,
        email,
        senha: senhaCriptografada,
        telefone: '0',
        // Não é um CPF real: apenas ocupa o campo único do banco
        cpf: `ADM${Date.now()}${Math.floor(Math.random() * 1000)}`,
        cep: '00000000',
        rua: '-',
        numero: '0',
        bairro: '-',
        cidade: '-',
        estado: 'XX',
        tipo: 'ADMIN'
    })
}


// ======================================================
// ADMINISTRADOR INICIAL (criado quando o servidor liga)
// ======================================================
//
// Quem instala o sistema define ADMIN_EMAIL e ADMIN_SENHA no .env.
// Se ainda não existir nenhum administrador, ele é criado.
// A senha nunca fica escrita no código.
//

async function criarAdministradorInicial() {

    const email = process.env.ADMIN_EMAIL
    const senha = process.env.ADMIN_SENHA

    const jaExiste = await Usuario.findOne({
        where: { tipo: 'ADMIN' }
    })

    if (jaExiste) {
        return
    }

    if (!email || !senha) {

        console.log(
            'Nenhum administrador cadastrado. Defina ADMIN_EMAIL e ' +
            'ADMIN_SENHA no .env e reinicie o servidor.'
        )

        return
    }

    if (senha.length < 8) {

        console.log('ADMIN_SENHA precisa ter pelo menos 8 caracteres.')

        return
    }

    const usuarioComEmail = await Usuario.findOne({ where: { email } })

    if (usuarioComEmail) {

        await usuarioComEmail.update({ tipo: 'ADMIN' })

        console.log(`Usuário ${email} promovido a administrador.`)

        return
    }

    await criarAdministrador({
        nome: process.env.ADMIN_NOME || 'Administrador',
        sobreNome: 'da Loja',
        email,
        senha
    })

    console.log(`Administrador inicial criado: ${email}`)
}


module.exports = {
    criarAdministrador,
    criarAdministradorInicial
}
