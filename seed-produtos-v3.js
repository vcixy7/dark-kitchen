const { initializeApp } = require('firebase/app');
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
const db = getFirestore(app);

const produtosPorCategoria = {
  brasileira: [
    { nome: 'Churrasco Misto', descricao: 'Seleção de carnes grelhadas', preco: 79.90, imagem: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?q=80&w=500', categoria: 'Carnes' },
    { nome: 'Picanha com Aipim', descricao: 'Picanha grelhada com aipim frito', preco: 64.90, imagem: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=500', categoria: 'Carnes' },
    { nome: 'Feijoada Completa', descricao: 'Tradicional feijoada carioca', preco: 49.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Arroz com Feijão', descricao: 'Acompanhamento tradicional', preco: 12.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Acompanhamentos' },
    { nome: 'Pão de Queijo', descricao: 'Quentinho e crocante', preco: 8.90, imagem: 'https://images.unsplash.com/photo-1585521537529-d95bc2f4b6e0?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Brigadeiro', descricao: 'Sobremesa clássica', preco: 5.90, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Pudim de Leite', descricao: 'Pudim tradicional', preco: 9.90, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Sobremesas' },
    { nome: 'Suco Natural', descricao: 'Suco de frutas frescas', preco: 7.90, imagem: 'https://images.unsplash.com/photo-1544432415-e28219cd816f?q=80&w=500', categoria: 'Bebidas' }
  ],
  pizzaria: [
    { nome: 'Pizza Margherita', descricao: 'Clássica com mussarela fresca', preco: 42.90, imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500', categoria: 'Pizzas' },
    { nome: 'Pizza Pepperoni', descricao: 'Com pepperoni crocante', preco: 47.90, imagem: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?q=80&w=500', categoria: 'Pizzas' },
    { nome: 'Pizza Quatro Queijos', descricao: 'Mussarela, gorgonzola, parmesão e provolone', preco: 52.90, imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500', categoria: 'Pizzas' },
    { nome: 'Calzone Recheado', descricao: 'Presunto e queijo', preco: 38.90, imagem: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=500', categoria: 'Pizzas' },
    { nome: 'Focaccia com Alecrim', descricao: 'Pão artesanal italiano', preco: 18.90, imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Tiramisu', descricao: 'Sobremesa italiana tradicional', preco: 12.90, imagem: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Panna Cotta', descricao: 'Creme italiano delicado', preco: 11.90, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Sobremesas' },
    { nome: 'Refrigerante', descricao: 'Gelado e refrescante', preco: 6.90, imagem: 'https://images.unsplash.com/photo-1554866585-f39d15e82500?q=80&w=500', categoria: 'Bebidas' }
  ],
  hamburgueria: [
    { nome: 'Burger Clássico', descricao: 'Carne, queijo e verduras', preco: 28.90, imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500', categoria: 'Hambúrgueres' },
    { nome: 'Burger Bacon', descricao: 'Com bacon crocante', preco: 32.90, imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=500', categoria: 'Hambúrgueres' },
    { nome: 'Double Burger', descricao: 'Dois hambúrgueres com duplo queijo', preco: 37.90, imagem: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=500', categoria: 'Hambúrgueres' },
    { nome: 'Chicken Burger', descricao: 'Frango crocante', preco: 26.90, imagem: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=500', categoria: 'Hambúrgueres' },
    { nome: 'Batata Frita Palito', descricao: 'Crocante e dourada', preco: 10.90, imagem: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Onion Rings', descricao: 'Anéis de cebola frita', preco: 11.90, imagem: 'https://images.unsplash.com/photo-1639024471694-c6f7f1951912?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Milk Shake Chocolate', descricao: 'Gelado e cremoso', preco: 13.90, imagem: 'https://images.unsplash.com/photo-1577003832033-a0d99e856b58?q=80&w=500', categoria: 'Bebidas' },
    { nome: 'Refrigerante Lata', descricao: 'Gelado', preco: 5.90, imagem: 'https://images.unsplash.com/photo-1554866585-f39d15e82500?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Bebidas' }
  ],
  japonesa: [
    { nome: 'Sushi Misto Premium', descricao: '12 peças variadas', preco: 68.90, imagem: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500', categoria: 'Sushis' },
    { nome: 'Temaki Salmão', descricao: 'Cone de alga com salmão', preco: 26.90, imagem: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=500', categoria: 'Sushis' },
    { nome: 'Hot Roll', descricao: 'Roll quente com frango', preco: 32.90, imagem: 'https://images.unsplash.com/photo-1562565652-a0d3f7d7eb69?q=80&w=500', categoria: 'Sushis' },
    { nome: 'Ramen de Frango', descricao: 'Macarrão em caldo quente', preco: 34.90, imagem: 'https://images.unsplash.com/photo-1612874742237-6526221fcb3f?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Gyoza', descricao: '8 unidades fritas', preco: 18.90, imagem: 'https://images.unsplash.com/photo-1562565652-a0d3f7d7eb69?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Acompanhamentos' },
    { nome: 'Edamame', descricao: 'Vagens de soja', preco: 12.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Sorvete Mochi', descricao: 'Sorvete japonês', preco: 9.90, imagem: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Chá Gelado', descricao: 'Chá verde gelado', preco: 6.90, imagem: 'https://images.unsplash.com/photo-1544432415-e28219cd816f?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Bebidas' }
  ],
  italiana: [
    { nome: 'Espaguete à Carbonara', descricao: 'Molho cremoso e bacon', preco: 38.90, imagem: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Lasanha Bolonhesa', descricao: 'Camadas de pasta e molho', preco: 42.90, imagem: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Ravioli ao Funghi', descricao: 'Recheio de ricota e funghi', preco: 41.90, imagem: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Pratos Principais' },
    { nome: 'Pesto alla Genovese', descricao: 'Molho verde tradicional', preco: 36.90, imagem: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Pão Toscano', descricao: 'Pão italiano crocante', preco: 8.90, imagem: 'https://images.unsplash.com/photo-1585521537529-d95bc2f4b6e0?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Bruschetta', descricao: 'Pão com tomate e manjericão', preco: 14.90, imagem: 'https://images.unsplash.com/photo-1585521537529-d95bc2f4b6e0?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Acompanhamentos' },
    { nome: 'Gelato Italiano', descricao: 'Sorvete artesanal', preco: 11.90, imagem: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Café Espresso', descricao: 'Café italiano puro', preco: 4.90, imagem: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?q=80&w=500', categoria: 'Bebidas' }
  ],
  tailandesa: [
    { nome: 'Pad Thai', descricao: 'Macarrão tailandês tradicional', preco: 35.90, imagem: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Green Curry', descricao: 'Curry verde com leite de coco', preco: 38.90, imagem: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Pratos Principais' },
    { nome: 'Tom Yum Soup', descricao: 'Sopa azeda e apimentada', preco: 26.90, imagem: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?q=80&w=500', categoria: 'Sopas' },
    { nome: 'Spring Rolls', descricao: '4 rolinhos fritos', preco: 14.90, imagem: 'https://images.unsplash.com/photo-1481070414776-8a4fc17f432d?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Salada Tailandesa', descricao: 'Salada picante tailandesa', preco: 22.90, imagem: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=500', categoria: 'Saladas' },
    { nome: 'Arroz Tailandês', descricao: 'Arroz frito tailandês', preco: 12.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Frutas Exóticas', descricao: 'Manga e maracujá', preco: 10.90, imagem: 'https://images.unsplash.com/photo-1599599810694-c0ed06e0a8b5?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Chá Tailandês', descricao: 'Chá doce gelado', preco: 7.90, imagem: 'https://images.unsplash.com/photo-1544432415-e28219cd816f?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Bebidas' }
  ],
  coreana: [
    { nome: 'Bibimbap', descricao: 'Arroz com verduras e carne', preco: 36.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Bulgogi', descricao: 'Carne marinada e grelhada', preco: 42.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Carnes' },
    { nome: 'Korean BBQ Mix', descricao: 'Seleção de carnes para grelhar', preco: 78.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', categoria: 'Carnes' },
    { nome: 'Kimchi Jjigae', descricao: 'Ensopado de kimchi', preco: 28.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Tteokbokki', descricao: 'Bolinhos de arroz apimentado', preco: 16.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Acompanhamentos' },
    { nome: 'Kimbap', descricao: 'Rolo de alga com vegetais', preco: 14.90, imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Bingsu', descricao: 'Sobremesa de gelo com calda doce', preco: 10.90, imagem: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Suco Coreano', descricao: 'Bebida refrescante', preco: 8.90, imagem: 'https://images.unsplash.com/photo-1544432415-e28219cd816f?q=80&w=500', categoria: 'Bebidas' }
  ],
  mexicana: [
    { nome: 'Burrito Grande', descricao: 'Tortilla com carne e feijão', preco: 32.90, imagem: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Tacos Al Pastor', descricao: '4 tacos com carne marinada', preco: 28.90, imagem: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Pratos Principais' },
    { nome: 'Enchilada Verde', descricao: 'Tortilla com molho verde', preco: 34.90, imagem: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Quesadilla', descricao: 'Tortilla grelhada com queijo', preco: 22.90, imagem: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Nachos com Guacamole', descricao: 'Nachos crocantes e guacamole fresco', preco: 18.90, imagem: 'https://images.unsplash.com/photo-1599599810694-c0ed06e0a8b5?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Flan Mexicano', descricao: 'Sobremesa tradicional', preco: 11.90, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Agua Fresca', descricao: 'Bebida refrescante mexicana', preco: 7.90, imagem: 'https://images.unsplash.com/photo-1544432415-e28219cd816f?q=80&w=500', categoria: 'Bebidas' },
    { nome: 'Churros', descricao: 'Fritos com calda doce', preco: 9.90, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Sobremesas' }
  ],
  indiana: [
    { nome: 'Chicken Tikka Masala', descricao: 'Frango em molho cremoso especiado', preco: 42.90, imagem: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500', categoria: 'Carnes' },
    { nome: 'Butter Chicken', descricao: 'Frango em molho de manteiga', preco: 40.90, imagem: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Carnes' },
    { nome: 'Lamb Vindaloo', descricao: 'Cordeiro com curry apimentado', preco: 48.90, imagem: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500', categoria: 'Carnes' },
    { nome: 'Dal Makhani', descricao: 'Lentilha em molho cremoso', preco: 26.90, imagem: 'https://images.unsplash.com/photo-1596040436409-fe3d97d5a5c3?q=80&w=500', categoria: 'Pratos Vegetarianos' },
    { nome: 'Naan Bread', descricao: 'Pão indiano tradicional', preco: 8.90, imagem: 'https://images.unsplash.com/photo-1585521537529-d95bc2f4b6e0?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Samosa', descricao: '4 pastéis crocantes', preco: 12.90, imagem: 'https://images.unsplash.com/photo-1599599810694-c0ed06e0a8b5?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Gulab Jamun', descricao: 'Bolinha de leite condensado doce', preco: 9.90, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Lassi', descricao: 'Bebida de iogurte doce', preco: 8.90, imagem: 'https://images.unsplash.com/photo-1544432415-e28219cd816f?q=80&w=500', categoria: 'Bebidas' }
  ],
  vegetariana: [
    { nome: 'Bowl Buddha', descricao: 'Salada com grãos e legumes', preco: 34.90, imagem: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500', categoria: 'Saladas' },
    { nome: 'Wrap Vegetariano', descricao: 'Wrap integral com vegetais grelhados', preco: 28.90, imagem: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=500', categoria: 'Pratos Principais' },
    { nome: 'Pizza Vegana', descricao: 'Sem queijo, com vegetais frescos', preco: 38.90, imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500', categoria: 'Pizzas' },
    { nome: 'Hambúrguer de Grão', descricao: 'Vegetariano e saudável', preco: 26.90, imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500', categoria: 'Hambúrgueres' },
    { nome: 'Salada Caprese', descricao: 'Tomate, mussarela e manjericão', preco: 22.90, imagem: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&crop=entropy&cs=tinysrgb&fit=max', categoria: 'Saladas' },
    { nome: 'Hummus com Pita', descricao: 'Pasta de grão de bico', preco: 14.90, imagem: 'https://images.unsplash.com/photo-1599599810694-c0ed06e0a8b5?q=80&w=500', categoria: 'Acompanhamentos' },
    { nome: 'Açai Bowl', descricao: 'Bowl de açaí com granola', preco: 16.90, imagem: 'https://images.unsplash.com/photo-1553530666-ba2a8e36cd48?q=80&w=500', categoria: 'Sobremesas' },
    { nome: 'Suco Verde', descricao: 'Detox de maçã e cenoura', preco: 11.90, imagem: 'https://images.unsplash.com/photo-1544432415-e28219cd816f?q=80&w=500', categoria: 'Bebidas' }
  ]
};

async function limparProdutos() {
  console.log("🗑️  Limpando produtos antigos...");
  try {
    const snapshot = await getDocs(collection(db, "produtos"));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "produtos", docSnap.id));
    }
    console.log("✅ Limpeza concluída");
  } catch (error) {
    console.error("❌ Erro ao limpar produtos:", error);
  }
}

async function criarProdutos() {
  console.log("\n🍽️  Criando produtos para restaurantes...\n");

  try {
    const restaurantesSnapshot = await getDocs(query(collection(db, "users"), where("tipo", "==", "restaurante")));

    let totalProdutos = 0;

    for (const docSnap of restaurantesSnapshot.docs) {
      const restaurante = docSnap.data();
      const categoria = restaurante.categoria;
      const produtos = produtosPorCategoria[categoria] || [];

      for (const produto of produtos) {
        try {
          const docRef = doc(collection(db, "produtos"));
          await setDoc(docRef, {
            id: docRef.id,
            restauranteId: docSnap.id,
            nomeRestaurante: restaurante.nomeRestaurante,
            ...produto,
            disponivel: Math.random() > 0.15,
            emAlta: Math.random() > 0.7,
            dataCriacao: new Date()
          });
          totalProdutos++;
        } catch (error) {
          console.error(`Erro ao criar produto ${produto.nome}:`, error.message);
        }
      }

      console.log(`✓ ${restaurante.nomeRestaurante}: ${produtos.length} produtos`);
    }

    console.log(`\n✅ Total de produtos criados: ${totalProdutos}`);
  } catch (error) {
    console.error("❌ Erro geral ao criar produtos:", error);
  }
}

async function main() {
  console.log("🚀 Iniciando seed de produtos com imagens únicas\n");

  try {
    await limparProdutos();
    await criarProdutos();
    console.log("\n🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }

  process.exit(0);
}

main();
