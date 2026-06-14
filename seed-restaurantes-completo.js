const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAKUqiI1mnle8Y5zX5JUqD3tNrCO-MGkdg",
  authDomain: "flashfood-5956a-4f1e8.firebaseapp.com",
  projectId: "flashfood-5956a-4f1e8",
  storageBucket: "flashfood-5956a-4f1e8.appspot.com",
  messagingSenderId: "936689838357",
  appId: "1:936689838357:web:1c6e8a2b8f7e8f8f8f8f8f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const categorias = ['brasileira', 'pizzaria', 'hamburgueria', 'japonesa', 'italiana', 'tailandesa', 'coreana', 'mexicana', 'indiana', 'vegetariana'];

const nomes = {
  brasileira: ['Boteco do Zé', 'Churrascaria Premium', 'Casa da Comida Caipira', 'Empório Mineiro', 'Festim Gaúcho', 'Sabor Nordestino'],
  pizzaria: ['Pizzaria da Nonna', 'Forno a Lenha', 'Pizza Artesanal', 'Tradição Italiana', 'Massa Fresca', 'Tio Giuliano'],
  hamburgueria: ['Burger Gourmet', 'Smash House', 'The Burger Place', 'Meat Master', 'Artisan Burgers', 'Craft Burger'],
  japonesa: ['Sushi Premium', 'Sakura Restaurant', 'Tokyo Express', 'Tempura House', 'Omakase', 'Ramen Master'],
  italiana: ['Trattoria Italiana', 'Pasta della Nonna', 'Risotto Classico', 'Carbonara Autêntica', 'Lasanha Especial', 'Osso Buco'],
  tailandesa: ['Baan Thai', 'Sabor da Tailândia', 'Thai Cuisine', 'Orchid Thai', 'Bangkok Express', 'Pad Thai House'],
  coreana: ['Seoul Kitchen', 'Korean BBQ', 'Kimchi House', 'Seoul Express', 'Korean Soul Food', 'Bulgogi Master'],
  mexicana: ['Casa Mexicana', 'Taco Fiesta', 'El Compadre', 'Burrito King', 'Quesadilla Palace', 'Salsa Viva'],
  indiana: ['Curry House', 'Namaste India', 'Tandoori Especial', 'Mumbai Express', 'Spice Master', 'Tikka Palace'],
  vegetariana: ['Green Vida', 'Vegan Fresh', 'Vegetal House', 'Natural Mundo', 'Bio Kitchen', 'Organic Plate']
};

const imagens = {
  brasileira: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500',
  pizzaria: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500',
  hamburgueria: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
  japonesa: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500',
  italiana: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=500',
  tailandesa: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=500',
  coreana: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
  mexicana: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500',
  indiana: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500',
  vegetariana: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500'
};

function gerarRestaurantes() {
  const restaurantes = [];
  let contador = 1;

  for (const categoria of categorias) {
    const qtdPorCategoria = 5;
    for (let i = 1; i <= qtdPorCategoria; i++) {
      const nomeArray = nomes[categoria];
      const nome = nomeArray[Math.floor(Math.random() * nomeArray.length)] + ` #${i}`;

      restaurantes.push({
        email: `${categoria.toLowerCase()}${contador}@flashfood.com`,
        nomeResponsavel: `Responsável ${contador}`,
        sobrenomeResponsavel: `Restaurante`,
        cpfResponsavel: `${String(contador).padStart(11, '0')}`,
        telefoneResponsavel: `(11) 9${String(contador).padStart(8, '0')}`,
        nomeRestaurante: nome,
        cnpj: `${String(contador).padStart(14, '0')}`,
        categoria: categoria,
        descricao: `Autêntico restaurante de ${categoria}. Qualidade, sabor e tradição em cada prato.`,
        fotoRestauranteUrl: imagens[categoria],
        cep: '01310-100',
        estado: 'SP',
        cidade: 'São Paulo',
        bairro: ['Centro', 'Vila Mariana', 'Bela Vista', 'Liberdade', 'Pinheiros'][contador % 5],
        rua: `Rua ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`,
        numero: String((contador * 100) % 1000),
        complemento: ''
      });
      contador++;
    }
  }

  return restaurantes;
}

async function limparRestaurantes() {
  console.log("🗑️  Limpando restaurantes antigos...");
  try {
    const q = query(collection(db, "users"), where("tipo", "==", "restaurante"));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "users", docSnap.id));
    }
    console.log("✅ Limpeza concluída");
  } catch (error) {
    console.error("❌ Erro ao limpar restaurantes:", error);
  }
}

async function criarRestaurantes(restaurantes) {
  console.log("\n🏪 Criando novos restaurantes...\n");

  for (const restData of restaurantes) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        restData.email,
        "12345678"
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        userId: uid,
        nomeResponsavel: restData.nomeResponsavel,
        sobrenomeResponsavel: restData.sobrenomeResponsavel,
        cpfResponsavel: restData.cpfResponsavel,
        emailResponsavel: restData.email,
        telefoneResponsavel: restData.telefoneResponsavel,
        nomeRestaurante: restData.nomeRestaurante,
        cnpj: restData.cnpj,
        categoria: restData.categoria,
        descricao: restData.descricao,
        fotoRestauranteUrl: restData.fotoRestauranteUrl,
        cep: restData.cep,
        estado: restData.estado,
        cidade: restData.cidade,
        bairro: restData.bairro,
        rua: restData.rua,
        numero: restData.numero,
        complemento: restData.complemento,
        tipo: "restaurante",
        dataCriacao: new Date()
      });

      console.log(`✓ ${restData.nomeRestaurante}`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${restData.nomeRestaurante}:`, error.message);
    }
  }

  console.log("\n✅ Criação de restaurantes concluída!");
}

async function main() {
  console.log("🚀 Iniciando seed de 50 restaurantes\n");

  try {
    await limparRestaurantes();
    const restaurantes = gerarRestaurantes();
    console.log(`Total de restaurantes a criar: ${restaurantes.length}\n`);
    await criarRestaurantes(restaurantes);
    console.log("\n🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }

  process.exit(0);
}

main();
