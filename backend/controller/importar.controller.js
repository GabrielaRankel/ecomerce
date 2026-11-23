const Produto = require('../models/Produto')
const { Estoque, Categoria } = require('../models/rel')

// ======================================================
// CONFIGURAÇÕES DA IMPORTAÇÃO
// ======================================================

// Assuntos permitidos (o visitante só escolhe um destes)
const ASSUNTOS = {
    romance: { busca: 'romance', categoria: 'Romance' },
    poesia: { busca: 'poetry', categoria: 'Poesia' },
    aventura: { busca: 'adventure', categoria: 'Aventura' },
    fantasia: { busca: 'fantasy', categoria: 'Fantasia' },
    historia: { busca: 'history', categoria: 'História' },
    ficcao: { busca: 'science fiction', categoria: 'Ficção científica' },
    classicos: { busca: 'classic literature', categoria: 'Clássicos' }
}

// A biblioteca pública não tem preço nem estoque:
// estes valores são definidos pela loja (o visitante não escolhe)
const PRECO_FISICO = 49.90
const PRECO_EBOOK = 9.90
const ESTOQUE_INICIAL = 5

// Quantos livros cada consulta traz (40 é o máximo do Google Books)
const LIVROS_POR_CONSULTA = 40

// Limite de produtos no catálogo (livros físicos + e-books).
// A rota é pública, então este teto protege o banco.
const LIMITE_CATALOGO = 400

// Travas contra abuso
const LIMITE_POR_IP = 60
const JANELA_MS = 60 * 60 * 1000

const acessosPorIp = new Map()

let importando = false


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

// Confere quantas importações o IP já fez na última hora
function ipAtingiuLimite(ip) {

    const agora = Date.now()

    const recentes = (acessosPorIp.get(ip) || []).filter(
        momento => agora - momento < JANELA_MS
    )

    if (recentes.length >= LIMITE_POR_IP) {
        acessosPorIp.set(ip, recentes)
        return true
    }

    recentes.push(agora)
    acessosPorIp.set(ip, recentes)

    return false
}


// Os textos vêm de sites externos: remove qualquer marcação HTML
function limitarTexto(texto, tamanho) {
    return String(texto).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, tamanho)
}


// Só aceita endereços http ou https (nunca "javascript:" e semelhantes)
function enderecoSeguro(endereco) {
    return /^https?:\/\//i.test(endereco || '') ? endereco : null
}


// Todas as fontes devolvem os livros neste mesmo formato:
// { titulo, escritor, ano, imagem, descricao, livre, link }
// "livre" = o e-book pode ser lido de graça (domínio público)


// FONTE 1: Google Books
async function buscarNoGoogleBooks(assunto, pagina) {

    const url =
        'https://www.googleapis.com/books/v1/volumes' +
        `?q=${encodeURIComponent('subject:' + assunto.busca)}` +
        '&langRestrict=pt' +
        '&printType=books' +
        `&maxResults=${LIVROS_POR_CONSULTA}` +
        `&startIndex=${(pagina - 1) * LIVROS_POR_CONSULTA}`

    const resposta = await fetch(url, {
        signal: AbortSignal.timeout(8000)
    })

    if (!resposta.ok) {
        throw new Error(`Google Books respondeu ${resposta.status}`)
    }

    const dados = await resposta.json()

    return (dados.items || []).map(item => {

        const info = item.volumeInfo || {}

        const miniatura = info.imageLinks && info.imageLinks.thumbnail

        return {
            titulo: info.title,
            escritor: info.authors && info.authors[0],
            ano: parseInt(String(info.publishedDate || '').slice(0, 4), 10),
            imagem: miniatura
                ? miniatura.replace('http://', 'https://')
                : null,
            descricao: info.description
                ? limitarTexto(info.description, 1000)
                : null,
            livre: Boolean(item.accessInfo && item.accessInfo.publicDomain),
            link: info.infoLink
        }

    })
}


// FONTE 2 (reserva): Open Library
async function buscarNoOpenLibrary(assunto, pagina) {

    const busca = `subject:"${assunto.busca}" language:por`

    const url =
        'https://openlibrary.org/search.json' +
        `?q=${encodeURIComponent(busca)}` +
        `&limit=${LIVROS_POR_CONSULTA}` +
        `&page=${pagina}` +
        '&fields=key,title,author_name,first_publish_year,cover_i,' +
        'has_fulltext,public_scan_b,ebook_access'

    const resposta = await fetch(url, {
        headers: {
            'User-Agent': 'LivrariaFolhaViva/1.0 (school project)'
        },
        signal: AbortSignal.timeout(8000)
    })

    if (!resposta.ok) {
        throw new Error(`Open Library respondeu ${resposta.status}`)
    }

    const dados = await resposta.json()

    return (dados.docs || []).map(livro => ({
        titulo: livro.title,
        escritor: livro.author_name && livro.author_name[0],
        ano: parseInt(livro.first_publish_year, 10),
        imagem: livro.cover_i
            ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-L.jpg`
            : null,
        descricao: null,
        livre: livro.ebook_access === 'public' || livro.public_scan_b === true,
        link: livro.key ? `https://openlibrary.org${livro.key}` : null
    }))
}


// Tenta o Google Books; se falhar, usa o Open Library
async function buscarNaBiblioteca(assunto, pagina) {

    try {

        return await buscarNoGoogleBooks(assunto, pagina)

    } catch (erro) {

        console.error('Google Books indisponível, usando Open Library:', erro.message)

        return await buscarNoOpenLibrary(assunto, pagina)

    }

}


// ======================================================
// IMPORTAR UMA RODADA
// ======================================================
//
// Uma rodada consulta TODOS os assuntos escolhidos ao mesmo tempo
// (em paralelo) e grava os livros novos no banco. Assim os livros
// chegam rápido. A rodada seguinte pede as próximas páginas.
//

async function importarRodada(chaveAssunto, pagina) {

    const total = await Produto.count()

    const vagas = LIMITE_CATALOGO - total

    if (vagas <= 0) {
        return { importados: 0, total, acabou: true }
    }

    const chaves = chaveAssunto === 'todos'
        ? Object.keys(ASSUNTOS)
        : [chaveAssunto]

    // Consulta os assuntos ao mesmo tempo
    const consultas = await Promise.allSettled(
        chaves.map(chave => buscarNaBiblioteca(ASSUNTOS[chave], pagina))
    )

    if (consultas.every(consulta => consulta.status === 'rejected')) {
        throw new Error('Nenhuma biblioteca respondeu')
    }

    // Junta os resultados alternando entre os assuntos,
    // para o catálogo ficar variado mesmo com o limite de vagas
    const filas = consultas.map((consulta, i) =>
        consulta.status === 'fulfilled'
            ? consulta.value.map(livro => ({ livro, chave: chaves[i] }))
            : []
    )

    const encontrados = []

    const maior = Math.max(...filas.map(fila => fila.length))

    for (let i = 0; i < maior; i++) {
        filas.forEach(fila => {
            if (fila[i]) {
                encontrados.push(fila[i])
            }
        })
    }

    // Categorias dos assuntos usados
    const categorias = {}

    for (const chave of chaves) {

        const [categoria] = await Categoria.findOrCreate({
            where: { nome: ASSUNTOS[chave].categoria },
            defaults: {
                descricao: `Livros de ${ASSUNTOS[chave].categoria.toLowerCase()}.`
            }
        })

        categorias[chave] = categoria.id
    }

    // Livros que já estão no banco (para não duplicar)
    const existentes = new Set(
        (await Produto.findAll({
            attributes: ['colecao', 'escritor', 'formato']
        })).map(p => `${p.colecao}|${p.escritor}|${p.formato}`)
    )

    // Monta a lista do que será gravado
    const novos = []

    for (const { livro, chave } of encontrados) {

        const titulo = livro.titulo && limitarTexto(livro.titulo, 135)

        const escritor = livro.escritor && limitarTexto(livro.escritor, 150)

        // Sem título, autor ou ano o livro não pode ser cadastrado
        if (!titulo || !escritor || !Number.isInteger(livro.ano)) {
            continue
        }

        const base = {
            escritor,
            colecao: titulo,
            ano: livro.ano,
            imagem: livro.imagem && enderecoSeguro(livro.imagem)
                ? limitarTexto(livro.imagem, 500)
                : null,
            descricao: livro.descricao || 'Livro importado de um catálogo público.',
            categoria_id: categorias[chave]
        }

        const chaveFisico = `${titulo}|${escritor}|FISICO`

        if (!existentes.has(chaveFisico)) {

            existentes.add(chaveFisico)

            novos.push({
                ...base,
                nome: titulo,
                formato: 'FISICO',
                preco: PRECO_FISICO
            })

        }

        // E-book: só quando a biblioteca informa leitura livre
        const chaveEbook = `${titulo}|${escritor}|EBOOK`

        if (livro.livre && enderecoSeguro(livro.link) && !existentes.has(chaveEbook)) {

            existentes.add(chaveEbook)

            novos.push({
                ...base,
                nome: `${titulo} (E-book)`,
                formato: 'EBOOK',
                preco: PRECO_EBOOK,
                arquivo_url: limitarTexto(livro.link, 500)
            })

        }

    }

    const aGravar = novos.slice(0, vagas)

    // Grava em grupos, vários livros ao mesmo tempo
    for (let i = 0; i < aGravar.length; i += 20) {

        await Promise.all(aGravar.slice(i, i + 20).map(async item => {

            const produto = await Produto.create(item)

            if (item.formato === 'FISICO') {
                await Estoque.create({
                    produto_id: produto.id,
                    quantidade: ESTOQUE_INICIAL
                })
            }

        }))

    }

    const totalFinal = total + aGravar.length

    // Terminou quando o catálogo encheu ou as bibliotecas não têm mais livros
    const acabou = totalFinal >= LIMITE_CATALOGO || encontrados.length === 0

    return { importados: aGravar.length, total: totalFinal, acabou }
}


// ======================================================
// ROTA PÚBLICA: IMPORTAR LIVROS
// ======================================================

const importar = async (req, res) => {

    const chave = req.body.assunto || 'todos'

    if (chave !== 'todos' && !ASSUNTOS[chave]) {
        return res.status(400).json({
            message: 'Assunto inválido!'
        })
    }

    let pagina = parseInt(req.body.pagina, 10)

    if (!Number.isInteger(pagina) || pagina < 1) {
        pagina = 1
    }

    if (pagina > 500) {
        pagina = 500
    }

    if (ipAtingiuLimite(req.ip)) {
        return res.status(429).json({
            message: 'Você já importou bastante por agora. Tente de novo mais tarde!'
        })
    }

    if (importando) {
        return res.status(429).json({
            message: 'Uma importação já está em andamento. Aguarde alguns segundos!'
        })
    }

    importando = true

    try {

        const resultado = await importarRodada(chave, pagina)

        res.status(200).json({
            message: resultado.importados > 0
                ? `${resultado.importados} produto(s) importado(s) com sucesso!`
                : (resultado.total >= LIMITE_CATALOGO
                    ? 'O catálogo já está completo!'
                    : 'Nenhum livro novo nesta rodada.'),
            importados: resultado.importados,
            total_catalogo: resultado.total,
            limite_catalogo: LIMITE_CATALOGO,
            proxima_pagina: pagina + 1,
            acabou: resultado.acabou
        })

    } catch (err) {

        console.error('Erro ao importar livros!', err)

        res.status(502).json({
            message: 'Não foi possível consultar a biblioteca pública agora!'
        })

    } finally {

        importando = false

    }

}


module.exports = {
    importar,
    importarRodada,
    LIMITE_CATALOGO
}
