const baseUrl = 'http://localhost:3000'
const formulario = document.getElementById('formLoginAdmin')
const mensagem = document.getElementById('mensagem')

formulario.addEventListener('submit', async (event) => {

    event.preventDefault()

    const email = document.getElementById('email').value.trim()
    const senha = document.getElementById('senha').value

    mensagem.textContent = ''

    try {

        const resposta = await fetch(`${baseUrl}/login/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        })

        const dados = await resposta.json()

        if (!resposta.ok) {
            mensagem.textContent = dados.message || 'Não foi possível entrar.'
            return
        }

        localStorage.setItem('token', dados.token)

        window.location.href = 'admin.html'

    } catch (erro) {

        console.error('Erro no login de administrador:', erro)

        mensagem.textContent = 'Não foi possível conectar ao servidor.'

    }

})
