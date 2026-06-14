const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, addDoc } = require('firebase/firestore');

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
const db = getFirestore(app);

// Produtos por categoria de restaurante
const produtosPorRestaurante = {
  "Churrascaria do Brasil": [
    {
      nome: "Churrasco Misto Premium",
      descricao: "Seleção de carnes nobres grelhadas",
      preco: 89.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Arroz branco", preco: 0 },
        { nome: "Batata frita", preco: 8.90 },
        { nome: "Vinagrete", preco: 0 },
        { nome: "Farofa de bacon", preco: 5.90 }
      ]
    },
    {
      nome: "Picanha na Chapa",
      descricao: "Picanha suculenta grelhada na chapa quente",
      preco: 78.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Batata frita", preco: 8.90 },
        { nome: "Pão de queijo", preco: 7.90 },
        { nome: "Guarniçao verde", preco: 0 }
      ]
    },
    {
      nome: "Costela Suína",
      descricao: "Costela de porco macia e suculenta",
      preco: 65.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Espetinho de Frango",
      descricao: "Frango temperado em espeto",
      preco: 32.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Molho chimichurri", preco: 0 },
        { nome: "Pimenta", preco: 0 }
      ]
    },
    {
      nome: "Chopp Artesanal",
      descricao: "Cerveja gelada e refrescante",
      preco: 15.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ],
  "Boteco Carioca": [
    {
      nome: "Feijoada Completa",
      descricao: "Tradicional feijoada com acompanhamentos",
      preco: 42.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Arroz", preco: 0 },
        { nome: "Couve refogada", preco: 0 },
        { nome: "Ovo frito", preco: 2.90 }
      ]
    },
    {
      nome: "Caldo de Cana",
      descricao: "Suco de cana gelado e natural",
      preco: 8.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1585518419759-8f15e5a12999?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Bolo de Milho",
      descricao: "Bolo caseiro crocante",
      preco: 12.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Brigadeiro Premium",
      descricao: "Brigadeiro artesanal de chocolate belga",
      preco: 18.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ],
  "Pizzaria Napolitana": [
    {
      nome: "Pizza Margherita",
      descricao: "Mussarela, tomate, manjericão fresco",
      preco: 42.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Borda recheada de queijo", preco: 5.90 },
        { nome: "Extra de mussarela", preco: 4.90 }
      ]
    },
    {
      nome: "Pizza Pepperoni",
      descricao: "Pepperoni, queijo e molho especial",
      preco: 49.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Borda recheada", preco: 5.90 },
        { nome: "Molho extra", preco: 2.90 }
      ]
    },
    {
      nome: "Pizza Quatro Queijos",
      descricao: "Mussarela, gorgonzola, parmesão, provolone",
      preco: 52.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Calzone Recheado",
      descricao: "Calzone com presunto, mussarela e champignon",
      preco: 38.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Focaccia de Alecrim",
      descricao: "Focaccia artesanal com azeite e alecrim",
      preco: 18.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ],
  "Bella Pizzeria": [
    {
      nome: "Pizza Presunto e Melão",
      descricao: "Presunto crocante e melão fresco",
      preco: 45.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Borda recheada", preco: 5.90 }
      ]
    },
    {
      nome: "Pizza Frango com Catupiry",
      descricao: "Frango desfiado, catupiry e milho",
      preco: 47.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Pizza Vegetariana",
      descricao: "Mix de vegetais frescos",
      preco: 39.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1520763185298-1b434c919abe?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Refrigerante",
      descricao: "Refrigerante gelado 2L",
      preco: 8.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1554866585-acbb973caf7a?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ],
  "Burger Master": [
    {
      nome: "Burger Clássico",
      descricao: "Hambúrguer artesanal com queijo cheddar, alface, tomate",
      preco: 25.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Batata Frita Palito", preco: 7.90 },
        { nome: "Anéis de Cebola", preco: 9.90 },
        { nome: "Refrigerante Lata", preco: 5.00 },
        { nome: "Molho Barbecue extra", preco: 2.50 }
      ]
    },
    {
      nome: "Burger Bacon",
      descricao: "Hambúrguer com bacon crocante, queijo e cebola caramelizada",
      preco: 29.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Batata Rústica", preco: 8.90 },
        { nome: "Molho Barbecue Extra", preco: 2.50 }
      ]
    },
    {
      nome: "Double Cheeseburger",
      descricao: "Dois hambúrgueres, queijo cheddar duplo, picles",
      preco: 34.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Chicken Burger",
      descricao: "Frango crocante com maionese artesanal, alface e pão brioche",
      preco: 27.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Milkshake de Chocolate",
      descricao: "Milkshake cremoso de chocolate puro",
      preco: 14.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1608270861620-7afb9f17c9c4?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ],
  "Smash Burger House": [
    {
      nome: "Smash Duplo",
      descricao: "Hambúrguer smash com cheddar, onion crispy e molho house",
      preco: 32.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Batata smash", preco: 8.90 },
        { nome: "Molho especial", preco: 2.90 }
      ]
    },
    {
      nome: "Smash Bacon Egg",
      descricao: "Hambúrguer smash com bacon, ovo e queijo gouda",
      preco: 35.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Batata Smash",
      descricao: "Batatas fritas crocantes com cheddar e bacon",
      preco: 12.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Smash Vegetariano",
      descricao: "Smash burger com vegetais grelhados",
      preco: 28.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1520763185298-1b434c919abe?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ],
  "Sushi House": [
    {
      nome: "Combo Sushi Deluxe",
      descricao: "Sushi, sashimi e temaki para duas pessoas",
      preco: 89.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Molho extra", preco: 2.90 },
        { nome: "Wasabi extra", preco: 0 }
      ]
    },
    {
      nome: "Hot Roll",
      descricao: "Sushi quente com atum frito",
      preco: 32.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Sashimi Premium",
      descricao: "Seleção de sashimi fresco do dia",
      preco: 78.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Temaki California",
      descricao: "Temaki com abacate, camarão e maionese",
      preco: 24.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ],
  "Tokyo Sushi Bar": [
    {
      nome: "Nigiri Sampler",
      descricao: "Seleção de nigiris variados",
      preco: 45.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200",
      acompanhamentosPossiveis: [
        { nome: "Molho ponzu", preco: 0 },
        { nome: "Gengibre em conserva", preco: 0 }
      ]
    },
    {
      nome: "Dragon Roll",
      descricao: "Roll com atum e abacate no topo",
      preco: 38.90,
      disponivel: true,
      emAlta: true,
      imagem: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Maki Vegetariano",
      descricao: "Maki feito com vegetais frescos",
      preco: 18.90,
      disponivel: true,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200",
      acompanhamentosPossiveis: []
    },
    {
      nome: "Sake Premium",
      descricao: "Bebida alcoólica japonesa importada",
      preco: 42.90,
      disponivel: false,
      emAlta: false,
      imagem: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=200",
      acompanhamentosPossiveis: []
    }
  ]
};

async function atualizarFotoTokyo() {
  console.log("🖼️  Atualizando foto do Tokyo Sushi Bar...");
  try {
    const q = query(collection(db, "users"), where("nomeRestaurante", "==", "Tokyo Sushi Bar"));
    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, "users", docId), {
        fotoRestauranteUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500"
      });
      console.log("✅ Foto atualizada com sucesso!\n");
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar foto:", error);
  }
}

async function criarProdutos() {
  console.log("🍽️  Criando produtos para cada restaurante...\n");

  try {
    const snapshot = await getDocs(collection(db, "users"));

    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();

      if (userData.tipo === "restaurante" && produtosPorRestaurante[userData.nomeRestaurante]) {
        const restauranteId = docSnap.id;
        const produtos = produtosPorRestaurante[userData.nomeRestaurante];

        console.log(`📍 ${userData.nomeRestaurante}:`);

        for (const produto of produtos) {
          try {
            await addDoc(collection(db, "produtos"), {
              restauranteId,
              nome: produto.nome,
              descricao: produto.descricao,
              preco: produto.preco,
              imagem: produto.imagem,
              disponivel: produto.disponivel,
              emAlta: produto.emAlta,
              acompanhamentosPossiveis: produto.acompanhamentosPossiveis,
              dataCriacao: new Date()
            });

            const status = produto.disponivel ? "✓" : "✗";
            console.log(`   ${status} ${produto.nome} - R$ ${produto.preco.toFixed(2)}`);
          } catch (error) {
            console.error(`   ❌ Erro ao criar ${produto.nome}:`, error.message);
          }
        }
        console.log();
      }
    }

    console.log("✅ Criação de produtos concluída!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

async function main() {
  console.log("🚀 Iniciando seed de produtos\n");

  try {
    await atualizarFotoTokyo();
    await criarProdutos();
    console.log("\n🎉 Seed de produtos concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error);
  }

  process.exit(0);
}

main();
