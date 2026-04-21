import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const categoriasHome = [
  { titulo: 'Cachoeiras', descricao: 'As melhores quedas d’água para banho e aventura.' },
  { titulo: 'Rios', descricao: 'Águas cristalinas, flutuação e experiências únicas.' },
  { titulo: 'Trilhas', descricao: 'Rotas incríveis em meio ao cerrado e à floresta.' },
  { titulo: 'Hospedagens', descricao: 'Hotéis, pousadas e campings para todos os estilos.' },
  { titulo: 'Guias turísticos', descricao: 'Profissionais locais para passeios seguros e completos.' }
];

const destaquesSemana = [
  'Chapada dos Guimarães',
  'Pantanal Mato-grossense',
  'Nobres',
  'Salto das Nuvens'
];

const pontosMapa = [
  {
    id: 1,
    tipo: 'cachoeira',
    nome: 'Cachoeira Véu de Noiva',
    coords: [-15.407, -55.834],
    descricao: 'Cartão-postal da Chapada com 86m de queda.',
    foto: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000'
  },
  {
    id: 2,
    tipo: 'parque',
    nome: 'Parque Nacional da Chapada',
    coords: [-15.3202, -55.8682],
    descricao: 'Paisagens grandiosas, cânions e trilhas.',
    foto: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
  },
  {
    id: 3,
    tipo: 'hotel',
    nome: 'Hotel Pantanal Eco',
    coords: [-16.606, -56.759],
    descricao: 'Hospedagem com foco em ecoturismo no Pantanal.',
    foto: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
  },
  {
    id: 4,
    tipo: 'restaurante',
    nome: 'Sabores de Cuiabá',
    coords: [-15.5989, -56.0949],
    descricao: 'Culinária regional com peixes e pratos típicos.',
    foto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'
  },
  {
    id: 5,
    tipo: 'trilha',
    nome: 'Trilha do Mirante',
    coords: [-14.731, -56.337],
    descricao: 'Trilha moderada com visual panorâmico em Nobres.',
    foto: 'https://images.unsplash.com/photo-1472396961693-142e6e269027'
  }
];

function App() {
  const [secaoAtiva, setSecaoAtiva] = useState('home');
  const [destinos, setDestinos] = useState([]);
  const [cachoeiras, setCachoeiras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [clienteForm, setClienteForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    interesse: ''
  });

  const [empresaForm, setEmpresaForm] = useState({
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    descricao: ''
  });

  const [mensagemCliente, setMensagemCliente] = useState('');
  const [mensagemEmpresa, setMensagemEmpresa] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [mensagemLogin, setMensagemLogin] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [planejadorForm, setPlanejadorForm] = useState({
    dias: 3,
    cidade: 'Chapada dos Guimarães',
    tipoTurismo: 'aventura'
  });
  const [roteiroGerado, setRoteiroGerado] = useState(null);
  const [mensagemPlanejador, setMensagemPlanejador] = useState('');
  const [filtroDestinos, setFiltroDestinos] = useState({ categoria: '', cidade: '', nivel: '' });
  const [destinosFiltrados, setDestinosFiltrados] = useState([]);
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [climaCidade, setClimaCidade] = useState('Cuiabá');
  const [clima, setClima] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [destinosSecretos, setDestinosSecretos] = useState([]);
  const [buscaCidade, setBuscaCidade] = useState('Cuiabá');
  const [resultadoCidade, setResultadoCidade] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem('mt_turismo_dark_mode');
    if (temaSalvo) {
      setDarkMode(temaSalvo === 'true');
    }
    const timer = setTimeout(() => setHeroLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('mt_turismo_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [
          resDestinos,
          resCachoeiras,
          resClientes,
          resEmpresa,
          resRecomendacoes,
          resRanking,
          resSecretos
        ] = await Promise.all([
          fetch('/api/destinos'),
          fetch('/api/cachoeiras'),
          fetch('/api/clientes'),
          fetch('/api/empresa'),
          fetch('/api/recomendacoes?tipo=natureza'),
          fetch('/api/ranking-destinos'),
          fetch('/api/destinos-secretos')
        ]);

        const destinosData = await resDestinos.json();
        const cachoeirasData = await resCachoeiras.json();
        const clientesData = await resClientes.json();
        const empresaData = await resEmpresa.json();
        const recomendacoesData = await resRecomendacoes.json();
        const rankingData = await resRanking.json();
        const secretosData = await resSecretos.json();

        setDestinos(destinosData);
        setDestinosFiltrados(destinosData);
        setCachoeiras(cachoeirasData);
        setClientes(clientesData);
        setEmpresa(empresaData);
        setRecomendacoes(recomendacoesData);
        setRanking(rankingData);
        setDestinosSecretos(secretosData);
        setEmpresaForm({
          nome_fantasia: empresaData?.nome_fantasia || '',
          cnpj: empresaData?.cnpj || '',
          email: empresaData?.email || '',
          telefone: empresaData?.telefone || '',
          endereco: empresaData?.endereco || '',
          descricao: empresaData?.descricao || ''
        });
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosIniciais();
  }, []);

  const totalPontos = useMemo(() => destinos.length + cachoeiras.length, [destinos, cachoeiras]);

  const resultadosBusca = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];
    const base = [
      ...destinos.map((d) => ({ tipo: 'Destino', nome: d.nome })),
      ...cachoeiras.map((c) => ({ tipo: 'Cachoeira', nome: c.nome })),
      ...categoriasHome.map((c) => ({ tipo: 'Categoria', nome: c.titulo }))
    ];
    return base.filter((item) => item.nome.toLowerCase().includes(termo)).slice(0, 8);
  }, [busca, destinos, cachoeiras]);

  const cadastrarCliente = async (e) => {
    e.preventDefault();
    setMensagemCliente('');

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteForm)
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagemCliente(data.error || 'Falha ao cadastrar cliente.');
        return;
      }

      setClientes((prev) => [data, ...prev]);
      setClienteForm({ nome: '', email: '', telefone: '', cidade: '', interesse: '' });
      setMensagemCliente('Cliente cadastrado com sucesso!');
    } catch {
      setMensagemCliente('Erro de conexão ao cadastrar cliente.');
    }
  };

  const salvarEmpresa = async (e) => {
    e.preventDefault();
    setMensagemEmpresa('');

    try {
      const response = await fetch('/api/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresaForm)
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagemEmpresa(data.error || 'Falha ao atualizar dados da empresa.');
        return;
      }

      setEmpresa(data);
      setMensagemEmpresa('Dados da empresa atualizados com sucesso!');
    } catch {
      setMensagemEmpresa('Erro de conexão ao salvar dados da empresa.');
    }
  };

  const fazerLogin = async (e) => {
    e.preventDefault();
    setMensagemLogin('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (!response.ok) {
        setMensagemLogin(data.error || 'Falha no login.');
        return;
      }
      setUsuarioLogado(data.usuario);
      setMensagemLogin(`Bem-vindo, ${data.usuario.nome}!`);
      setLoginForm({ email: '', senha: '' });
    } catch {
      setMensagemLogin('Erro de conexão no login.');
    }
  };

  const gerarRoteiro = async (e) => {
    e.preventDefault();
    setMensagemPlanejador('');
    setRoteiroGerado(null);

    try {
      const response = await fetch('/api/planejar-viagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planejadorForm)
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagemPlanejador(data.error || 'Não foi possível gerar o roteiro.');
        return;
      }

      setRoteiroGerado(data);
      setMensagemPlanejador('Roteiro gerado com sucesso!');
    } catch {
      setMensagemPlanejador('Erro de conexão ao gerar roteiro.');
    }
  };

  const carregarClima = async () => {
    try {
      const response = await fetch(`/api/clima?cidade=${encodeURIComponent(climaCidade)}`);
      const data = await response.json();
      if (response.ok) setClima(data);
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
    }
  };

  const aplicarFiltros = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filtroDestinos.categoria) params.set('categoria', filtroDestinos.categoria);
    if (filtroDestinos.cidade) params.set('cidade', filtroDestinos.cidade);
    if (filtroDestinos.nivel) params.set('nivel', filtroDestinos.nivel);

    try {
      const response = await fetch(`/api/destinos?${params.toString()}`);
      const data = await response.json();
      if (response.ok) setDestinosFiltrados(data);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  };

  const buscarPorCidade = async () => {
    try {
      const response = await fetch(`/api/busca-cidade?cidade=${encodeURIComponent(buscaCidade)}`);
      const data = await response.json();
      if (response.ok) setResultadoCidade(data);
    } catch (error) {
      console.error('Erro na busca por cidade:', error);
    }
  };

  const favoritarDestino = async (destinoId) => {
    if (!usuarioLogado) {
      setMensagemLogin('Faça login para salvar favoritos.');
      setSecaoAtiva('clientes');
      return;
    }

    try {
      await fetch('/api/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioLogado.id, tipo_item: 'destino', item_id: destinoId })
      });
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const abrirRota = (destino) => {
    const q = encodeURIComponent(`${destino.nome} ${destino.cidade_base || destino.localizacao} Mato Grosso`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, '_blank');
  };

  const navItems = [
    ['home', 'Home'],
    ['planejar', 'Planejar Viagem'],
    ['recomendacoes', 'Recomendações'],
    ['lugares', 'Lugares Turísticos'],
    ['hospedagens', 'Hospedagens'],
    ['empresas', 'Empresas'],
    ['avaliacoes', 'Avaliações'],
    ['agenda', 'Agenda'],
    ['galeria', 'Galeria'],
    ['sobre', 'Sobre MT'],
    ['mapa', 'Mapa'],
    ['clientes', 'Clientes']
  ];

  return (
    <div className={`pagina ${darkMode ? 'theme-dark' : ''}`}>
      <div className="bg-particles" />
      <header className={`hero ${heroLoaded ? 'hero-zoom' : ''}`}>
        <div className="overlay">
          <nav className="topbar">
            <h1>MT Turismo Pro</h1>
            <div className="topbar-actions">
              <button className="toggle-theme" onClick={() => setDarkMode((v) => !v)}>
                {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
              </button>
              <button className="btn-login-nav" onClick={() => setSecaoAtiva('clientes')}>
                👤 Login Cliente
              </button>
            </div>
          </nav>

          <div className="nav-scroll">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSecaoAtiva(key)}
                className={secaoAtiva === key ? 'ativo' : ''}
              >
                {label}
              </button>
            ))}
          </div>

          <motion.section
            className="hero-conteudo"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h2>Descubra o Mato Grosso com experiência profissional</h2>
            <p>Rios, cachoeiras, Pantanal, roteiros guiados e marketplace turístico em um só lugar.</p>

            <div className="busca-box">
              <input
                placeholder="Buscar cachoeiras, hotéis ou guias turísticos"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <span>{resultadosBusca.length > 0 ? `${resultadosBusca.length} resultados` : 'Digite para buscar'}</span>
            </div>

            {busca.trim() && (
              <div className="resultados-busca">
                {resultadosBusca.length === 0 ? (
                  <p>Nenhum resultado encontrado.</p>
                ) : (
                  resultadosBusca.map((item, idx) => (
                    <div key={`${item.nome}-${idx}`} className="resultado-item">
                      <strong>{item.nome}</strong> <small>({item.tipo})</small>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="hero-stats">
              <span>{destinos.length} destinos</span>
              <span>{cachoeiras.length} cachoeiras</span>
              <span>{totalPontos} pontos turísticos</span>
              <span>{clientes.length} clientes cadastrados</span>
            </div>
          </motion.section>
        </div>
      </header>

      <main className="conteudo">
        {secaoAtiva === 'home' && (
          <>
            <section className="secao">
              <div className="secao-titulo">
                <h3>Destaques da Semana</h3>
              </div>
              <div className="chips">
                {destaquesSemana.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </section>

            <section className="secao">
              <div className="secao-titulo">
                <h3>Explore Categorias</h3>
              </div>
              <div className="grid-cards">
                {categoriasHome.map((cat, i) => (
                  <motion.article
                    className="card"
                    key={cat.titulo}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.12, duration: 0.45 }}
                  >
                    <div className="card-body">
                      <h4>{cat.titulo}</h4>
                      <p>{cat.descricao}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          </>
        )}

        {secaoAtiva === 'planejar' && (
          <section className="secao formulario-secao">
            <div className="secao-titulo"><h3>Planejar Viagem</h3></div>
            <p className="texto-secao">Informe os dados abaixo e gere um roteiro automático personalizado.</p>
            <form className="formulario" onSubmit={gerarRoteiro}>
              <input
                type="number"
                min="1"
                placeholder="Quantos dias"
                value={planejadorForm.dias}
                onChange={(e) => setPlanejadorForm({ ...planejadorForm, dias: Number(e.target.value) })}
              />
              <input
                placeholder="Cidade"
                value={planejadorForm.cidade}
                onChange={(e) => setPlanejadorForm({ ...planejadorForm, cidade: e.target.value })}
              />
              <select
                value={planejadorForm.tipoTurismo}
                onChange={(e) => setPlanejadorForm({ ...planejadorForm, tipoTurismo: e.target.value })}
              >
                <option value="aventura">Aventura</option>
                <option value="família">Família</option>
                <option value="natureza">Natureza</option>
              </select>
              <button type="submit" className="btn-destaque">Gerar roteiro automático</button>
            </form>

            {mensagemPlanejador && <p className="mensagem">{mensagemPlanejador}</p>}

            {roteiroGerado && (
              <div className="roteiro-box">
                <h4>{roteiroGerado.resumo}</h4>
                {roteiroGerado.hospedagemSugerida && (
                  <p>
                    <strong>Hospedagem sugerida:</strong> {roteiroGerado.hospedagemSugerida.nome} — {roteiroGerado.hospedagemSugerida.cidade}
                  </p>
                )}

                <div className="grid-cards">
                  {roteiroGerado.roteiro.map((dia) => (
                    <article className="card" key={dia.dia}>
                      <div className="card-body">
                        <h4>Dia {dia.dia}</h4>
                        <p><strong>Manhã:</strong> {dia.manha}</p>
                        <p><strong>Tarde:</strong> {dia.tarde}</p>
                        <p><strong>Noite:</strong> {dia.noite}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <ul className="meta-list">
                  {roteiroGerado.dicas?.map((dica, idx) => (
                    <li key={idx}>{dica}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {secaoAtiva === 'recomendacoes' && (
          <>
            <section className="secao formulario-secao">
              <div className="secao-titulo"><h3>Clima do Destino</h3></div>
              <div className="formulario">
                <input value={climaCidade} onChange={(e) => setClimaCidade(e.target.value)} placeholder="Cidade" />
                <button className="btn-destaque" type="button" onClick={carregarClima}>Consultar clima</button>
              </div>
              {clima && (
                <div className="clima-box">
                  <p><strong>{clima.cidade}</strong></p>
                  <p>🌡️ Temperatura: {clima.temperatura}°C</p>
                  <p>🌧️ Chance de chuva: {clima.chanceChuva}%</p>
                  <p>📅 Melhor dia: {clima.melhorDia}</p>
                </div>
              )}
            </section>

            <section className="secao">
              <div className="secao-titulo"><h3>Lugares parecidos que você pode gostar</h3></div>
              <div className="grid-cards">
                {recomendacoes.map((d) => (
                  <article className="card" key={`rec-${d.id}`}>
                    <img src={d.imagem_url} alt={d.nome} />
                    <div className="card-body">
                      <h4>{d.nome}</h4>
                      <span>{d.localizacao}</span>
                      <p>{d.descricao}</p>
                      <div className="acoes-card">
                        <button className="btn-mini" onClick={() => abrirRota(d)}>📍 Como chegar</button>
                        <button className="btn-mini" onClick={() => favoritarDestino(d.id)}>❤️ Salvar</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="secao">
              <div className="secao-titulo"><h3>🏆 Top 10 destinos de Mato Grosso</h3></div>
              <div className="ranking-box">
                {ranking.map((item, idx) => (
                  <div className="ranking-item" key={`rank-${item.id}`}>
                    <strong>#{idx + 1} {item.nome}</strong>
                    <span>{item.cidade_base} • Popularidade {item.popularidade}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="secao">
              <div className="secao-titulo"><h3>🌄 Destinos secretos de Mato Grosso</h3></div>
              <div className="grid-cards">
                {destinosSecretos.map((d) => (
                  <article className="card" key={`sec-${d.id}`}>
                    <img src={d.imagem_url} alt={d.nome} />
                    <div className="card-body">
                      <h4>{d.nome}</h4>
                      <span>{d.localizacao} • Nível {d.nivel_aventura}</span>
                      <p>{d.descricao}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="secao formulario-secao">
              <div className="secao-titulo"><h3>🔎 Busca por cidade</h3></div>
              <div className="formulario">
                <input value={buscaCidade} onChange={(e) => setBuscaCidade(e.target.value)} placeholder="Ex: Cuiabá, Nobres..." />
                <button type="button" className="btn-destaque" onClick={buscarPorCidade}>Buscar</button>
              </div>
              {resultadoCidade && (
                <div className="resultado-cidade">
                  <p><strong>Resultados em {resultadoCidade.cidade}</strong></p>
                  <p>Destinos: {resultadoCidade.destinos.length} • Cachoeiras: {resultadoCidade.cachoeiras.length} • Hospedagens: {resultadoCidade.hospedagens.length}</p>
                </div>
              )}
            </section>
          </>
        )}

        {secaoAtiva === 'lugares' && (
          <>
            <section className="secao">
              <div className="secao-titulo"><h3>Pontos Turísticos</h3></div>
              <form className="formulario filtros-box" onSubmit={aplicarFiltros}>
                <select value={filtroDestinos.categoria} onChange={(e) => setFiltroDestinos({ ...filtroDestinos, categoria: e.target.value })}>
                  <option value="">Categoria</option>
                  <option value="natureza">Natureza</option>
                  <option value="secreto">Secreto</option>
                </select>
                <input placeholder="Cidade base" value={filtroDestinos.cidade} onChange={(e) => setFiltroDestinos({ ...filtroDestinos, cidade: e.target.value })} />
                <select value={filtroDestinos.nivel} onChange={(e) => setFiltroDestinos({ ...filtroDestinos, nivel: e.target.value })}>
                  <option value="">Nível</option>
                  <option value="fácil">Fácil</option>
                  <option value="moderado">Moderado</option>
                  <option value="difícil">Difícil</option>
                </select>
                <button className="btn-destaque" type="submit">Aplicar filtros</button>
              </form>

              {loading ? <p>Carregando destinos...</p> : (
                <div className="grid-cards">
                  {destinosFiltrados.map((destino) => (
                    <article className="card" key={destino.id}>
                      <img src={destino.imagem_url} alt={destino.nome} />
                      <div className="card-body">
                        <h4>{destino.nome}</h4>
                        <span>{destino.localizacao}</span>
                        <p>{destino.descricao}</p>
                        <ul className="meta-list">
                          <li>⭐ Avaliação média: 4.8</li>
                          <li>🥾 Nível: {destino.nivel_aventura || 'Moderado'}</li>
                          <li>📅 Melhor época: Maio a Setembro</li>
                          <li>🔥 Popularidade: {destino.popularidade || 70}</li>
                        </ul>
                        <div className="acoes-card">
                          <button className="btn-mini" onClick={() => abrirRota(destino)}>📍 Como chegar</button>
                          <button className="btn-mini" onClick={() => favoritarDestino(destino.id)}>❤️ Salvar</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="secao">
              <div className="secao-titulo"><h3>Top 10 Cachoeiras</h3></div>
              {loading ? <p>Carregando cachoeiras...</p> : (
                <div className="grid-cards">
                  {cachoeiras.map((cachoeira, index) => (
                    <article className="card" key={cachoeira.id}>
                      <img src={cachoeira.imagem_url} alt={cachoeira.nome} />
                      <div className="card-body">
                        <h4>#{index + 1} {cachoeira.nome}</h4>
                        <span>{cachoeira.municipio} • {cachoeira.altura_metros}m • Nível {cachoeira.nivel}</span>
                        <p>{cachoeira.descricao}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {secaoAtiva === 'hospedagens' && (
          <section className="secao formulario-secao">
            <div className="secao-titulo"><h3>Área de Hospedagens</h3></div>
            <p className="texto-secao">Cadastro de hotel, pousada e camping (MVP visual da fase marketplace).</p>
            <div className="grid-cards">
              <article className="card"><div className="card-body"><h4>Hotel Pantanal Premium</h4><p>Diária: R$ 420 • Contato: (65) 9999-1111</p></div></article>
              <article className="card"><div className="card-body"><h4>Pousada Chapada Verde</h4><p>Diária: R$ 280 • Contato: (65) 9999-2222</p></div></article>
              <article className="card"><div className="card-body"><h4>Camping Nobres Nature</h4><p>Diária: R$ 95 • Contato: (65) 9999-3333</p></div></article>
            </div>
          </section>
        )}

        {secaoAtiva === 'empresas' && (
          <section className="secao formulario-secao">
            <div className="secao-titulo"><h3>Cadastro de Empresas e Guias</h3></div>
            <form className="formulario" onSubmit={salvarEmpresa}>
              <input placeholder="Nome Fantasia" value={empresaForm.nome_fantasia} onChange={(e) => setEmpresaForm({ ...empresaForm, nome_fantasia: e.target.value })} />
              <input placeholder="CNPJ" value={empresaForm.cnpj} onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })} />
              <input type="email" placeholder="Email" value={empresaForm.email} onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} />
              <input placeholder="Telefone / WhatsApp" value={empresaForm.telefone} onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })} />
              <input placeholder="Endereço" value={empresaForm.endereco} onChange={(e) => setEmpresaForm({ ...empresaForm, endereco: e.target.value })} />
              <textarea placeholder="Descrição dos serviços" value={empresaForm.descricao} onChange={(e) => setEmpresaForm({ ...empresaForm, descricao: e.target.value })} />
              <button type="submit" className="btn-destaque">Salvar Cadastro</button>
            </form>
            {mensagemEmpresa && <p className="mensagem">{mensagemEmpresa}</p>}
            {empresa && <p className="empresa-info">Empresa atual: <strong>{empresa.nome_fantasia}</strong></p>}
          </section>
        )}

        {secaoAtiva === 'avaliacoes' && (
          <section className="secao formulario-secao">
            <div className="secao-titulo"><h3>Sistema de Avaliações</h3></div>
            <div className="review-box">
              <p>⭐⭐⭐⭐⭐ “Lugar incrível, água muito limpa!”</p>
              <p>⭐⭐⭐⭐ “Guia muito atencioso, passeio excelente.”</p>
              <p>⭐⭐⭐⭐⭐ “Experiência inesquecível no Pantanal.”</p>
            </div>
          </section>
        )}

        {secaoAtiva === 'agenda' && (
          <section className="secao formulario-secao">
            <div className="secao-titulo"><h3>Agenda de Passeios</h3></div>
            <div className="grid-cards">
              <article className="card"><div className="card-body"><h4>Passeio Pantanal Sunrise</h4><p>Data: 22/04 • Vagas: 12 • Preço: R$ 220</p><button className="btn-destaque">Reservar</button></div></article>
              <article className="card"><div className="card-body"><h4>Trilha Chapada Premium</h4><p>Data: 25/04 • Vagas: 18 • Preço: R$ 180</p><button className="btn-destaque">Reservar</button></div></article>
            </div>
          </section>
        )}

        {secaoAtiva === 'galeria' && (
          <section className="secao">
            <div className="secao-titulo"><h3>Galeria do Mato Grosso</h3></div>
            <div className="grid-galeria">
              {[
                'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
                'https://images.unsplash.com/photo-1472396961693-142e6e269027',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
                'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
                'https://images.unsplash.com/photo-1501854140801-50d01698950b'
              ].map((img, idx) => (
                <div className="foto-galeria" key={idx}>
                  <img src={img} alt={`Galeria MT ${idx + 1}`} />
                </div>
              ))}
            </div>
          </section>
        )}

        {secaoAtiva === 'sobre' && (
          <section className="secao formulario-secao">
            <div className="secao-titulo"><h3>Sobre Mato Grosso</h3></div>
            <p className="texto-secao">
              Mato Grosso reúne cultura vibrante, biomas como Pantanal, Cerrado e Amazônia, rica história e
              enorme potencial turístico. A proposta desta plataforma é conectar viajantes, guias, hospedagens
              e empresas em um ecossistema digital moderno.
            </p>
          </section>
        )}

        {secaoAtiva === 'mapa' && (
          <section className="secao">
            <div className="secao-titulo"><h3>Mapa Interativo</h3></div>
            <div className="chips">
              <span>Cachoeiras</span>
              <span>Parques</span>
              <span>Hotéis</span>
              <span>Restaurantes</span>
              <span>Trilhas</span>
            </div>
            <div className="mapa-wrapper">
              <MapContainer center={[-14.5, -55.5]} zoom={6} scrollWheelZoom className="mapa">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pontosMapa.map((ponto) => (
                  <Marker key={ponto.id} position={ponto.coords} icon={markerIcon}>
                    <Popup>
                      <div className="popup-head">
                        <span className="map-pulse-dot" />
                        <strong>{ponto.nome}</strong>
                      </div>
                      <br />
                      {ponto.descricao}
                      <br />
                      <img src={ponto.foto} alt={ponto.nome} style={{ width: '180px', marginTop: '8px', borderRadius: '8px' }} />
                      <br />
                      <button style={{ marginTop: '8px' }}>Ver mais</button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        )}

        {secaoAtiva === 'clientes' && (
          <section className="secao formulario-secao">
            <div className="secao-titulo"><h3>Área do Cliente</h3></div>

            <form className="formulario" onSubmit={fazerLogin}>
              <input
                type="email"
                placeholder="Email do cliente"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Senha"
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
              />
              <button type="submit" className="btn-destaque">Entrar</button>
            </form>
            {mensagemLogin && <p className="mensagem">{mensagemLogin}</p>}
            {usuarioLogado && (
              <p className="empresa-info">Cliente logado: <strong>{usuarioLogado.nome}</strong> ({usuarioLogado.email})</p>
            )}

            <div className="secao-titulo" style={{ marginTop: '16px' }}><h3>Cadastro de Clientes</h3></div>
            <form className="formulario" onSubmit={cadastrarCliente}>
              <input placeholder="Nome" value={clienteForm.nome} onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })} />
              <input type="email" placeholder="Email" value={clienteForm.email} onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })} />
              <input placeholder="Telefone" value={clienteForm.telefone} onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })} />
              <input placeholder="Cidade" value={clienteForm.cidade} onChange={(e) => setClienteForm({ ...clienteForm, cidade: e.target.value })} />
              <input placeholder="Interesse turístico" value={clienteForm.interesse} onChange={(e) => setClienteForm({ ...clienteForm, interesse: e.target.value })} />
              <button type="submit" className="btn-destaque">Cadastrar Cliente</button>
            </form>
            {mensagemCliente && <p className="mensagem">{mensagemCliente}</p>}
          </section>
        )}
      </main>

      <a
        className="whatsapp-float"
        href="https://wa.me/5565999990000"
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>

      <footer className="rodape">
        <p>MT Turismo Pro © 2026 • Plataforma profissional de turismo e marketplace regional</p>
      </footer>
    </div>
  );
}

export default App;
