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

const categoriasData = {
  brasileira: {
    nomes: ['Boteco do Zé', 'Churrascaria Premium', 'Casa da Comida Caipira', 'Empório Mineiro', 'Festim Gaúcho'],
    imagens: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500',
      'https://images.unsplash.com/photo-1529457840457-d54750b349fa?q=80&w=500',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&crop=faces&fit=crop'
    ]
  },
  pizzaria: {
    nomes: ['Pizzaria da Nonna', 'Forno a Lenha', 'Pizza Artesanal', 'Tradição Italiana', 'Massa Fresca'],
    imagens: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500',
      'https://images.unsplash.com/photo-1564958013507-0b6ad0c1e26f?q=80&w=500',
      'https://images.unsplash.com/photo-1458693528222-f1426ecada80?q=80&w=500',
      'https://images.unsplash.com/photo-1555939594-58d7cb561404?q=80&w=500',
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500'
    ]
  },
  hamburgueria: {
    nomes: ['Burger Gourmet', 'Smash House', 'The Burger Place', 'Meat Master', 'Artisan Burgers'],
    imagens: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500',
      'https://images.unsplash.com/photo-1555939594-58d7cb561404?q=80&w=500'
    ]
  },
  japonesa: {
    nomes: ['Sushi Premium', 'Sakura Restaurant', 'Tokyo Express', 'Tempura House', 'Omakase'],
    imagens: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500',
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=500',
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&crop=faces&fit=crop',
      'https://images.unsplash.com/photo-1612874742237-6526221fcb3f?q=80&w=500'
    ]
  },
  italiana: {
    nomes: ['Trattoria Italiana', 'Pasta della Nonna', 'Risotto Classico', 'Carbonara Autêntica', 'Lasanha Especial'],
    imagens: [
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=500',
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=500',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=500&crop=faces&fit=crop'
    ]
  },
  tailandesa: {
    nomes: ['Baan Thai', 'Sabor da Tailândia', 'Thai Cuisine', 'Orchid Thai', 'Bangkok Express'],
    imagens: [
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=500',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=500&crop=faces&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=500&crop=entropy&cs=tinysrgb'
    ]
  },
  coreana: {
    nomes: ['Seoul Kitchen', 'Korean BBQ', 'Kimchi House', 'Seoul Express', 'Korean Soul Food'],
    imagens: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&crop=faces&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&crop=entropy&cs=tinysrgb'
    ]
  },
  mexicana: {
    nomes: ['Casa Mexicana', 'Taco Fiesta', 'El Compadre', 'Burrito King', 'Quesadilla Palace'],
    imagens: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500',
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500&crop=faces&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561404?q=80&w=500',
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500&crop=entropy&cs=tinysrgb'
    ]
  },
  indiana: {
    nomes: ['Curry House', 'Namaste India', 'Tandoori Especial', 'Mumbai Express', 'Spice Master'],
    imagens: [
      'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500',
      'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500&crop=faces&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
      'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500&crop=entropy&cs=tinysrgb'
    ]
  },
  vegetariana: {
    nomes: ['Green Vida', 'Vegan Fresh', 'Vegetal House', 'Natural Mundo', 'Bio Kitchen'],
    imagens: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&crop=entropy&cs=tinysrgb&fit=max',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&crop=faces&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&crop=entropy&cs=tinysrgb'
    ]
  }
};

function gerarRestaurantes() {
  const restaurantes = [];
  let contador = 100 + Math.floor(Math.random() * 900000);

  for (const [categoria, dados] of Object.entries(categoriasData)) {
    for (let i = 0; i < dados.nomes.length; i++) {
      restaurantes.push({
        email: `${categoria}${contador}@flashfood.com`,
        nomeResponsavel: `Responsável ${contador}`,
        sobrenomeResponsavel: `Restaurante`,
        cpfResponsavel: `${String(contador).padStart(11, '0')}`,
        telefoneResponsavel: `(11) 9${String(contador).padStart(8, '0')}`,
        nomeRestaurante: dados.nomes[i],
        cnpj: `${String(contador).padStart(14, '0')}`,
        categoria: categoria,
        descricao: `Autêntico restaurante de ${categoria}. Qualidade, sabor e tradição em cada prato.`,
        fotoRestauranteUrl: dados.imagens[i],
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
  console.log("🚀 Iniciando seed de 50 restaurantes com imagens únicas\n");

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
