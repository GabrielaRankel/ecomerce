const baseUrl = 'http://localhost:3000'
const formulario = document.getElementById('formLogin')

formulario.addEventListener('submit', async (event) => {

    event.preventDefault()

    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value

    try {

        const resposta = await fetch(`${baseUrl}/login`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email,
                senha
            })

        })

        const dados = await resposta.json()

        if (!resposta.ok) {

            alert(dados.message)

            return
        }

        localStorage.setItem('token', dados.token)

        alert('Login realizado com sucesso!')

        // Administradores vão para o painel; clientes voltam para a
        // página que tentavam abrir (ou para o catálogo)
        const destino = sessionStorage.getItem('destinoAposLogin')

        sessionStorage.removeItem('destinoAposLogin')

        if (usuarioEhAdmin()) {
            window.location.href = 'admin.html'
        } else if (destino) {
            window.location.href = destino
        } else {
            window.location.href = 'produto/produtos.html'
        }

    } catch (erro) {

        console.error('Erro ao realizar login:', erro)

        alert('Não foi possível realizar o login.')

    }

})
