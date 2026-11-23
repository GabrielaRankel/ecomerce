// Busca e filtros do catálogo (usado por produtos.html)
// Usa as funções e variáveis de produtos.js


function preencherGeneros() {
    const filtroGenero = document.getElementById('filtroGenero')

    if (!filtroGenero) return

    const generos = [...new Set(
        produtosEncontrados
            .map(produto => produto.categoria?.nome)
            .filter(Boolean)
    )].sort()

    filtroGenero.innerHTML = '<option value="">Todos os gêneros</option>'

    generos.forEach(genero => {
        const opcao = document.createElement('option')
        opcao.value = genero
        opcao.textContent = genero
        filtroGenero.appendChild(opcao)
    })
}



/* BUSCA DE PRODUTOS */

function buscarProdutos() {
    limitesPorGenero.clear()

    const termo = document
        .getElementById('campoBusca')
        .value.trim()
        .toLowerCase()

    const formato = document
        .getElementById('filtroFormato')
        .value.toLowerCase()

    const genero = document
        .getElementById('filtroGenero')
        .value.toLowerCase()

    const resultado = produtosEncontrados.filter(produto => {
        const colecao = (produto.colecao || '').toLowerCase()
        const escritor = (produto.escritor || '').toLowerCase()
        const formatoProduto = (produto.formato || '').toLowerCase()
        const generoProduto =
            (produto.categoria?.nome || '').toLowerCase()

        const correspondeBusca =
            colecao.includes(termo) || escritor.includes(termo)

        const correspondeFormato =
            !formato || formatoProduto === formato

        const correspondeGenero =
            !genero || generoProduto === genero

        return correspondeBusca &&
            correspondeFormato &&
            correspondeGenero
    })

    mostrarListaFiltrada(resultado)
}


function mostrarListaFiltrada(lista) {
    // Guarda a lista original para não perder os produtos
    const listaOriginal = produtosEncontrados

    produtosEncontrados = lista
    mostrarProdutos()
    produtosEncontrados = listaOriginal
}

document.getElementById('btnBuscar').addEventListener('click', buscarProdutos)
document.getElementById('campoBusca').addEventListener('input', buscarProdutos)
document.getElementById('filtroFormato').addEventListener('change', buscarProdutos)
document.getElementById('filtroGenero').addEventListener('change', buscarProdutos)

document.getElementById('btnLimparBusca').addEventListener('click', () => {
    document.getElementById('campoBusca').value = ''
    document.getElementById('filtroFormato').value = ''
    document.getElementById('filtroGenero').value = ''

    limitesPorGenero.clear()

    mostrarProdutos()
})
