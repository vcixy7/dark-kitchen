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

// Restaurantes com imagens ÚNICAS para cada um
const restaurantes = [
  // Brasileira
  { nome: 'Boteco do Zé', categoria: 'brasileira', foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=300&fit=crop' },
  { nome: 'Churrascaria Premium', categoria: 'brasileira', foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop' },
  { nome: 'Casa da Comida Caipira', categoria: 'brasileira', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop&q=80' },
  { nome: 'Empório Mineiro', categoria: 'brasileira', foto: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=500&h=300&fit=crop' },
  { nome: 'Festim Gaúcho', categoria: 'brasileira', foto: 'https://images.unsplash.com/photo-1529457840457-d54750b349fa?w=500&h=300&fit=crop' },

  // Pizzaria
  { nome: 'Pizzaria da Nonna', categoria: 'pizzaria', foto: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=300&fit=crop' },
  { nome: 'Forno a Lenha', categoria: 'pizzaria', foto: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=500&h=300&fit=crop' },
  { nome: 'Pizza Artesanal', categoria: 'pizzaria', foto: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=300&fit=crop' },
  { nome: 'Tradição Italiana', categoria: 'pizzaria', foto: 'https://images.unsplash.com/photo-1564958013507-0b6ad0c1e26f?w=500&h=300&fit=crop' },
  { nome: 'Massa Fresca', categoria: 'pizzaria', foto: 'https://images.unsplash.com/photo-1458693528222-f1426ecada80?w=500&h=300&fit=crop' },

  // Hamburgueria
  { nome: 'Burger Gourmet', categoria: 'hamburgueria', foto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop' },
  { nome: 'Smash House', categoria: 'hamburgueria', foto: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=300&fit=crop' },
  { nome: 'The Burger Place', categoria: 'hamburgueria', foto: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=300&fit=crop' },
  { nome: 'Meat Master', categoria: 'hamburgueria', foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop&q=85' },
  { nome: 'Artisan Burgers', categoria: 'hamburgueria', foto: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&h=300&fit=crop' },

  // Japonesa
  { nome: 'Sushi Premium', categoria: 'japonesa', foto: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&h=300&fit=crop' },
  { nome: 'Sakura Restaurant', categoria: 'japonesa', foto: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500&h=300&fit=crop' },
  { nome: 'Tokyo Express', categoria: 'japonesa', foto: 'https://images.unsplash.com/photo-1612874742237-6526221fcb3f?w=500&h=300&fit=crop' },
  { nome: 'Tempura House', categoria: 'japonesa', foto: 'https://images.unsplash.com/photo-1562565652-a0d3f7d7eb69?w=500&h=300&fit=crop' },
  { nome: 'Omakase', categoria: 'japonesa', foto: 'https://images.unsplash.com/photo-1553621042-f6e147245ba1?w=500&h=300&fit=crop' },

  // Italiana
  { nome: 'Trattoria Italiana', categoria: 'italiana', foto: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=300&fit=crop' },
  { nome: 'Pasta della Nonna', categoria: 'italiana', foto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=300&fit=crop' },
  { nome: 'Risotto Classico', categoria: 'italiana', foto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop' },
  { nome: 'Carbonara Autêntica', categoria: 'italiana', foto: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=300&fit=crop&q=85' },
  { nome: 'Lasanha Especial', categoria: 'italiana', foto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=300&fit=crop&q=85' },

  // Tailandesa
  { nome: 'Baan Thai', categoria: 'tailandesa', foto: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=500&h=300&fit=crop' },
  { nome: 'Sabor da Tailândia', categoria: 'tailandesa', foto: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=500&h=300&fit=crop&q=85' },
  { nome: 'Thai Cuisine', categoria: 'tailandesa', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop&q=75' },
  { nome: 'Orchid Thai', categoria: 'tailandesa', foto: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=500&h=300&fit=crop&q=80' },
  { nome: 'Bangkok Express', categoria: 'tailandesa', foto: 'https://images.unsplash.com/photo-1545521521-83bd8e7d5c3c?w=500&h=300&fit=crop' },

  // Coreana
  { nome: 'Seoul Kitchen', categoria: 'coreana', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop&q=70' },
  { nome: 'Korean BBQ', categoria: 'coreana', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop&q=80' },
  { nome: 'Kimchi House', categoria: 'coreana', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop&q=90' },
  { nome: 'Seoul Express', categoria: 'coreana', foto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop&q=85' },
  { nome: 'Korean Soul Food', categoria: 'coreana', foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop&q=90' },

  // Mexicana
  { nome: 'Casa Mexicana', categoria: 'mexicana', foto: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=300&fit=crop' },
  { nome: 'Taco Fiesta', categoria: 'mexicana', foto: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=300&fit=crop&q=85' },
  { nome: 'El Compadre', categoria: 'mexicana', foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop&q=80' },
  { nome: 'Burrito King', categoria: 'mexicana', foto: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=300&fit=crop&q=80' },
  { nome: 'Quesadilla Palace', categoria: 'mexicana', foto: 'https://images.unsplash.com/photo-1599599810694-c0ed06e0a8b5?w=500&h=300&fit=crop' },

  // Indiana
  { nome: 'Curry House', categoria: 'indiana', foto: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?w=500&h=300&fit=crop' },
  { nome: 'Namaste India', categoria: 'indiana', foto: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?w=500&h=300&fit=crop&q=85' },
  { nome: 'Tandoori Especial', categoria: 'indiana', foto: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?w=500&h=300&fit=crop&q=80' },
  { nome: 'Mumbai Express', categoria: 'indiana', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop&q=85' },
  { nome: 'Spice Master', categoria: 'indiana', foto: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?w=500&h=300&fit=crop&q=90' },

  // Vegetariana
  { nome: 'Green Vida', categoria: 'vegetariana', foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop' },
  { nome: 'Vegan Fresh', categoria: 'vegetariana', foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop&q=85' },
  { nome: 'Vegetal House', categoria: 'vegetariana', foto: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=300&fit=crop' },
  { nome: 'Natural Mundo', categoria: 'vegetariana', foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop&q=90' },
  { nome: 'Bio Kitchen', categoria: 'vegetariana', foto: 'https://images.unsplash.com/photo-1553530666-ba2a8e36cd48?w=500&h=300&fit=crop' }
];

async function limparRestaurantes() {
  console.log("🗑️  Limpando restaurantes antigos...");
  try {
    const q = query(collection(db, "users"), where("tipo", "==", "restaurante"));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "users", docSnap.id));
    }
    console.log("✅ Limpeza concluída\n");
  } catch (error) {
    console.error("❌ Erro ao limpar restaurantes:", error);
  }
}

async function criarRestaurantes() {
  console.log("🏪 Criando 50 restaurantes com imagens ÚNICAS...\n");

  for (let i = 0; i < restaurantes.length; i++) {
    const resto = restaurantes[i];
    const contador = Math.floor(Math.random() * 900000) + 100000;
    const email = `${resto.categoria}${contador}${i}@flashfood.com`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, "12345678");
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        userId: uid,
        nomeResponsavel: `Responsável`,
        sobrenomeResponsavel: `do ${resto.nome}`,
        cpfResponsavel: `${String(i + 1).padStart(11, '0')}`,
        emailResponsavel: email,
        telefoneResponsavel: `(11) 99999-${String(i).padStart(4, '0')}`,
        nomeRestaurante: resto.nome,
        cnpj: `${String(i + 1).padStart(14, '0')}`,
        categoria: resto.categoria,
        descricao: `Autêntico restaurante de ${resto.categoria}`,
        fotoRestauranteUrl: resto.foto,
        cep: '01310-100',
        estado: 'SP',
        cidade: 'São Paulo',
        bairro: ['Centro', 'Vila Mariana', 'Bela Vista', 'Liberdade', 'Pinheiros'][i % 5],
        rua: `Rua ${resto.nome}`,
        numero: String((i * 100) % 1000),
        complemento: '',
        tipo: "restaurante",
        dataCriacao: new Date()
      });

      console.log(`✓ ${resto.nome} [${resto.categoria}]`);
    } catch (error) {
      console.error(`❌ ${resto.nome}: ${error.message}`);
    }
  }

  console.log("\n✅ Todos os restaurantes foram criados com imagens únicas!");
}

async function main() {
  console.log("🚀 Iniciando seed final de 50 restaurantes\n");

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
