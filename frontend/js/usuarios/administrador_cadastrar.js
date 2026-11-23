const baseUrl = 'http://localhost:3000'
const formulario = document.getElementById('formAdmin')
const mensagem = document.getElementById('mensagem')

formulario.addEventListener('submit', async (event) => {

    event.preventDefault()

    const dados = {
        nome: document.getElementById('nome').value.trim(),
        sobreNome: document.getElementById('sobreNome').value.trim(),
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value
    }

    try {

        const resposta = await fetch(`${baseUrl}/admin/usuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dados)
        })

        const retorno = await resposta.json()

        mensagem.textContent = retorno.message || 'Operação concluída.'

        if (resposta.ok) {
            formulario.reset()
        }

    } catch (erro) {

        console.error('Erro ao cadastrar administrador:', erro)

        mensagem.textContent = 'Não foi possível conectar ao servidor.'

    }

})
