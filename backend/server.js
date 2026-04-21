const express = require('express');
const cors = require('cors');
const { all, get, run, initDatabase } = require('./database');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API Turismo MT online' });
});

app.get('/api/destinos', async (req, res) => {
  try {
    const { categoria, cidade, nivel } = req.query;

    const filtros = [];
    const params = [];

    if (categoria) {
      filtros.push('LOWER(categoria) = ?');
      params.push(String(categoria).toLowerCase());
    }

    if (cidade) {
      filtros.push('(LOWER(cidade_base) LIKE ? OR LOWER(localizacao) LIKE ?)');
      const cidadeLike = `%${String(cidade).toLowerCase()}%`;
      params.push(cidadeLike, cidadeLike);
    }

    if (nivel) {
      filtros.push('LOWER(nivel_aventura) = ?');
      params.push(String(nivel).toLowerCase());
    }

    const whereClause = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const destinos = await all(
      `SELECT * FROM destinos ${whereClause} ORDER BY popularidade DESC, id ASC`,
      params
    );
    res.json(destinos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar destinos', detail: error.message });
  }
});

app.get('/api/cachoeiras', async (_req, res) => {
  try {
    const cachoeiras = await all('SELECT * FROM cachoeiras ORDER BY id ASC LIMIT 10');
    res.json(cachoeiras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cachoeiras', detail: error.message });
  }
});

app.get('/api/clientes', async (_req, res) => {
  try {
    const clientes = await all('SELECT * FROM clientes ORDER BY id DESC');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes', detail: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, email, telefone, cidade, interesse } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }

    const result = await run(
      'INSERT INTO clientes (nome, email, telefone, cidade, interesse) VALUES (?, ?, ?, ?, ?)',
      [nome, email, telefone || '', cidade || '', interesse || '']
    );

    const novoCliente = await get('SELECT * FROM clientes WHERE id = ?', [result.lastID]);
    res.status(201).json(novoCliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar cliente', detail: error.message });
  }
});

app.get('/api/empresa', async (_req, res) => {
  try {
    const empresa = await get('SELECT * FROM empresa WHERE id = 1');
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados da empresa', detail: error.message });
  }
});

app.put('/api/empresa', async (req, res) => {
  try {
    const { nome_fantasia, cnpj, email, telefone, endereco, descricao } = req.body;

    if (!nome_fantasia || !cnpj || !email) {
      return res.status(400).json({ error: 'Nome fantasia, CNPJ e email são obrigatórios.' });
    }

    await run(
      `UPDATE empresa
       SET nome_fantasia = ?, cnpj = ?, email = ?, telefone = ?, endereco = ?, descricao = ?
       WHERE id = 1`,
      [nome_fantasia, cnpj, email, telefone || '', endereco || '', descricao || '']
    );

    const empresaAtualizada = await get('SELECT * FROM empresa WHERE id = 1');
    res.json(empresaAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar empresa', detail: error.message });
  }
});

app.get('/api/hospedagens', async (_req, res) => {
  try {
    const hospedagens = await all('SELECT * FROM hospedagens ORDER BY id DESC');
    res.json(hospedagens);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar hospedagens', detail: error.message });
  }
});

app.post('/api/hospedagens', async (req, res) => {
  try {
    const { nome, foto_url, preco_diaria, contato, latitude, longitude, cidade, descricao } = req.body;

    if (!nome || !preco_diaria || !contato || !cidade) {
      return res.status(400).json({ error: 'Nome, preço da diária, contato e cidade são obrigatórios.' });
    }

    const result = await run(
      `INSERT INTO hospedagens (nome, foto_url, preco_diaria, contato, latitude, longitude, cidade, descricao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, foto_url || '', preco_diaria, contato, latitude || null, longitude || null, cidade, descricao || '']
    );

    const novaHospedagem = await get('SELECT * FROM hospedagens WHERE id = ?', [result.lastID]);
    res.status(201).json(novaHospedagem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar hospedagem', detail: error.message });
  }
});

app.get('/api/servicos', async (_req, res) => {
  try {
    const servicos = await all('SELECT * FROM servicos_empresa ORDER BY id DESC');
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviços', detail: error.message });
  }
});

app.post('/api/servicos', async (req, res) => {
  try {
    const { empresa_nome, titulo_servico, descricao, contato, foto_url } = req.body;

    if (!empresa_nome || !titulo_servico || !descricao || !contato) {
      return res.status(400).json({ error: 'Empresa, título, descrição e contato são obrigatórios.' });
    }

    const result = await run(
      `INSERT INTO servicos_empresa (empresa_nome, titulo_servico, descricao, contato, foto_url)
       VALUES (?, ?, ?, ?, ?)`,
      [empresa_nome, titulo_servico, descricao, contato, foto_url || '']
    );

    const novoServico = await get('SELECT * FROM servicos_empresa WHERE id = ?', [result.lastID]);
    res.status(201).json(novoServico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar serviço', detail: error.message });
  }
});

app.get('/api/avaliacoes', async (_req, res) => {
  try {
    const avaliacoes = await all('SELECT * FROM avaliacoes ORDER BY id DESC');
    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar avaliações', detail: error.message });
  }
});

app.post('/api/avaliacoes', async (req, res) => {
  try {
    const { usuario_nome, local_nome, nota, comentario, foto_url } = req.body;

    if (!usuario_nome || !local_nome || !nota || !comentario) {
      return res.status(400).json({ error: 'Usuário, local, nota e comentário são obrigatórios.' });
    }

    if (Number(nota) < 1 || Number(nota) > 5) {
      return res.status(400).json({ error: 'A nota deve ser entre 1 e 5.' });
    }

    const result = await run(
      `INSERT INTO avaliacoes (usuario_nome, local_nome, nota, comentario, foto_url)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_nome, local_nome, Number(nota), comentario, foto_url || '']
    );

    const novaAvaliacao = await get('SELECT * FROM avaliacoes WHERE id = ?', [result.lastID]);
    res.status(201).json(novaAvaliacao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar avaliação', detail: error.message });
  }
});

app.get('/api/passeios', async (_req, res) => {
  try {
    const passeios = await all('SELECT * FROM passeios ORDER BY data_passeio ASC');
    res.json(passeios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar passeios', detail: error.message });
  }
});

app.post('/api/passeios', async (req, res) => {
  try {
    const { titulo, data_passeio, vagas, preco, local_nome, guia_nome } = req.body;

    if (!titulo || !data_passeio || !vagas || !preco || !local_nome || !guia_nome) {
      return res.status(400).json({ error: 'Título, data, vagas, preço, local e guia são obrigatórios.' });
    }

    const result = await run(
      `INSERT INTO passeios (titulo, data_passeio, vagas, preco, local_nome, guia_nome)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, data_passeio, Number(vagas), Number(preco), local_nome, guia_nome]
    );

    const novoPasseio = await get('SELECT * FROM passeios WHERE id = ?', [result.lastID]);
    res.status(201).json(novoPasseio);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar passeio', detail: error.message });
  }
});

app.get('/api/favoritos/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const favoritos = await all(
      'SELECT * FROM favoritos WHERE usuario_id = ? ORDER BY id DESC',
      [usuarioId]
    );
    res.json(favoritos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar favoritos', detail: error.message });
  }
});

app.post('/api/favoritos', async (req, res) => {
  try {
    const { usuario_id, tipo_item, item_id } = req.body;

    if (!usuario_id || !tipo_item || !item_id) {
      return res.status(400).json({ error: 'Usuário, tipo de item e item são obrigatórios.' });
    }

    const result = await run(
      'INSERT INTO favoritos (usuario_id, tipo_item, item_id) VALUES (?, ?, ?)',
      [Number(usuario_id), tipo_item, Number(item_id)]
    );

    const novoFavorito = await get('SELECT * FROM favoritos WHERE id = ?', [result.lastID]);
    res.status(201).json(novoFavorito);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar favorito', detail: error.message });
  }
});

app.get('/api/recomendacoes', async (req, res) => {
  try {
    const { tipo = 'natureza', cidade = '' } = req.query;
    const cidadeLike = `%${String(cidade).toLowerCase()}%`;
    const tipoNormalizado = String(tipo).toLowerCase();

    let recomendados = await all(
      `SELECT * FROM destinos
       WHERE LOWER(categoria) = ?
         AND (? = '%%' OR LOWER(cidade_base) LIKE ? OR LOWER(localizacao) LIKE ?)
       ORDER BY popularidade DESC
       LIMIT 6`,
      [tipoNormalizado, cidadeLike, cidadeLike, cidadeLike]
    );

    if (recomendados.length === 0) {
      recomendados = await all(
        `SELECT * FROM destinos
         ORDER BY popularidade DESC
         LIMIT 6`
      );
    }

    res.json(recomendados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar recomendações', detail: error.message });
  }
});

app.get('/api/clima', async (req, res) => {
  try {
    const cidade = String(req.query.cidade || '').trim();
    if (!cidade) {
      return res.status(400).json({ error: 'Cidade é obrigatória.' });
    }

    const base = cidade.length * 7;
    const temperatura = 22 + (base % 11);
    const chuva = 10 + (base % 70);

    let melhorDia = 'Sábado';
    if (chuva > 60) melhorDia = 'Quinta';
    if (chuva < 25) melhorDia = 'Domingo';

    res.json({
      cidade,
      temperatura,
      chanceChuva: chuva,
      melhorDia,
      recomendacao: chuva > 60
        ? 'Leve capa de chuva e considere passeios curtos.'
        : 'Clima favorável para atividades ao ar livre.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter clima', detail: error.message });
  }
});

app.get('/api/ranking-destinos', async (_req, res) => {
  try {
    const ranking = await all(
      `SELECT id, nome, cidade_base, popularidade, categoria, nivel_aventura
       FROM destinos
       ORDER BY popularidade DESC, id ASC
       LIMIT 10`
    );
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking', detail: error.message });
  }
});

app.get('/api/destinos-secretos', async (_req, res) => {
  try {
    const secretos = await all(
      `SELECT * FROM destinos
       WHERE LOWER(categoria) = 'secreto'
       ORDER BY popularidade DESC`
    );
    res.json(secretos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar destinos secretos', detail: error.message });
  }
});

app.get('/api/busca-cidade', async (req, res) => {
  try {
    const cidade = String(req.query.cidade || '').trim().toLowerCase();
    if (!cidade) {
      return res.status(400).json({ error: 'Cidade é obrigatória.' });
    }

    const like = `%${cidade}%`;
    const [destinosCidade, cachoeirasCidade, hospedagensCidade] = await Promise.all([
      all('SELECT * FROM destinos WHERE LOWER(cidade_base) LIKE ? OR LOWER(localizacao) LIKE ? ORDER BY popularidade DESC', [like, like]),
      all('SELECT * FROM cachoeiras WHERE LOWER(municipio) LIKE ? ORDER BY id ASC', [like]),
      all('SELECT * FROM hospedagens WHERE LOWER(cidade) LIKE ? ORDER BY preco_diaria ASC', [like])
    ]);

    res.json({
      cidade: req.query.cidade,
      destinos: destinosCidade,
      cachoeiras: cachoeirasCidade,
      hospedagens: hospedagensCidade
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro na busca por cidade', detail: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const usuario = await get('SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?', [email]);

    if (!usuario || usuario.senha_hash !== senha) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    res.json({
      message: 'Login realizado com sucesso.',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login', detail: error.message });
  }
});

app.post('/api/planejar-viagem', async (req, res) => {
  try {
    const { dias, cidade, tipoTurismo } = req.body;

    const tiposValidos = ['aventura', 'família', 'natureza'];
    const totalDias = Number(dias);

    if (!totalDias || totalDias < 1) {
      return res.status(400).json({ error: 'Quantidade de dias deve ser maior ou igual a 1.' });
    }

    if (!cidade || typeof cidade !== 'string') {
      return res.status(400).json({ error: 'Cidade é obrigatória.' });
    }

    if (!tiposValidos.includes(tipoTurismo)) {
      return res.status(400).json({ error: 'Tipo de turismo inválido. Use: aventura, família ou natureza.' });
    }

    const cidadeLike = `%${cidade.trim().toLowerCase()}%`;

    let destinosCidade = await all(
      'SELECT * FROM destinos WHERE LOWER(localizacao) LIKE ? ORDER BY id ASC',
      [cidadeLike]
    );

    let cachoeirasCidade = await all(
      'SELECT * FROM cachoeiras WHERE LOWER(municipio) LIKE ? ORDER BY id ASC',
      [cidadeLike]
    );

    let passeiosCidade = await all(
      'SELECT * FROM passeios WHERE LOWER(local_nome) LIKE ? ORDER BY data_passeio ASC',
      [cidadeLike]
    );

    let hospedagensCidade = await all(
      'SELECT * FROM hospedagens WHERE LOWER(cidade) LIKE ? ORDER BY preco_diaria ASC',
      [cidadeLike]
    );

    if (destinosCidade.length === 0) {
      destinosCidade = await all('SELECT * FROM destinos ORDER BY id ASC LIMIT 6');
    }
    if (cachoeirasCidade.length === 0) {
      cachoeirasCidade = await all('SELECT * FROM cachoeiras ORDER BY id ASC LIMIT 10');
    }
    if (passeiosCidade.length === 0) {
      passeiosCidade = await all('SELECT * FROM passeios ORDER BY data_passeio ASC LIMIT 6');
    }
    if (hospedagensCidade.length === 0) {
      hospedagensCidade = await all('SELECT * FROM hospedagens ORDER BY preco_diaria ASC LIMIT 5');
    }

    const roteiro = [];
    const dicasBase = {
      aventura: ['Leve tênis de trilha', 'Use protetor solar e repelente', 'Hidrate-se durante os passeios'],
      família: ['Prefira passeios com acesso fácil', 'Leve lanches e água', 'Verifique estrutura para crianças'],
      natureza: ['Respeite áreas de preservação', 'Não deixe lixo nas trilhas', 'Use guia local quando possível']
    };

    for (let dia = 1; dia <= totalDias; dia += 1) {
      const destino = destinosCidade[(dia - 1) % destinosCidade.length];
      const cachoeira = cachoeirasCidade[(dia - 1) % cachoeirasCidade.length];
      const passeio = passeiosCidade[(dia - 1) % passeiosCidade.length];

      roteiro.push({
        dia,
        manha: destino
          ? `Visita a ${destino.nome} (${destino.localizacao})`
          : 'Passeio livre pela cidade',
        tarde: cachoeira
          ? `Banho e descanso em ${cachoeira.nome} (${cachoeira.municipio})`
          : 'Tarde livre para explorar atrações locais',
        noite: passeio
          ? `${passeio.titulo} com guia ${passeio.guia_nome}`
          : 'Jantar típico e descanso'
      });
    }

    const hospedagemSugerida = hospedagensCidade[0] || null;

    res.json({
      resumo: `Roteiro de ${totalDias} dia(s) para ${cidade} com foco em turismo de ${tipoTurismo}.`,
      parametros: { dias: totalDias, cidade, tipoTurismo },
      hospedagemSugerida,
      roteiro,
      dicas: dicasBase[tipoTurismo]
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao montar roteiro automático', detail: error.message });
  }
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor backend rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Falha ao inicializar banco de dados:', error);
    process.exit(1);
  });
