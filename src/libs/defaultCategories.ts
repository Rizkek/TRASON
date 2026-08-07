/**
 * Default Finance Categories & Comprehensive Icon-to-Name Auto-Suggestions
 * Icons must match keys in CategoryIcon.tsx's iconMap (Phosphor icon names or aliases).
 */

export type DefaultCategory = {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  is_default: boolean;
  sort_order: number;
};

export const DEFAULT_FINANCE_CATEGORIES: DefaultCategory[] = [
  // ── EXPENSE ──────────────────────────────────────────────────────────
  { name: 'Makanan & Minuman', type: 'expense', icon: 'ForkKnife',   is_default: true, sort_order: 1 },
  { name: 'Transportasi',      type: 'expense', icon: 'Car',          is_default: true, sort_order: 2 },
  { name: 'Rumah & Utilitas',  type: 'expense', icon: 'Home',         is_default: true, sort_order: 3 },
  { name: 'Belanja',           type: 'expense', icon: 'ShoppingCart', is_default: true, sort_order: 4 },
  { name: 'Kesehatan',         type: 'expense', icon: 'FirstAidKit',  is_default: true, sort_order: 5 },
  { name: 'Hiburan',           type: 'expense', icon: 'FilmStrip',    is_default: true, sort_order: 6 },
  { name: 'Pendidikan',        type: 'expense', icon: 'GraduationCap',is_default: true, sort_order: 7 },
  { name: 'Olahraga',          type: 'expense', icon: 'Barbell',      is_default: true, sort_order: 8 },
  { name: 'Teknologi',         type: 'expense', icon: 'Laptop',       is_default: true, sort_order: 9 },
  { name: 'Tabungan / Investasi', type: 'expense', icon: 'PiggyBank', is_default: true, sort_order: 10 },
  { name: 'Lain-lain',         type: 'expense', icon: 'Package',      is_default: true, sort_order: 11 },

  // ── INCOME ───────────────────────────────────────────────────────────
  { name: 'Gaji',              type: 'income',  icon: 'Coins',        is_default: true, sort_order: 1 },
  { name: 'Freelance',         type: 'income',  icon: 'Briefcase',    is_default: true, sort_order: 2 },
  { name: 'Investasi',         type: 'income',  icon: 'TrendUp',      is_default: true, sort_order: 3 },
  { name: 'Bonus',             type: 'income',  icon: 'Gift',         is_default: true, sort_order: 4 },
  { name: 'Penjualan',         type: 'income',  icon: 'Storefront',   is_default: true, sort_order: 5 },
  { name: 'Lain-lain',         type: 'income',  icon: 'Wallet',       is_default: true, sort_order: 6 },
];

export const ICON_NAME_SUGGESTIONS: Record<string, { en: string; id: string; ja: string; es: string }> = {
  // ── Finance & Business ──
  Wallet:        { en: 'Wallet / Pocket',    id: 'Dompet / Tunai',       ja: '財布・現金',       es: 'Billetera' },
  CreditCard:    { en: 'Credit Card',        id: 'Kartu Kredit / Debit', ja: 'クレジットカード', es: 'Tarjeta' },
  Money:         { en: 'Cash / Money',       id: 'Uang Tunai',           ja: '現金',             es: 'Efectivo' },
  Bank:          { en: 'Bank Account',       id: 'Tabungan Bank',        ja: '銀行口座',         es: 'Banco' },
  PiggyBank:     { en: 'Savings / Invest',   id: 'Tabungan / Celengan',  ja: '貯蓄 / 貯金',      es: 'Ahorros' },
  Coins:         { en: 'Salary / Income',    id: 'Gaji / Pemasukan',     ja: '給与',             es: 'Salario' },
  TrendUp:       { en: 'Investment Profit',  id: 'Profit Investasi',     ja: '投資利益',         es: 'Ganancia' },
  TrendDown:     { en: 'Loss / Cut Loss',    id: 'Kerugian / Biaya',     ja: '損失',             es: 'Pérdida' },
  ChartBar:      { en: 'Stocks / Trading',   id: 'Saham & Trading',      ja: '株式',             es: 'Acciones' },
  ChartLineUp:   { en: 'Capital Growth',     id: 'Pertumbuhan Aset',     ja: '資産成長',         es: 'Crecimiento' },
  Receipt:       { en: 'Bills / Invoices',   id: 'Tagihan & Nota',       ja: '請求書',           es: 'Facturas' },
  Vault:         { en: 'Emergency Fund',     id: 'Dana Darurat',         ja: '緊急資金',         es: 'Fondo Emergencia' },
  Briefcase:     { en: 'Freelance / Work',   id: 'Freelance / Proyek',   ja: 'フリーランス',     es: 'Trabajo' },
  Calculator:    { en: 'Tax / Accounting',   id: 'Pajak & Akuntansi',    ja: '税金',             es: 'Impuestos' },
  CurrencyDollar:{ en: 'Forex / Dollar',     id: 'Valuta Asing (USD)',   ja: 'ドル為替',         es: 'Dólares' },
  CurrencyEur:   { en: 'Forex / Euro',       id: 'Valuta Asing (EUR)',   ja: 'ユーロ為替',       es: 'Euros' },
  CurrencyGbp:   { en: 'Forex / Pound',      id: 'Valuta Asing (GBP)',   ja: 'ポンド為替',       es: 'Libras' },
  CurrencyInr:   { en: 'Currency / INR',     id: 'Valuta Asing (INR)',   ja: 'ルピー為替',       es: 'Rupias' },
  CurrencyJpy:   { en: 'Forex / Yen',        id: 'Valuta Asing (JPY)',   ja: '円為替',           es: 'Yenes' },

  // ── Shopping ──
  ShoppingCart:  { en: 'Shopping',           id: 'Belanja',              ja: 'ショッピング',     es: 'Compras' },
  Bag:           { en: 'Fashion & Clothing', id: 'Pakaian & Fashion',    ja: 'ファッション',     es: 'Moda' },
  Tote:          { en: 'Groceries / Market', id: 'Belanja Pasar',        ja: '食料品買い出し',   es: 'Mercado' },
  Storefront:    { en: 'Sales / Store',      id: 'Penjualan Toko',       ja: '店舗売上',         es: 'Ventas' },
  Basket:        { en: 'Supermarket',        id: 'Supermarket & Harian', ja: '日用品',           es: 'Supermercado' },
  Gift:          { en: 'Bonus / Gift',       id: 'Hadiah / Kado',        ja: 'ギフト / 贈り物',  es: 'Regalos' },
  Tag:           { en: 'Discounts / Promo',  id: 'Promo & Diskon',       ja: 'セール',           es: 'Ofertas' },
  Barcode:       { en: 'Subscription / Code',id: 'Langganan & Member',   ja: '定期購入',         es: 'Suscripción' },

  // ── Food & Drink ──
  Coffee:        { en: 'Coffee & Cafe',      id: 'Kopi & Nongkrong',     ja: 'カフェ・珈琲',     es: 'Café' },
  ForkKnife:     { en: 'Food & Dining',      id: 'Makanan & Resto',      ja: '外食・食事',       es: 'Comida' },
  Hamburger:     { en: 'Fast Food',          id: 'Makanan Cepat Saji',   ja: 'ファストフード',   es: 'Comida Rápida' },
  Pizza:         { en: 'Snacks & Pizza',     id: 'Camilan & Jajan',      ja: '軽食・ピザ',       es: 'Snacks' },
  Martini:       { en: 'Drinks & Bar',       id: 'Minuman & Bar',        ja: 'お酒・バー',       es: 'Bebidas' },
  BeerBottle:    { en: 'Beverages',          id: 'Minuman Kemasan',      ja: 'ドリンク',         es: 'Bebidas' },
  Wine:          { en: 'Fine Dining',        id: 'Makan Mewah / Wine',   ja: 'ディナー',         es: 'Cenas' },
  BowlFood:      { en: 'Daily Meals',        id: 'Makan Sehari-hari',    ja: '日々の食事',       es: 'Comida Diaria' },
  Cake:          { en: 'Dessert & Bakery',   id: 'Kue & Bakery',         ja: 'スイーツ',         es: 'Postres' },
  Carrot:        { en: 'Healthy / Organic',  id: 'Sayur & Organik',      ja: 'オーガニック',     es: 'Verduras' },

  // ── Transport & Travel ──
  Car:           { en: 'Car & Fuel',         id: 'Mobil & Bensin',       ja: '車・ガソリン',     es: 'Auto y Combustible' },
  Bus:           { en: 'Public Bus',         id: 'Bus & Trans',          ja: '路線バス',         es: 'Autobús' },
  Train:         { en: 'Train / MRT',        id: 'Kereta / KRL / MRT',   ja: '電車・地下鉄',     es: 'Tren' },
  Airplane:      { en: 'Flight & Travel',    id: 'Tiket Pesawat / Liburan', ja: '飛行機・旅行',   es: 'Vuelos' },
  Bicycle:       { en: 'Bicycle / Commute',  id: 'Sepeda & Gowes',       ja: '自転車',           es: 'Bicicleta' },
  Boat:          { en: 'Ferry / Cruise',     id: 'Kapal Laut / Wisata',  ja: '船・フェリー',     es: 'Barco' },
  Taxi:          { en: 'Taxi / Ride Hailing',id: 'Gojek / Grab / Taksi', ja: 'タクシー',         es: 'Taxi' },
  Moped:         { en: 'Motorcycle & Service',id: 'Motor & Servis',      ja: 'バイク',           es: 'Moto' },
  Scooter:       { en: 'Scooter / Micro-mob',id: 'Skuter / Sewa Motor',  ja: 'スクーター',       es: 'Scooter' },
  MapPin:        { en: 'Destination / Tour', id: 'Wisata & Lokasi',      ja: '観光地',           es: 'Destinos' },
  MapTrifold:    { en: 'Trip & Vacation',    id: 'Rencana Perjalanan',   ja: '旅行計画',         es: 'Viaje' },
  Compass:       { en: 'Adventure / Outdoor',id: 'Petualangan & Outdoor',ja: 'アウトドア',       es: 'Aventura' },
  Globe:         { en: 'International Trip', id: 'Wisata Mancanegara',   ja: '海外旅行',         es: 'Viaje Internacional' },
  Suitcase:      { en: 'Hotel & Lodging',    id: 'Hotel & Akomodasi',    ja: 'ホテル・宿泊',     es: 'Alojamiento' },

  // ── Home & Utilities ──
  Home:          { en: 'Home & Utilities',   id: 'Rumah & Utilitas',     ja: '住居・光熱費',     es: 'Hogar & Servicios' },
  House:         { en: 'House Rent / Mortg', id: 'Sewa Rumah / Kost',    ja: '家賃・住宅ローン', es: 'Alquiler' },
  Drop:          { en: 'Water Bill (PDAM)',  id: 'Tagihan Air (PDAM)',   ja: '水道代',           es: 'Agua' },
  Flame:         { en: 'Gas & Kitchen',      id: 'Gas Elpiji & Dapur',   ja: 'ガス代',           es: 'Gas' },
  Zap:           { en: 'Electricity (PLN)',  id: 'Listrik & Token PLN',  ja: '電気代',           es: 'Electricidad' },
  Lightning:     { en: 'Electricity',        id: 'Listrik PLN',          ja: '電気代',           es: 'Electricidad' },
  Lightbulb:     { en: 'Home Maintenance',   id: 'Perawatan Rumah',      ja: '修繕費',           es: 'Mantenimiento' },
  Plug:          { en: 'Appliances / Power', id: 'Alat Elektronik Rumah',ja: '家電',             es: 'Electrodomésticos' },
  Key:           { en: 'Property / Assets',  id: 'Properti & Sewa',      ja: '不動産',           es: 'Propiedad' },
  Lock:          { en: 'Security / Insurance',id: 'Keamanan & Asuransi', ja: 'セキュリティ',     es: 'Seguridad' },
  Umbrella:      { en: 'Insurance',          id: 'Asuransi & Proteksi',  ja: '保険',             es: 'Seguros' },
  Toilet:        { en: 'Sanitary / Cleaning',id: 'Kebersihan & Sabun',   ja: '日用消耗品',       es: 'Limpieza' },
  Shower:        { en: 'Personal Care / Bath',id: 'Perlengkapan Mandi',  ja: 'バス用品',         es: 'Cuidado Personal' },
  Bathtub:       { en: 'Spa & Relaxation',   id: 'Relaksasi Rumah',      ja: 'リラクゼーション', es: 'Spa' },
  Bed:           { en: 'Furniture / Bedding',id: 'Perabot & Kamar',      ja: '家具・寝具',       es: 'Muebles' },

  // ── Health & Wellness ──
  Activity:      { en: 'Health & Checkup',   id: 'Kesehatan & MCU',      ja: '健康診断',         es: 'Salud' },
  Heartbeat:     { en: 'Doctor & Hospital',  id: 'Dokter & RS',          ja: '通院・治療',       es: 'Médico' },
  Heart:         { en: 'Wellness & Therapy', id: 'Kesejahteraan Diri',   ja: 'ウェルネス',       es: 'Bienestar' },
  FirstAidKit:   { en: 'Medicines & FirstAid',id: 'Obat & P3K',          ja: '医療費・薬品',     es: 'Medicamentos' },
  Pill:          { en: 'Pharmacy / Vitamins',id: 'Apotek & Vitamin',     ja: '薬局・サプリ',     es: 'Farmacia' },
  Barbell:       { en: 'Gym & Fitness',      id: 'Gym & Olahraga',       ja: 'ジム・フィットネス', es: 'Gimnasio' },
  Brain:         { en: 'Mental Health',      id: 'Kesehatan Mental',     ja: 'メンタルヘルス',   es: 'Salud Mental' },
  Person:        { en: 'Personal Grooming',  id: 'Potong Rambut & Salon',ja: '理美容',           es: 'Peluquería' },

  // ── Tech & Electronics ──
  Monitor:       { en: 'Gadgets & Setup',    id: 'Monitor & Setup Meja', ja: 'PCモニター',       es: 'Monitores' },
  Smartphone:    { en: 'Phone & Mobile Data',id: 'Pulsa & Paket Data',   ja: '通信費・スマホ',   es: 'Celular' },
  DeviceMobile:  { en: 'Mobile Credit',      id: 'Pulsa Handphone',      ja: '携帯料金',         es: 'Móvil' },
  Laptop:        { en: 'Laptop & Software',  id: 'Komputer & Software',  ja: 'パソコン・IT',     es: 'Software' },
  Desktop:       { en: 'Workstation / PC',   id: 'PC Kerja / Hardware',  ja: 'PC本体',           es: 'Hardware' },
  Television:    { en: 'TV & Streaming',     id: 'Langganan TV / Netflix',ja: '配信サービス',    es: 'Streaming' },
  Headphones:    { en: 'Audio & Music Sub',  id: 'Audio & Spotify',      ja: 'オーディオ',       es: 'Audio' },
  SpeakerHigh:   { en: 'Sound System',       id: 'Sound & Hiburan',      ja: 'スピーカー',       es: 'Sonido' },
  GameController:{ en: 'Gaming & In-game',   id: 'Game & Top Up Game',   ja: 'ゲーム課金',       es: 'Videojuegos' },
  Mouse:         { en: 'Accessories',        id: 'Aksesoris Komputer',   ja: '周辺機器',         es: 'Accesorios' },
  Keyboard:      { en: 'Office Equipment',   id: 'Perlengkapan Kerja',   ja: 'オフィス機器',     es: 'Oficina' },
  Camera:        { en: 'Photography',        id: 'Kamera & Fotografi',   ja: 'カメラ',           es: 'Fotografía' },
  VideoCamera:   { en: 'Video / Content',    id: 'Kreator & Video',      ja: '動画制作',         es: 'Video' },

  // ── Lifestyle & Entertainment ──
  MusicNotes:    { en: 'Concert & Music',    id: 'Konser & Musik',       ja: 'ライブ・音楽',     es: 'Música' },
  FilmStrip:     { en: 'Cinema & Movies',    id: 'Bioskop & Film',       ja: '映画鑑賞',         es: 'Cine' },
  Book:          { en: 'Books & Reading',    id: 'Buku & Majalah',       ja: '本・書籍',         es: 'Libros' },
  GraduationCap: { en: 'Courses & Education',id: 'Kursus & Pendidikan',  ja: '教育・研修',       es: 'Educación' },
  Popcorn:       { en: 'Recreation & Fun',   id: 'Rekreasi & Hiburan',   ja: 'レジャー',         es: 'Entretenimiento' },
  Basketball:    { en: 'Basketball',         id: 'Sewa Lapangan Basket', ja: 'バスケ',           es: 'Básquet' },
  Football:      { en: 'Soccer / Futsal',    id: 'Sewa Lapangan Futsal', ja: 'サッカー・フットサル', es: 'Fútbol' },
  TennisBall:    { en: 'Tennis / Padel',     id: 'Tenis & Padel',        ja: 'テニス',           es: 'Tenis' },
  Volleyball:    { en: 'Volleyball',         id: 'Voli',                 ja: 'バレーボール',     es: 'Voleibol' },
  PianoKeys:     { en: 'Music Lessons',      id: 'Les Musik / Alat Musik',ja: '音楽教室',        es: 'Clases de Música' },
  Guitar:        { en: 'Hobby & Instrument', id: 'Hobi Musik',           ja: '楽器',             es: 'Instrumentos' },
  Palette:       { en: 'Art & Craft',        id: 'Seni & Kerajinan',     ja: 'アート・趣味',     es: 'Arte' },

  // ── Miscellaneous ──
  Package:       { en: 'Online Package / Post',id: 'Paket & Ongkir',     ja: '宅配便・送料',     es: 'Paquetería' },
  MoreHorizontal:{ en: 'Other Expense',      id: 'Lain-lain',            ja: 'その他',          es: 'Otros' },
  DotsThree:     { en: 'Other Expenses',     id: 'Biaya Lainnya',        ja: 'その他支出',      es: 'Otros Gastos' },
  HelpCircle:    { en: 'Uncategorized',      id: 'Belum Terkategori',    ja: '未分類',          es: 'Sin Categoría' },
  Question:      { en: 'Unknown',            id: 'Tak Terduga',          ja: '不明',             es: 'Desconocido' },
  Star:          { en: 'Special / Wishlist', id: 'Wishlist & Khusus',    ja: '欲しいもの',       es: 'Deseos' },
  Gear:          { en: 'Administration / Fee',id: 'Biaya Admin & Layanan', ja: '手数料',         es: 'Administración' },
  Bell:          { en: 'Reminders & Dues',   id: 'Iuran & Pengingat',    ja: '会費',             es: 'Cuotas' },
  Calendar:      { en: 'Monthly Routine',    id: 'Pengeluaran Bulanan',  ja: '月次支出',         es: 'Mensual' },
  Clock:         { en: 'Hourly / Overtime',  id: 'Lembur & Jasa',        ja: '時間外手当',       es: 'Horas Extras' },
  CheckCircle:   { en: 'Cleared / Verified', id: 'Sudah Lunas',          ja: '精算済',           es: 'Completado' },
  Warning:       { en: 'Penalty / Fine',     id: 'Denda & Peringatan',   ja: '反則金・追徴',     es: 'Multas' },
  Info:          { en: 'Information',        id: 'Informasi',            ja: '情報',             es: 'Información' },
  Target:        { en: 'Goal / Target',      id: 'Target Finansial',     ja: '目標貯蓄',         es: 'Objetivo' },
  Trophy:        { en: 'Reward & Prize',     id: 'Hadiah Lomba / Reward',ja: '賞金',             es: 'Premios' },
  Crown:         { en: 'VIP / Luxury',       id: 'Kemewahan / VIP',      ja: '特別支出',         es: 'Lujo' },
  Medal:         { en: 'Achievement',        id: 'Bonus Prestasi',       ja: '達成手当',         es: 'Logros' },
};
