// ======================================================
// VISUAL DA LOJA — Folha Viva
// Só cuida da aparência: ícones, selo do carrinho, aviso ao
// adicionar um livro e pequenas animações.
// Não altera nenhuma regra do sistema: carrinho, login e API
// continuam nos arquivos de sempre.
// Carregue DEPOIS do comum.js (ele precisa existir antes).
// ======================================================

const ICONES = {
    "marca": {
        "vb": "0 0 120 120",
        "d": "<circle cx=\"60\" cy=\"60\" r=\"56\" opacity=\".5\"/><path d=\"M60 90C47 81 31 79 17 83V45C31 41 47 43 60 52C73 43 89 41 103 45V83C89 79 73 81 60 90Z\"/><path d=\"M60 52V90\"/><path d=\"M22 88C36 84 49 86 60 94C71 86 84 84 98 88\" opacity=\".6\"/><path d=\"M60 50C47 39 47 22 60 9C73 22 73 39 60 50Z\"/><path d=\"M60 50V19\"/><path d=\"M60 41L52 34M60 41L68 34M60 32L55 27M60 32L65 27\" opacity=\".75\"/>"
    },
    "carrinho": {
        "vb": "0 0 24 24",
        "d": "<circle cx=\"9\" cy=\"20\" r=\"1.5\"/><circle cx=\"18\" cy=\"20\" r=\"1.5\"/><path d=\"M2 3h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.2a1.6 1.6 0 0 0 1.6-1.2L21 8H6\"/>"
    },
    "carrinho-mais": {
        "vb": "0 0 24 24",
        "d": "<circle cx=\"9\" cy=\"20\" r=\"1.5\"/><circle cx=\"18\" cy=\"20\" r=\"1.5\"/><path d=\"M2 3h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.2a1.6 1.6 0 0 0 1.6-1.2L21 8\"/><path d=\"M14 3v6M11 6h6\"/>"
    },
    "pedidos": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M21 8 12 3 3 8v8l9 5 9-5V8Z\"/><path d=\"m3 8 9 5 9-5M12 13v8\"/>"
    },
    "conta": {
        "vb": "0 0 24 24",
        "d": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5\"/>"
    },
    "sair": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><path d=\"m16 17 5-5-5-5M21 12H9\"/>"
    },
    "busca": {
        "vb": "0 0 24 24",
        "d": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/>"
    },
    "livro": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z\"/><path d=\"M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z\"/>"
    },
    "ebook": {
        "vb": "0 0 24 24",
        "d": "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><path d=\"M9 7h6M9 11h6M11 18h2\"/>"
    },
    "admin": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z\"/><path d=\"m9 12 2 2 4-4\"/>"
    },
    "check": {
        "vb": "0 0 24 24",
        "d": "<path d=\"m5 12.5 4.5 4.5L19 7.5\"/>"
    },
    "fechar": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M6 6l12 12M18 6 6 18\"/>"
    },
    "lixeira": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14M10 11v6M14 11v6\"/>"
    },
    "seta": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>"
    },
    "entrega": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M3 6h11v10H3zM14 9h4l3 3v4h-7\"/><circle cx=\"7\" cy=\"18\" r=\"1.6\"/><circle cx=\"17\" cy=\"18\" r=\"1.6\"/>"
    },
    "download": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M12 3v12M7 10l5 5 5-5M4 20h16\"/>"
    },
    "estante": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M4 21V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v16M8 21V8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v13M12 21h8M15 21 13 6.5a1 1 0 0 1 .8-1.1l1.8-.4a1 1 0 0 1 1.2.8L19.6 20\"/>"
    },
    "github": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21\"/>"
    },
    "mais": {
        "vb": "0 0 24 24",
        "d": "<path d=\"M12 5v14M5 12h14\"/>"
    }
}


// ------------------------------------------------------
// ÍCONES
// Todo elemento com data-icone="nome" recebe o desenho SVG.
// ------------------------------------------------------

function montarIcone(nome) {

    const dados = ICONES[nome]

    if (!dados) {
        return ''
    }

    return `<svg viewBox="${dados.vb}" aria-hidden="true" focusable="false">${dados.d}</svg>`

}


function aplicarIcones(raiz = document) {

    raiz.querySelectorAll('[data-icone]').forEach(elemento => {

        if (elemento.dataset.iconeOk) {
            return
        }

        elemento.innerHTML = montarIcone(elemento.dataset.icone)
        elemento.dataset.iconeOk = '1'

    })

}


// ------------------------------------------------------
// SELO DO CARRINHO (a bolinha com a quantidade de itens)
// Lê o mesmo "carrinho" que o sistema já grava no navegador.
// ------------------------------------------------------

let quantidadeAnterior = null


function quantidadeNoCarrinho() {

    try {

        const lista = JSON.parse(localStorage.getItem('carrinho')) || []

        return lista.reduce(
            (total, item) => total + (Number(item.quantidade) || 1),
            0
        )

    } catch (erro) {

        return 0

    }

}


function atualizarSelo() {

    const quantidade = quantidadeNoCarrinho()

    document.querySelectorAll('[data-selo-carrinho]').forEach(selo => {

        selo.textContent = quantidade > 99 ? '99+' : quantidade
        selo.hidden = quantidade === 0

        // Anima só quando entrou item novo
        if (quantidadeAnterior !== null && quantidade > quantidadeAnterior) {

            selo.classList.remove('pulsa')
            void selo.offsetWidth
            selo.classList.add('pulsa')

            const link = selo.closest('.menu-carrinho')

            if (link) {
                link.classList.remove('balanca')
                void link.offsetWidth
                link.classList.add('balanca')
            }

        }

    })

    quantidadeAnterior = quantidade

}


// Avisa o selo sempre que o carrinho for gravado nesta aba
;(function observarCarrinho() {

    const gravar = Storage.prototype.setItem
    const apagar = Storage.prototype.removeItem

    Storage.prototype.setItem = function (chave) {

        gravar.apply(this, arguments)

        if (this === window.localStorage && chave === 'carrinho') {
            atualizarSelo()
        }

    }

    Storage.prototype.removeItem = function (chave) {

        apagar.apply(this, arguments)

        if (this === window.localStorage && chave === 'carrinho') {
            atualizarSelo()
        }

    }

})()

// Outra aba mudou o carrinho
window.addEventListener('storage', evento => {

    if (evento.key === 'carrinho') {
        atualizarSelo()
    }

})

// Voltou pelo botão "voltar" do navegador
window.addEventListener('pageshow', () => atualizarSelo())


// ------------------------------------------------------
// AVISO FLUTUANTE
// "Fulano foi adicionado ao carrinho!" deixa de ser uma janela
// do navegador e vira um aviso discreto no canto da tela.
// Qualquer outro alert continua funcionando como antes.
// ------------------------------------------------------

function pegarAvisos() {

    let area = document.querySelector('.avisos')

    if (!area) {
        area = document.createElement('div')
        area.className = 'avisos'
        area.setAttribute('role', 'status')
        area.setAttribute('aria-live', 'polite')
        document.body.appendChild(area)
    }

    return area

}


function mostrarAviso({ titulo, texto, link }) {

    const aviso = document.createElement('div')
    aviso.className = 'aviso'

    aviso.innerHTML = `
        <span class="aviso-icone">${montarIcone('check').replace('<svg', '<svg class="aviso-svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')}</span>
        <span class="aviso-texto">
            <strong>${textoSeguroVisual(titulo)}</strong>
            <span>${textoSeguroVisual(texto)}</span>
            ${link ? `<a href="${textoSeguroVisual(link.href)}">${textoSeguroVisual(link.rotulo)}</a>` : ''}
        </span>
    `

    pegarAvisos().appendChild(aviso)

    setTimeout(() => {
        aviso.classList.add('saindo')
        setTimeout(() => aviso.remove(), 400)
    }, 4200)

}


function textoSeguroVisual(texto) {

    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

}


;(function trocarAlertDoCarrinho() {

    const alertOriginal = window.alert.bind(window)

    window.alert = function (mensagem) {

        const texto = String(mensagem ?? '')

        const encontrou = texto.match(/^(.*) foi adicionado ao carrinho!?$/s)

        if (encontrou) {

            const linkCarrinho = document.querySelector('.menu-carrinho')

            mostrarAviso({
                titulo: 'Adicionado ao carrinho',
                texto: encontrou[1],
                link: linkCarrinho
                    ? { href: linkCarrinho.getAttribute('href'), rotulo: 'Ver carrinho' }
                    : null
            })

            return

        }

        alertOriginal(mensagem)

    }

})()


// ------------------------------------------------------
// TOPO, ANIMAÇÕES E EFEITOS
// ------------------------------------------------------

function configurarTopo() {

    const topo = document.querySelector('.topo')

    if (!topo) {
        return
    }

    const ajustar = () => topo.classList.toggle('rolado', window.scrollY > 24)

    ajustar()

    window.addEventListener('scroll', ajustar, { passive: true })

    // "Sair" só aparece para quem está logado
    if (typeof usuarioLogado === 'function') {

        document.querySelectorAll('[data-so-logado]').forEach(elemento => {
            elemento.style.display = usuarioLogado() ? '' : 'none'
        })

    }

}


function configurarRevelar() {

    const itens = document.querySelectorAll('.revelar')

    if (!itens.length) {
        return
    }

    if (!('IntersectionObserver' in window)) {
        itens.forEach(item => item.classList.add('visivel'))
        return
    }

    const observador = new IntersectionObserver(entradas => {

        entradas.forEach(entrada => {

            if (entrada.isIntersecting) {
                entrada.target.classList.add('visivel')
                observador.unobserve(entrada.target)
            }

        })

    }, { threshold: 0.12 })

    itens.forEach(item => observador.observe(item))

}


function configurarBanner() {

    const banner = document.querySelector('.banner')

    if (!banner) {
        return
    }

    // Poeira dourada subindo na luz
    const particulas = banner.querySelector('.banner-particulas')

    if (particulas) {

        for (let i = 0; i < 26; i++) {

            const ponto = document.createElement('span')
            const tamanho = 1.5 + Math.random() * 3

            ponto.style.left = `${35 + Math.random() * 60}%`
            ponto.style.width = ponto.style.height = `${tamanho}px`
            ponto.style.animationDuration = `${9 + Math.random() * 12}s`
            ponto.style.animationDelay = `${-Math.random() * 18}s`
            ponto.style.setProperty('--deriva', `${-40 + Math.random() * 80}px`)
            ponto.style.setProperty('--brilho-p', (0.25 + Math.random() * 0.5).toFixed(2))

            particulas.appendChild(ponto)

        }

    }

    // Fundo acompanha o mouse devagar
    if (window.matchMedia('(pointer: fine)').matches) {

        banner.addEventListener('mousemove', evento => {

            const caixa = banner.getBoundingClientRect()
            const x = (evento.clientX - caixa.left) / caixa.width - 0.5
            const y = (evento.clientY - caixa.top) / caixa.height - 0.5

            banner.style.setProperty('--px', `${(-x * 26).toFixed(1)}px`)
            banner.style.setProperty('--py', `${(-y * 18).toFixed(1)}px`)

        })

    }

}


function configurarLuzNosCards() {

    document.querySelectorAll('.categoria').forEach(card => {

        card.addEventListener('mousemove', evento => {

            const caixa = card.getBoundingClientRect()

            card.style.setProperty('--mx', `${evento.clientX - caixa.left}px`)
            card.style.setProperty('--my', `${evento.clientY - caixa.top}px`)

        })

    })

}


document.addEventListener('DOMContentLoaded', () => {

    aplicarIcones()
    atualizarSelo()
    configurarTopo()
    configurarRevelar()
    configurarBanner()
    configurarLuzNosCards()

})
