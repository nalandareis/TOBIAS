export const CATEGORIES = [
  { id: 'restaurante', label: 'Restaurantes', singular: 'Restaurante' },
  { id: 'cafeteria', label: 'Cafeterias', singular: 'Cafeteria' },
  { id: 'hotel', label: 'Hotéis para cães', singular: 'Hotel para cães' },
  { id: 'parque', label: 'Parques', singular: 'Parque' },
]

export const DISTANCES = [1, 3, 5, 10]

// Endereços reais, informados pelo grupo. Só entram aqui dados confirmados:
// nada de nota, horário ou regra inventados para um estabelecimento de verdade.
// Pinos em avenidas longas são aproximados; a rota usa o nome e o endereço.
const REAL_PLACES = [
  { id: 'mittri', name: 'Mittri', category: 'restaurante', neighborhood: 'Atalaia', address: 'Av. Poe. Vinícius de Moraes, 1171 - Atalaia, Aracaju - SE', lat: -10.98795, lng: -37.05468 },
  { id: 'terra-tupi', name: 'Terra Tupi', category: 'restaurante', neighborhood: 'Atalaia', address: 'Av. Santos Dumont, 610 - Atalaia, Aracaju - SE', lat: -10.99295, lng: -37.05197 },
  { id: 'varanda-sergipana', name: 'Varanda Sergipana', category: 'restaurante', neighborhood: 'Atalaia', address: 'Av. Santos Dumont, 1400 - Atalaia, Aracaju - SE', lat: -10.978, lng: -37.04137 },
  { id: 'seo-inacio-bistro', name: 'Seo Inácio Bistrô', category: 'restaurante', neighborhood: 'Inácio Barbosa', address: 'R. Cecinha Vieira, 160 - Inácio Barbosa, Aracaju - SE', lat: -10.9528, lng: -37.06275 },
  { id: 'meu-quintal-foodpark', name: 'Meu Quintal Foodpark', category: 'restaurante', neighborhood: 'Farolândia', address: 'Av. Murilo Dantas, 55 - Farolândia, Aracaju - SE', lat: -10.97062, lng: -37.05438 },
  { id: 'sabor-bem', name: 'Sabor Bem', category: 'restaurante', neighborhood: 'Inácio Barbosa', address: 'Av. Pres. Tancredo Neves, 336 - Inácio Barbosa, Aracaju - SE', lat: -10.95637, lng: -37.05329 },
  { id: 'cacua-bistro-bar', name: 'Caçuá Bistrô Bar', category: 'restaurante', neighborhood: 'Luzia', address: 'R. Renato Santos Teixeira, 120 - Luzia, Aracaju - SE', lat: -10.93836, lng: -37.06804 },
  { id: 'amor-4-patas', name: 'Amor 4 Patas', category: 'hotel', neighborhood: 'Luzia', address: 'R. Min. Nelson Hungria, 461 - Luzia, Aracaju - SE, 49045-420', lat: -10.93424, lng: -37.06263 },
  { id: 'happy-pet', name: 'Happy Pet - Day Care e Hotel Pet', category: 'hotel', neighborhood: 'Atalaia', address: 'R. Niceu Dantas, 1146 - Atalaia, Aracaju - SE, 49037-470', lat: -10.99269, lng: -37.05249 },
  { id: 'recanto-pet-hotel', name: 'Recanto Pet Hotel', category: 'hotel', neighborhood: 'Aruana', address: 'Av. Pref. Heráclito Guimarães Rollemberg, 401 - Aruana, Aracaju - SE, 49000-645', lat: -11.0118, lng: -37.08329 },
  { id: 'hospedogs', name: 'HOSPEDOGS', category: 'hotel', neighborhood: 'Treze de Julho', address: 'R. Dr. Celso Oliva, 452 - 13 de Julho, Aracaju - SE, 49020-090', lat: -10.9281, lng: -37.0463 },
  { id: 'cao-mais-feliz', name: 'Cão Mais Feliz', category: 'hotel', neighborhood: 'Jabotiana', address: 'Av. Prof. José Freitas de Andrade, 3624 - Jabotiana, Aracaju - SE, 49095-790', lat: -10.92212, lng: -37.09323 },
  { id: 'parcao-pet-resort', name: 'Parcão Pet Resort', category: 'hotel', neighborhood: 'Coroa do Meio', address: 'R. Des. João Bosco de Andrade Lima, 574 - Coroa do Meio, Aracaju - SE, 49035-250', lat: -10.98158, lng: -37.04764 },
]

// Estabelecimentos fictícios, criados para a demonstração.
const EXAMPLE_PLACES = [
  {
    id: 'cafe-do-thor',
    name: 'Café do Thor',
    category: 'cafeteria',
    neighborhood: 'Jardins',
    address: 'Rua das Acácias, 120, Jardins',
    lat: -10.9438,
    lng: -37.0552,
    hours: { label: 'Todos os dias, 8h às 20h', open: '08:00', close: '20:00', closedDays: [] },
    structure: ['Área externa', 'Bebedouro para pets', 'Petiscos no balcão', 'Sombra'],
    species: ['cao', 'gato'],
    sizes: ['pequeno', 'medio', 'grande'],
    rules: 'Pets entram na coleira ou na caixa de transporte.',
    about: 'Cafeteria de bairro que recebe clientes de quatro patas desde o primeiro dia.',
    reviews: [
      { author: 'Joana P.', rating: 5, comment: 'Trouxeram água para o meu cachorro antes do meu café.', date: '2026-09-14' },
      { author: 'Caio M.', rating: 5, comment: 'Mesas externas com sombra, muito tranquilo.', date: '2026-08-30' },
      { author: 'Lívia R.', rating: 4, comment: 'Lota no sábado, mas vale a espera.', date: '2026-08-02' },
    ],
  },
  {
    id: 'grao-e-focinho',
    name: 'Grão & Focinho',
    category: 'cafeteria',
    neighborhood: 'Grageru',
    address: 'Rua Silvio Teixeira, 702, Grageru',
    lat: -10.9379,
    lng: -37.0618,
    hours: { label: 'Segunda a sábado, 7h às 19h', open: '07:00', close: '19:00', closedDays: [0] },
    structure: ['Aceita no salão', 'Bebedouro para pets', 'Tapete para pets'],
    species: ['cao', 'gato'],
    sizes: ['pequeno', 'medio'],
    rules: 'Pets no colo ou no tapete ao lado da mesa.',
    about: 'Cafés especiais num salão pequeno e silencioso, onde pets podem entrar.',
    reviews: [
      { author: 'Sofia D.', rating: 5, comment: 'Um dos poucos lugares com ar-condicionado que aceita pet.', date: '2026-10-01' },
      { author: 'Ivan G.', rating: 4, comment: 'Espaço pequeno, mas muito acolhedor.', date: '2026-08-08' },
    ],
  },
  {
    id: 'lambida-gelato',
    name: 'Lambida Gelato',
    category: 'cafeteria',
    neighborhood: 'Coroa do Meio',
    address: 'Rua da Maré, 55, Coroa do Meio',
    lat: -10.9631,
    lng: -37.0442,
    hours: { label: 'Terça a domingo, 13h às 21h', open: '13:00', close: '21:00', closedDays: [1] },
    structure: ['Área externa', 'Gelato pet', 'Bebedouro para pets'],
    species: ['cao'],
    sizes: ['pequeno', 'medio', 'grande'],
    rules: 'Atendimento para pets na área externa.',
    about: 'Gelateria artesanal com um sabor sem açúcar feito para cães.',
    reviews: [
      { author: 'Marcela N.', rating: 5, comment: 'O gelato pet é uma festa.', date: '2026-09-25' },
      { author: 'Hugo B.', rating: 4, comment: 'Bom para passar depois do passeio.', date: '2026-07-30' },
    ],
  },
  {
    id: 'bosque-das-patas',
    name: 'Bosque das Patas',
    category: 'parque',
    neighborhood: 'Jardins',
    address: 'Alameda das Mangueiras, s/n, Jardins',
    lat: -10.9466,
    lng: -37.0581,
    hours: { label: 'Todos os dias, 6h às 21h', open: '06:00', close: '21:00', closedDays: [] },
    structure: ['Espaço para correr', 'Bebedouro para pets', 'Sombra', 'Saquinhos de coleta'],
    species: ['cao'],
    sizes: ['pequeno', 'medio', 'grande'],
    rules: 'Recolha as fezes do seu pet. Vacinas em dia.',
    about: 'Área cercada com árvores altas, separada por porte para os cães brincarem.',
    reviews: [
      { author: 'Rafa O.', rating: 5, comment: 'O melhor lugar para gastar a energia do meu vira-lata.', date: '2026-10-05' },
      { author: 'Vera I.', rating: 5, comment: 'Sombra boa até no meio da tarde.', date: '2026-09-17' },
    ],
  },
  {
    id: 'praca-do-faro',
    name: 'Praça do Faro',
    category: 'parque',
    neighborhood: 'Farolândia',
    address: 'Praça do Faro, s/n, Farolândia',
    lat: -10.9712,
    lng: -37.0573,
    hours: { label: 'Aberta o dia todo', open: '00:00', close: '23:59', closedDays: [] },
    structure: ['Espaço para correr', 'Bancos', 'Saquinhos de coleta'],
    species: ['cao', 'gato'],
    sizes: ['pequeno', 'medio', 'grande'],
    rules: 'Pets na guia fora da área cercada.',
    about: 'Praça de bairro com gramado e uma pequena área cercada.',
    reviews: [
      { author: 'Nanda P.', rating: 4, comment: 'Simples e bem cuidada.', date: '2026-08-27' },
      { author: 'Edu W.', rating: 4, comment: 'Vai bastante gente no fim do dia.', date: '2026-07-04' },
    ],
  },
]

export const PLACES = [
  ...REAL_PLACES.map((place) => ({ ...place, reviews: [] })),
  ...EXAMPLE_PLACES.map((place) => ({ ...place, example: true })),
]
