const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, deleteUser } = require('firebase/auth');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc, setDoc } = require('firebase/firestore');

// Configuração Firebase
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

const restaurantes = [
  // Brasileira
  {
    email: "brasil1@flashfood.com",
    nomeResponsavel: "Carlos Silva",
    sobrenomeResponsavel: "Santos",
    cpfResponsavel: "12345678901",
    telefoneResponsavel: "(11) 98765-4321",
    nomeRestaurante: "Churrascaria do Brasil",
    cnpj: "12345678000190",
    categoria: "brasileira",
    descricao: "Tradicional churrascaria com carnes selecionadas e rodízio",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Centro",
    rua: "Avenida Paulista",
    numero: "1000",
    complemento: "Andar 5"
  },
  {
    email: "brasil2@flashfood.com",
    nomeResponsavel: "Maria Oliveira",
    sobrenomeResponsavel: "Costa",
    cpfResponsavel: "12345678902",
    telefoneResponsavel: "(11) 98765-4322",
    nomeRestaurante: "Boteco Carioca",
    cnpj: "12345678000191",
    categoria: "brasileira",
    descricao: "Comida caseira e autêntica do Rio de Janeiro",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Vila Mariana",
    rua: "Rua Augusta",
    numero: "500",
    complemento: ""
  },
  // Pizzaria
  {
    email: "pizza1@flashfood.com",
    nomeResponsavel: "Giuseppe Rossi",
    sobrenomeResponsavel: "Italia",
    cpfResponsavel: "12345678903",
    telefoneResponsavel: "(11) 98765-4323",
    nomeRestaurante: "Pizzaria Napolitana",
    cnpj: "12345678000192",
    categoria: "pizzaria",
    descricao: "Pizzas autênticas de forno a lenha com receitas italianas",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Bela Vista",
    rua: "Rua Bela Vista",
    numero: "123",
    complemento: ""
  },
  {
    email: "pizza2@flashfood.com",
    nomeResponsavel: "Antonio Ferrari",
    sobrenomeResponsavel: "Milano",
    cpfResponsavel: "12345678904",
    telefoneResponsavel: "(11) 98765-4324",
    nomeRestaurante: "Bella Pizzeria",
    cnpj: "12345678000193",
    categoria: "pizzaria",
    descricao: "Pizzas artesanais com ingredientes premium",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Liberdade",
    rua: "Rua Liberdade",
    numero: "456",
    complemento: "Sala 2"
  },
  // Hamburgueria
  {
    email: "burger1@flashfood.com",
    nomeResponsavel: "João Burguer",
    sobrenomeResponsavel: "Master",
    cpfResponsavel: "12345678905",
    telefoneResponsavel: "(11) 98765-4325",
    nomeRestaurante: "Burger Master",
    cnpj: "12345678000194",
    categoria: "hamburgueria",
    descricao: "Hambúrgueres artesanais com pão caseiro e ingredientes frescos",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Pinheiros",
    rua: "Rua Pinheiros",
    numero: "789",
    complemento: ""
  },
  {
    email: "burger2@flashfood.com",
    nomeResponsavel: "Pedro Smash",
    sobrenomeResponsavel: "Burger",
    cpfResponsavel: "12345678906",
    telefoneResponsavel: "(11) 98765-4326",
    nomeRestaurante: "Smash Burger House",
    cnpj: "12345678000195",
    categoria: "hamburgueria",
    descricao: "Smash burgers preparados na hora com carnes selecionadas",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Consolação",
    rua: "Rua Consolação",
    numero: "321",
    complemento: ""
  },
  // Japonesa
  {
    email: "japonesa1@flashfood.com",
    nomeResponsavel: "Yuki Tanaka",
    sobrenomeResponsavel: "Sushi",
    cpfResponsavel: "12345678907",
    telefoneResponsavel: "(11) 98765-4327",
    nomeRestaurante: "Sushi House",
    cnpj: "12345678000196",
    categoria: "japonesa",
    descricao: "Autênticos sushis e sashimis preparados por chefs especializados",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Higienópolis",
    rua: "Rua Higienópolis",
    numero: "654",
    complemento: "Andar 3"
  },
  {
    email: "japonesa2@flashfood.com",
    nomeResponsavel: "Hiroshi Yamamoto",
    sobrenomeResponsavel: "Tokyo",
    cpfResponsavel: "12345678908",
    telefoneResponsavel: "(11) 98765-4328",
    nomeRestaurante: "Tokyo Sushi Bar",
    cnpj: "12345678000197",
    categoria: "japonesa",
    descricao: "Experiência culinária japonesa com ingredientes importados",
    fotoRestauranteUrl: "https://images.unsplash.com/photo-1553621042-f6e147245ba1?q=80&w=500",
    cep: "01310-100",
    estado: "SP",
    cidade: "São Paulo",
    bairro: "Jardins",
    rua: "Avenida Jardins",
    numero: "888",
    complemento: ""
  }
];

async function limparRestaurantes() {
  console.log("🗑️  Limpando restaurantes antigos...");
  try {
    const q = query(collection(db, "users"), where("tipo", "==", "restaurante"));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();
      console.log(`Deletando restaurante: ${userData.nomeRestaurante}`);

      // Deletar do Firestore
      await deleteDoc(doc(db, "users", docSnap.id));

      // Tentar deletar da autenticação (pode falhar se usuário não existir mais)
      try {
        const userAuth = auth.currentUser;
        if (userAuth && userAuth.uid === docSnap.id) {
          await deleteUser(userAuth);
        }
      } catch (authError) {
        console.log(`  ⚠️  Não foi possível deletar usuário de auth: ${userData.email}`);
      }
    }
    console.log("✅ Limpeza concluída");
  } catch (error) {
    console.error("❌ Erro ao limpar restaurantes:", error);
  }
}

async function criarRestaurantes() {
  console.log("\n🏪 Criando novos restaurantes...\n");

  for (const restData of restaurantes) {
    try {
      console.log(`📝 Criando: ${restData.nomeRestaurante} (${restData.categoria})`);

      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        restData.email,
        "12345678"
      );

      const uid = userCredential.user.uid;
      console.log(`   ✓ Usuário criado: ${uid}`);

      // Salvar dados no Firestore
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

      console.log(`   ✓ Dados salvos no Firestore\n`);
    } catch (error) {
      console.error(`   ❌ Erro ao criar ${restData.nomeRestaurante}:`, error.message);
    }
  }

  console.log("✅ Criação de restaurantes concluída!");
}

async function main() {
  console.log("🚀 Iniciando seed de restaurantes\n");

  try {
    await limparRestaurantes();
    await criarRestaurantes();
    console.log("\n🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }

  process.exit(0);
}

main();
