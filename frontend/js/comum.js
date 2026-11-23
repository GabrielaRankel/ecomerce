// ======================================================
// FUNÇÕES COMUNS A TODAS AS PÁGINAS
// (menu, sessão do usuário e caminho das imagens)
// ======================================================

// Guarda o endereço deste arquivo para achar o index.html de qualquer pasta
const enderecoComum = document.currentScript
    ? document.currentScript.src
    : ''

const BASE_API = 'http://localhost:3000'


// Lê os dados que estão dentro do token (somente para ajustar a tela;
// quem realmente bloqueia o acesso é o servidor)
function lerDadosDoToken() {

    const token = localStorage.getItem('token')

    if (!token) {
        return null
    }

    try {

        const parte = token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        return JSON.parse(atob(parte))

    } catch (erro) {

        return null

    }

}


// Usuário logado = tem token e ele ainda não expirou
function usuarioLogado() {

    const dados = lerDadosDoToken()

    if (!dados) {
        return false
    }

    if (dados.exp && dados.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        return false
    }

    return true

}


// Manda para o login e lembra a página para voltar depois
function irParaLogin(aviso) {

    sessionStorage.setItem('destinoAposLogin', window.location.href)

    if (aviso) {
        alert(aviso)
    }

    window.location.href = enderecoComum
        ? new URL('../html/login.html', enderecoComum).href
        : '/'

}


function usuarioEhAdmin() {

    const dados = lerDadosDoToken()

    return Boolean(dados && dados.tipo === 'ADMIN')

}


// Imagens salvas como "../imagens/x.jpg" ficam no servidor
function caminhoDaImagem(imagem) {

    if (!imagem) {
        return ''
    }

    if (
        imagem.startsWith('../imagens/') ||
        imagem.startsWith('./imagens/')
    ) {
        return `${BASE_API}/${imagem.replace(/^(\.\.\/|\.\/)/, '')}`
    }

    if (imagem.startsWith('/imagens/')) {
        return `${BASE_API}${imagem}`
    }

    return imagem

}


// Evita que um texto vindo do servidor quebre o HTML da página
function textoSeguro(texto) {

    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

}


function nomeDoFormato(formato) {

    if (formato === 'EBOOK') {
        return 'E-book'
    }

    if (formato === 'FISICO') {
        return 'Livro físico'
    }

    return formato || 'Formato não informado'

}


// ======================================================
// IMPORTAR PRODUTOS DA BIBLIOTECA PÚBLICA (Google Books, com Open Library de reserva)
// O servidor busca os livros em lotes; aqui a página pede
// lote após lote e atualiza a tela conforme eles chegam.
// ======================================================

const ASSUNTOS_IMPORTACAO = [
    ['romance', 'Romance'],
    ['poesia', 'Poesia'],
    ['aventura', 'Aventura'],
    ['fantasia', 'Fantasia'],
    ['historia', 'História'],
    ['ficcao', 'Ficção científica'],
    ['classicos', 'Clássicos']
]

let importacaoEmAndamento = false
let pedidoParaParar = false


function configurarImportacao() {

    const botao = document.getElementById('btnImportar')

    if (!botao) {
        return
    }

    const select = document.getElementById('assuntoImportar')
    const mensagem = document.getElementById('mensagemImportacao')

    if (select) {

        select.innerHTML = '<option value="todos">Todos os assuntos</option>'

        ASSUNTOS_IMPORTACAO.forEach(([valor, nome]) => {
            select.innerHTML += `<option value="${valor}">${nome}</option>`
        })

    }

    botao.addEventListener('click', async () => {

        // Segundo clique = parar
        if (importacaoEmAndamento) {
            pedidoParaParar = true
            botao.textContent = 'Parando...'
            return
        }

        const assunto = select ? select.value : 'todos'

        const chave = `importacao_${assunto}`

        // Continua de onde parou na última vez
        let pagina = Number(localStorage.getItem(chave)) || 1

        importacaoEmAndamento = true
        pedidoParaParar = false
        botao.textContent = 'Parar importação'

        let total = 0
        let mensagemFinal = ''

        try {

            // Cada rodada traz livros de vários assuntos de uma vez
            while (!pedidoParaParar) {

                mensagem.textContent =
                    `Importando... ${total} produto(s) novo(s) até agora.`

                const resposta = await fetch(`${BASE_API}/importar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assunto, pagina })
                })

                const dados = await resposta.json()

                if (!resposta.ok) {
                    mensagemFinal = dados.message || 'Erro ao importar.'
                    break
                }

                total += dados.importados
                pagina = dados.proxima_pagina

                if (dados.importados > 0 &&
                    typeof atualizarAposImportacao === 'function') {
                    atualizarAposImportacao()
                }

                // Catálogo cheio ou bibliotecas sem mais livros
                if (dados.acabou) {
                    localStorage.removeItem(chave)
                    mensagemFinal =
                        `Importação concluída! O catálogo tem ${dados.total_catalogo} produto(s).`
                    break
                }

                localStorage.setItem(chave, pagina)

            }

            if (!mensagemFinal) {
                mensagemFinal = `Importação parada: ${total} produto(s) novo(s).`
            }

            mensagem.textContent = mensagemFinal

        } catch (erro) {

            console.error('Erro na importação:', erro)

            mensagem.textContent = 'Não foi possível conectar ao servidor.'

        }

        importacaoEmAndamento = false
        botao.textContent = 'Importar produtos'

        if (typeof atualizarAposImportacao === 'function') {
            atualizarAposImportacao()
        }

    })

}


document.addEventListener('DOMContentLoaded', () => {

    configurarImportacao()


    // Mostra o link da área administrativa só para administradores
    document.querySelectorAll('.admin-link').forEach(link => {

        if (!usuarioEhAdmin()) {
            link.style.display = 'none'
        }

    })

    // Botão "Sair" apaga o login salvo
    document.querySelectorAll('.menu a').forEach(link => {

        if (link.textContent.trim() === 'Sair') {

            link.addEventListener('click', () => {
                localStorage.removeItem('token')
            })

        }

    })

    // Páginas que exigem login (carrinho, checkout, pedidos, perfil)
    if (
        document.body.hasAttribute('data-requer-login') &&
        !usuarioLogado()
    ) {

        irParaLogin('Faça login para acessar esta página!')

        return

    }

    // Páginas exclusivas de administrador
    if (
        document.body.hasAttribute('data-somente-admin') &&
        !usuarioEhAdmin()
    ) {

        // Sem login → tela de login do administrador.
        // Logado como cliente → volta para o início.
        if (!localStorage.getItem('token')) {

            window.location.href = enderecoComum
                ? new URL('../html/admin_login.html', enderecoComum).href
                : '/'

            return
        }

        alert('Esta página é exclusiva para administradores!')

        window.location.href = enderecoComum
            ? new URL('../index.html', enderecoComum).href
            : '/'

    }

})
