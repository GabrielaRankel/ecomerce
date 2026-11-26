const baseUrl = 'http://localhost:3000'

document.getElementById('form_consultar').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('id').value
    const resultado = document.getElementById('resultado')

    try {
        const resposta = await fetch(`${baseUrl}/produto/${id}`)
        const produto = await resposta.json()

        if (!resposta.ok) {
            resultado.innerHTML = `<p>${produto.message}</p>`
            return
        }

        resultado.innerHTML = `
            <div class="card">
                <h3>${textoSeguro(produto.nome)}</h3>
                <p>ID: ${produto.id}</p>
                <p>Escritor: ${textoSeguro(produto.escritor)}</p>
                <p>Livro: ${textoSeguro(produto.colecao)}</p>
                <p>Formato: ${nomeDoFormato(produto.formato)}</p>
                <p>Publicação: ${produto.ano}</p>
                <p>Preço: R$ ${Number(produto.preco).toFixed(2)}</p>
                <p>Capa: ${produto.imagem || 'Não cadastrada'}</p>
                <p>Descrição: ${textoSeguro(produto.descricao) || 'Sem descrição'}</p>
                <p>Categoria ID: ${produto.categoria_id}</p>
            </div>
        `

    } catch (erro) {
        console.error(erro)
        alert('Erro ao consultar produto!')
    }
})
