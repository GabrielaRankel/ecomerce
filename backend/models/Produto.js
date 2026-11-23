const { DataTypes } = require("sequelize");
const conn = require("../db/conn");

const Produto = conn.define("produtos", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    nome: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    escritor: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    // Título do livro
    colecao: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    // FISICO = livro impresso (tem estoque e entrega)
    // EBOOK  = livro digital (sem estoque e sem entrega)
    formato: {
        type: DataTypes.ENUM("FISICO", "EBOOK"),
        allowNull: false
    },

    // Ano da primeira publicação
    ano: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    imagem: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    descricao: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Endereço do arquivo do e-book (nunca é exibido nas rotas públicas)
    arquivo_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'produtos',
    timestamps: false
});

module.exports = Produto;
