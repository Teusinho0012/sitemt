const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mt_turismo.db');
const db = new sqlite3.Database(dbPath);

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS destinos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      localizacao TEXT NOT NULL,
      descricao TEXT NOT NULL,
      imagem_url TEXT,
      categoria TEXT DEFAULT 'natureza',
      nivel_aventura TEXT DEFAULT 'Moderado',
      popularidade INTEGER DEFAULT 50,
      cidade_base TEXT DEFAULT ''
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS cachoeiras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      municipio TEXT NOT NULL,
      altura_metros INTEGER,
      nivel TEXT NOT NULL,
      descricao TEXT NOT NULL,
      imagem_url TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT,
      cidade TEXT,
      interesse TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS empresa (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nome_fantasia TEXT NOT NULL,
      cnpj TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT,
      endereco TEXT,
      descricao TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS hospedagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      foto_url TEXT,
      preco_diaria REAL NOT NULL,
      contato TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      cidade TEXT NOT NULL,
      descricao TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS servicos_empresa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_nome TEXT NOT NULL,
      titulo_servico TEXT NOT NULL,
      descricao TEXT NOT NULL,
      contato TEXT NOT NULL,
      foto_url TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_nome TEXT NOT NULL,
      local_nome TEXT NOT NULL,
      nota INTEGER NOT NULL CHECK(nota >= 1 AND nota <= 5),
      comentario TEXT NOT NULL,
      foto_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS passeios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      data_passeio TEXT NOT NULL,
      vagas INTEGER NOT NULL,
      preco REAL NOT NULL,
      local_nome TEXT NOT NULL,
      guia_nome TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo_item TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  const destinoCols = await all(`PRAGMA table_info(destinos)`);
  const colNames = destinoCols.map((c) => c.name);
  if (!colNames.includes('categoria')) {
    await run(`ALTER TABLE destinos ADD COLUMN categoria TEXT DEFAULT 'natureza'`);
  }
  if (!colNames.includes('nivel_aventura')) {
    await run(`ALTER TABLE destinos ADD COLUMN nivel_aventura TEXT DEFAULT 'Moderado'`);
  }
  if (!colNames.includes('popularidade')) {
    await run(`ALTER TABLE destinos ADD COLUMN popularidade INTEGER DEFAULT 50`);
  }
  if (!colNames.includes('cidade_base')) {
    await run(`ALTER TABLE destinos ADD COLUMN cidade_base TEXT DEFAULT ''`);
  }

  const destinosCount = await all('SELECT COUNT(*) AS total FROM destinos');
  if (destinosCount[0].total === 0) {
    const destinosSeed = [
      ['Chapada dos Guimarães', 'Chapada dos Guimarães', 'Parque nacional com paredões, trilhas e paisagens incríveis do cerrado.', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470'],
      ['Pantanal Mato-grossense', 'Poconé e região', 'Maior planície alagável do mundo, perfeita para ecoturismo e observação de fauna.', 'https://images.unsplash.com/photo-1472396961693-142e6e269027'],
      ['Nobres', 'Nobres', 'Destino famoso por rios cristalinos, flutuação e cavernas.', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'],
      ['Cuiabá - Centro Histórico', 'Cuiabá', 'Arquitetura colonial, cultura regional e gastronomia típica.', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa'],
      ['Vila Bela da Santíssima Trindade', 'Vila Bela da Santíssima Trindade', 'Cidade histórica com forte herança cultural afro-brasileira.', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'],
      ['Parque Estadual do Cristalino', 'Alta Floresta', 'Floresta amazônica preservada, ideal para observação de aves e trilhas.', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429']
    ];

    for (const d of destinosSeed) {
      await run(
        `INSERT INTO destinos
          (nome, localizacao, descricao, imagem_url, categoria, nivel_aventura, popularidade, cidade_base)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          d[0], d[1], d[2], d[3],
          'natureza',
          d[0].includes('Chapada') ? 'Difícil' : 'Moderado',
          Math.floor(Math.random() * 40) + 60,
          d[1]
        ]
      );
    }
  }

  const cachoeirasCount = await all('SELECT COUNT(*) AS total FROM cachoeiras');
  if (cachoeirasCount[0].total === 0) {
    const cachoeirasSeed = [
      ['Cachoeira Véu de Noiva', 'Chapada dos Guimarães', 86, 'Moderado', 'Um dos cartões-postais mais famosos do estado.', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000'],
      ['Cachoeira do Prata', 'Jaciara', 25, 'Fácil', 'Quedas d’água em meio à vegetação exuberante.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'],
      ['Cachoeira da Fumaça', 'Jaciara', 30, 'Moderado', 'Ótima para banho e atividades de aventura.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'],
      ['Cachoeira Serra Azul', 'Nobres', 45, 'Moderado', 'Águas cristalinas com vista panorâmica da região.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'],
      ['Cachoeira Salto das Nuvens', 'Tangará da Serra', 19, 'Fácil', 'Queda larga e muito visitada, ótima para fotos.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'],
      ['Cachoeira dos Namorados', 'Chapada dos Guimarães', 20, 'Fácil', 'Acesso por trilha curta, ambiente agradável para famílias.', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606'],
      ['Cachoeira Rica', 'Chapada dos Guimarães', 35, 'Moderado', 'Complexo com várias quedas d’água e poços para banho.', 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c'],
      ['Cachoeira Queda do Meu Deus', 'Nobres', 18, 'Fácil', 'Destino popular em Nobres, com águas transparentes.', 'https://images.unsplash.com/photo-1472396961693-142e6e269027'],
      ['Cachoeira da Geladeira', 'Chapada dos Guimarães', 28, 'Difícil', 'Trilha mais exigente e cenário selvagem recompensador.', 'https://images.unsplash.com/photo-1501854140801-50d01698950b'],
      ['Cachoeira do Tombador', 'Nobres', 22, 'Moderado', 'Queda charmosa cercada por natureza preservada.', 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d']
    ];

    for (const c of cachoeirasSeed) {
      await run(
        'INSERT INTO cachoeiras (nome, municipio, altura_metros, nivel, descricao, imagem_url) VALUES (?, ?, ?, ?, ?, ?)',
        c
      );
    }
  }

  const empresaRow = await get('SELECT id FROM empresa WHERE id = 1');
  if (!empresaRow) {
    await run(
      `INSERT INTO empresa (id, nome_fantasia, cnpj, email, telefone, endereco, descricao)
       VALUES (1, ?, ?, ?, ?, ?, ?)`,
      [
        'MT Turismo',
        '00.000.000/0001-00',
        'contato@mtturismo.com.br',
        '(65) 99999-0000',
        'Cuiabá - MT',
        'Empresa dedicada à promoção do turismo no Mato Grosso.'
      ]
    );
  }

  const hospedagensCount = await get('SELECT COUNT(*) AS total FROM hospedagens');
  if (hospedagensCount.total === 0) {
    const hospedagensSeed = [
      ['Hotel Pantanal Premium', 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 420, '(65) 9999-1111', -16.606, -56.759, 'Poconé', 'Hospedagem de alto padrão com foco em ecoturismo.'],
      ['Pousada Chapada Verde', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c', 280, '(65) 9999-2222', -15.4607, -55.7499, 'Chapada dos Guimarães', 'Pousada aconchegante com vista para o cerrado.'],
      ['Camping Nobres Nature', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7', 95, '(65) 9999-3333', -14.7207, -56.3275, 'Nobres', 'Camping estruturado para aventura e contato com a natureza.']
    ];

    for (const h of hospedagensSeed) {
      await run(
        'INSERT INTO hospedagens (nome, foto_url, preco_diaria, contato, latitude, longitude, cidade, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        h
      );
    }
  }

  const avaliacoesCount = await get('SELECT COUNT(*) AS total FROM avaliacoes');
  if (avaliacoesCount.total === 0) {
    const avaliacoesSeed = [
      ['Mariana Silva', 'Cachoeira Véu de Noiva', 5, 'Lugar incrível, água muito limpa!', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'],
      ['Rafael Souza', 'Pantanal Mato-grossense', 5, 'Experiência inesquecível com muita fauna.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'],
      ['Ana Costa', 'Chapada dos Guimarães', 4, 'Trilhas lindas e ótima estrutura de visitação.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80']
    ];

    for (const a of avaliacoesSeed) {
      await run(
        'INSERT INTO avaliacoes (usuario_nome, local_nome, nota, comentario, foto_url) VALUES (?, ?, ?, ?, ?)',
        a
      );
    }
  }

  const passeiosCount = await get('SELECT COUNT(*) AS total FROM passeios');
  if (passeiosCount.total === 0) {
    const passeiosSeed = [
      ['Passeio Pantanal Sunrise', '2026-04-22', 12, 220, 'Pantanal Mato-grossense', 'Guia João Pantaneiro'],
      ['Trilha Chapada Premium', '2026-04-25', 18, 180, 'Chapada dos Guimarães', 'Guia Carla Aventura'],
      ['Flutuação em Nobres', '2026-04-30', 10, 250, 'Nobres', 'Guia Pedro Cristalino']
    ];

    for (const p of passeiosSeed) {
      await run(
        'INSERT INTO passeios (titulo, data_passeio, vagas, preco, local_nome, guia_nome) VALUES (?, ?, ?, ?, ?, ?)',
        p
      );
    }
  }

  const usuarioPadrao = await get('SELECT id FROM usuarios WHERE email = ?', ['visitante@mt.com']);
  if (!usuarioPadrao) {
    await run(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      ['Visitante Padrão', 'visitante@mt.com', '123456']
    );
  } else {
    await run('UPDATE usuarios SET senha_hash = ? WHERE email = ?', ['123456', 'visitante@mt.com']);
  }

  await run(`UPDATE destinos SET categoria = COALESCE(categoria, 'natureza')`);
  await run(`UPDATE destinos SET nivel_aventura = COALESCE(nivel_aventura, 'Moderado')`);
  await run(`UPDATE destinos SET popularidade = COALESCE(popularidade, 70)`);
  await run(`UPDATE destinos SET cidade_base = CASE WHEN cidade_base IS NULL OR cidade_base = '' THEN localizacao ELSE cidade_base END`);

  const secretosCount = await get(
    "SELECT COUNT(*) AS total FROM destinos WHERE categoria = 'secreto'"
  );

  if (secretosCount.total === 0) {
    const secretos = [
      ['Vale Escondido do Cerrado', 'Rosário Oeste', 'Refúgio pouco explorado com mirantes naturais.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', 'secreto', 'Moderado', 74, 'Rosário Oeste'],
      ['Poço Azul do Jatobá', 'Nobres', 'Poço cristalino em área de difícil acesso e pouca visitação.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', 'secreto', 'Difícil', 71, 'Nobres'],
      ['Trilha Pedra da Lua', 'Cáceres', 'Trilha com formações rochosas raras e vista para o pôr do sol.', 'https://images.unsplash.com/photo-1501854140801-50d01698950b', 'secreto', 'Moderado', 68, 'Cáceres']
    ];

    for (const s of secretos) {
      await run(
        `INSERT INTO destinos
          (nome, localizacao, descricao, imagem_url, categoria, nivel_aventura, popularidade, cidade_base)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        s
      );
    }
  }
}

module.exports = {
  db,
  run,
  all,
  get,
  initDatabase
};
