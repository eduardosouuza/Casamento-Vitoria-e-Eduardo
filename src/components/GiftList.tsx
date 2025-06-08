import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './GiftList.css'; // Importando arquivo CSS para as animações
import { giftService, GiftItem } from '../lib/supabase';

const GiftList: React.FC = () => {
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // useEffect para rolar para o topo da página quando o componente é montado
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Função para converter imagem para Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Função para verificar se uma string é Base64
  const isBase64Image = (str: string): boolean => {
    return str.startsWith('data:image');
  };
  
  // Função para verificar se uma string é um emoji
  const isEmoji = (str: string): boolean => {
    return str.length <= 5 && /\p{Emoji}/u.test(str);
  };
  
  // Função para obter o background do emoji
  const getEmojiBackground = (emoji: string) => {
    // Cores de fundo suaves para os emojis
    const bgColors = [
      '#f8e5e5', // Rosa claro
      '#e5f8e5', // Verde claro
      '#e5e5f8', // Azul claro
      '#f8f8e5', // Amarelo claro
      '#f8e5f8', // Lilás claro
      '#e5f8f8', // Ciano claro
    ];
    
    // Escolhe uma cor com base no código do emoji para consistência
    const colorIndex = emoji.charCodeAt(0) % bgColors.length;
    return bgColors[colorIndex];
  };

  // Lista de presentes
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os presentes do Supabase ao inicializar
  useEffect(() => {
    const loadGifts = async () => {
      try {
        setLoading(true);
        const giftsData = await giftService.getAllGifts();
        setGifts(giftsData);
      } catch (err) {
        setError("Erro ao carregar a lista de presentes. Tente novamente mais tarde.");
        console.error("Erro ao carregar presentes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGifts();
  }, []);

  // Estados para pesquisa e filtragem
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'available' | 'reserved'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  // Categorias disponíveis
  const categories = [
    { value: 'todas', label: 'Todas as Categorias', icon: '🏠', color: 'gray' },
    { value: 'cozinha', label: 'Cozinha', icon: '🍳', color: 'orange' },
    { value: 'sala', label: 'Sala', icon: '🛋️', color: 'blue' },
    { value: 'quarto', label: 'Quarto', icon: '🛏️', color: 'purple' },
    { value: 'banheiro', label: 'Banheiro', icon: '🚿', color: 'cyan' },
    { value: 'lavanderia', label: 'Lavanderia', icon: '🧺', color: 'green' },
    { value: 'diversos', label: 'Diversos', icon: '🎁', color: 'pink' }
  ];
  


  // Função para filtrar e ordenar os presentes
  const filteredGifts = gifts
    .filter(gift => {
      // Filtro de busca por texto
      const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            gift.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de disponibilidade
      let matchesAvailability = true;
      if (filterType === 'available') {
        matchesAvailability = !gift.reserved;
      } else if (filterType === 'reserved') {
        matchesAvailability = gift.reserved;
      }
      
      // Filtro de categoria
      let matchesCategory = true;
      if (selectedCategory !== 'todas') {
        // Se o presente não tem categoria definida, considera como "diversos"
        const giftCategory = gift.category || 'diversos';
        matchesCategory = giftCategory === selectedCategory;
      }
      
      return matchesSearch && matchesAvailability && matchesCategory;
    })
    .sort((a, b) => {
      // Primeiro critério: presentes disponíveis vêm primeiro
      if (a.reserved !== b.reserved) {
        return a.reserved ? 1 : -1;
      }
      
      // Segundo critério: ordem alfabética A-Z por nome
      return a.name.toLowerCase().trim().localeCompare(b.name.toLowerCase().trim(), 'pt-BR');
    });



  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSelectedCategory('todas');
  };

  // Função para obter contagem de presentes
  const getGiftCounts = () => {
    const total = gifts.length;
    const reserved = gifts.filter(gift => gift.reserved).length;
    const available = total - reserved;
    
    return { total, reserved, available };
  };
  
  const giftCounts = getGiftCounts();

  const [activeModal, setActiveModal] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  
  // Estados para o painel administrativo
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminSection, setAdminSection] = useState<'login' | 'menu' | 'gifts'>('login');
  const [adminError, setAdminError] = useState('');
  const [lastAdminLogin, setLastAdminLogin] = useState<Date | null>(null);
  const [adminStats, setAdminStats] = useState({
    totalGifts: 0,
    reservedGifts: 0,
    availableGifts: 0
  });
  
  // Estado para novo presente e edição
  const [newGift, setNewGift] = useState<{
    name: string;
    description: string;
    imageurl: string;  // Alterado de imageUrl para imageurl
    category: string;
  }>({
    name: '',
    description: '',
    imageurl: '',  // Alterado de imageUrl para imageurl
    category: 'diversos'
  });
  const [editGift, setEditGift] = useState<GiftItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para importação JSON
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Função para buscar estatísticas atualizadas
  const updateAdminStats = () => {
    const total = gifts.length;
    const reserved = gifts.filter(gift => gift.reserved).length;
    setAdminStats({
      totalGifts: total,
      reservedGifts: reserved,
      availableGifts: total - reserved
    });
  };
  
  useEffect(() => {
    if (adminAuthenticated) {
      updateAdminStats();
    }
  }, [adminAuthenticated, gifts]);

  // Credenciais do administrador (em uma aplicação real, isso seria verificado no servidor)
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "viedu2025";

  // Função para verificar as credenciais do administrador
  const authenticateAdmin = async () => {
    setAdminError('');
    
    try {
      const isAuthenticated = await giftService.verifyAdmin(adminUsername, adminPassword);
      
      if (isAuthenticated) {
        setAdminAuthenticated(true);
        setAdminSection('menu');
        setLastAdminLogin(new Date());
        setAdminPassword('');
        setAdminUsername('');
      } else {
        setAdminError('Usuário ou senha incorretos!');
        setTimeout(() => setAdminError(''), 3000);
      }
    } catch (err) {
      setAdminError('Erro ao conectar ao servidor. Tente novamente.');
      console.error("Erro na autenticação:", err);
      setTimeout(() => setAdminError(''), 3000);
    }
  };

  // Função para entrar no modo de edição de presentes
  const enterGiftEditMode = () => {
    setAdminMode(true);
    setAdminSection('gifts');
    closeAdminModal();
  };

  // Função para abrir o modal de administrador
  const openAdminModal = () => {
    setAdminModalOpen(true);
    // Se já estava autenticado, vai direto para o menu
    if (adminAuthenticated) {
      setAdminSection('menu');
      updateAdminStats();
    } else {
      setAdminSection('login');
    }
  };

  // Função para fechar o modal de administrador
  const closeAdminModal = () => {
    setAdminModalOpen(false);
    setAdminError('');
    
    // Só desautentica se não estiver no modo de edição
    if (!adminMode) {
      setAdminSection('login');
    }
    
    setAdminPassword('');
    setAdminUsername('');
    setNewGift({
      name: '',
      description: '',
      imageurl: '',
      category: 'diversos'
    });
  };
  
  // Função para resetar todas as reservas
  const resetAllReservations = async () => {
    if (window.confirm('Tem certeza que deseja remover TODAS as reservas? Esta ação não pode ser desfeita.')) {
      try {
        await giftService.unreserveAllGifts();
        
        const updatedGifts = gifts.map(gift => ({
          ...gift,
          reserved: false
        }));
        
        setGifts(updatedGifts);
        alert('Todas as reservas foram removidas com sucesso!');
        updateAdminStats();
      } catch (err) {
        alert(`Erro ao resetar reservas: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        console.error("Erro ao resetar reservas:", err);
      }
    }
  };
  
  // Função para exportar dados
  const exportGiftData = () => {
    const dataStr = JSON.stringify(gifts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `lista-presentes-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  // Função para gerar template JSON
  const exportTemplateJSON = () => {
    const template = [
      {
        "name": "Jogo de Panelas",
        "description": "Conjunto completo com 5 panelas antiaderentes",
        "imageurl": "🍳",
        "category": "cozinha"
      },
      {
        "name": "Micro-ondas",
        "description": "Micro-ondas 30 litros com grill",
        "imageurl": "📡",
        "category": "cozinha"
      },
      {
        "name": "Sofá",
        "description": "Sofá 3 lugares cor bege",
        "imageurl": "🛋️",
        "category": "sala"
      },
      {
        "name": "Jogo de Cama",
        "description": "Jogo de cama casal 100% algodão",
        "imageurl": "🛏️",
        "category": "quarto"
      },
      {
        "name": "Toalhas de Banho",
        "description": "Kit com 4 toalhas felpudas",
        "imageurl": "🚿",
        "category": "banheiro"
      },
      {
        "name": "Cesto de Roupa",
        "description": "Cesto organizador para lavanderia",
        "imageurl": "🧺",
        "category": "lavanderia"
      }
    ];
    
    try {
      const dataStr = JSON.stringify(template, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const exportFileName = `template-presentes.json`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = exportFileName;
      linkElement.style.display = 'none';
      
      // Adicionar ao DOM temporariamente
      document.body.appendChild(linkElement);
      
      // Tentar fazer o download
      linkElement.click();
      
      // Remover do DOM e limpar URL
      document.body.removeChild(linkElement);
      window.URL.revokeObjectURL(url);
      
      // Feedback para o usuário
      setTimeout(() => {
        alert(`Template JSON criado!\n\nArquivo: ${exportFileName}\n\nSe o download não iniciou, verifique:\n- Bloqueadores de pop-up\n- Configurações de download do navegador\n- Permissões de arquivo`);
      }, 100);
      
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      
      // Fallback: mostrar o JSON em um modal para copy/paste
      const templateText = JSON.stringify(template, null, 2);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Template JSON - Lista de Presentes</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                pre { background: #f8f8f8; padding: 15px; border-radius: 4px; overflow: auto; }
                .copy-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Template para Importação de Presentes</h2>
                <p>Copie o código abaixo e salve como "template-presentes.json":</p>
                <button class="copy-btn" onclick="copyToClipboard()">Copiar JSON</button>
                <pre id="jsonContent">${templateText}</pre>
                <script>
                  function copyToClipboard() {
                    const content = document.getElementById('jsonContent').textContent;
                    navigator.clipboard.writeText(content).then(() => {
                      alert('JSON copiado para a área de transferência!');
                    });
                  }
                </script>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        alert('Por favor, permita pop-ups e tente novamente, ou copie o template manualmente do console.');
        console.log('Template JSON:', templateText);
      }
    }
  };

  // Função para importar presentes via JSON
  const importGiftsFromJSON = async (file: File) => {
    setIsImporting(true);
    setImportResults(null);
    
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validar se é um array
      if (!Array.isArray(jsonData)) {
        throw new Error('O arquivo JSON deve conter um array de presentes');
      }
      
      const results = {
        success: 0,
        errors: [] as string[],
        total: jsonData.length
      };
      
      // Processar cada presente
      for (let i = 0; i < jsonData.length; i++) {
        const giftData = jsonData[i];
        
        try {
          // Validar campos obrigatórios
          if (!giftData.name || !giftData.description) {
            throw new Error(`Item ${i + 1}: Nome e descrição são obrigatórios`);
          }
          
          // Criar objeto do presente
          const newGiftItem = {
            name: giftData.name.trim(),
            description: giftData.description.trim(),
            imageurl: giftData.imageurl || giftData.imageUrl || '🎁', // Suporta ambos os formatos
            category: giftData.category || 'diversos', // Categoria padrão se não especificada
            reserved: false
          };
          
          // Adicionar ao banco
          const addedGift = await giftService.addGift(newGiftItem);
          
          if (addedGift) {
            results.success++;
            // Adicionar à lista local
            setGifts(prev => [...prev, addedGift]);
          } else {
            throw new Error(`Falha ao salvar no banco de dados`);
          }
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          results.errors.push(`Item ${i + 1}: ${errorMsg}`);
        }
      }
      
      setImportResults(results);
      
      // Atualizar estatísticas
      updateAdminStats();
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao processar arquivo';
      setImportResults({
        success: 0,
        errors: [errorMsg],
        total: 0
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Função para lidar com a seleção de arquivo JSON
  const handleJSONFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('Por favor, selecione um arquivo JSON válido.');
        return;
      }
      
      if (window.confirm(`Deseja importar presentes do arquivo "${file.name}"?\n\nIsto irá adicionar novos itens à lista.`)) {
        importGiftsFromJSON(file);
      }
    }
    
    // Limpar o input
    e.target.value = '';
  };

  // Função para sair do modo de administração
  const exitAdminMode = () => {
    setAdminMode(false);
    setAdminSection('menu');
  };

  // Função para adicionar um novo presente
  const addNewGift = async () => {
    if (!newGift.name || !newGift.description || !newGift.imageurl) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // Se a imagem for um arquivo (Base64), faz upload para o Storage
      if (isBase64Image(newGift.imageurl) && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const filePath = `gift-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const imageUrl = await giftService.uploadImage(file, filePath);
        
        if (imageUrl) {
          newGift.imageurl = imageUrl;
        } else {
          throw new Error("Falha ao fazer upload da imagem");
        }
      }
      
      console.log('Objeto newGift antes de enviar:', newGift);
      
      // Criando um objeto com múltiplas variações do nome do campo de imagem
      const giftData = {
        name: newGift.name,
        description: newGift.description,
        category: newGift.category,
        // Incluindo todas as possíveis variações do campo de imagem
        imageurl: newGift.imageurl,
        image_url: newGift.imageurl,
        imageUrl: newGift.imageurl,
        reserved: false
      };
      
      console.log('Usando o método para adicionar presente');
      
      // Usando a função correta de giftService
      const addedGift = await giftService.addGift(giftData);
      
      if (addedGift) {
        setGifts([...gifts, addedGift]);
        
        // Limpa o formulário para um novo item
        setNewGift({
          name: '',
          description: '',
          imageurl: '',
          category: 'diversos'
        });
        
        alert('Presente adicionado com sucesso!');
        closeModal();
      } else {
        throw new Error("Falha ao adicionar o presente");
      }
    } catch (err) {
      alert(`Erro ao adicionar presente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      console.error("Erro ao adicionar presente:", err);
    }
  };

  // Função para iniciar a edição de um presente
  const startEditGift = (gift: GiftItem) => {
    console.log('Botão de editar clicado para presente:', gift.name, 'ID:', gift.id);
    setEditGift(gift);
    setIsEditing(true);
    setActiveModal(-2); // Usamos -2 para o modal de edição
  };

  // Função para salvar as alterações de um presente
  const saveEditGift = async () => {
    if (!editGift) return;
    
    if (!editGift.name || !editGift.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      // Se a imagem for um arquivo (Base64), faz upload para o Storage
      if (isBase64Image(editGift.imageurl) && editFileInputRef.current?.files?.[0]) {
        const file = editFileInputRef.current.files[0];
        const filePath = `gift-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const imageUrl = await giftService.uploadImage(file, filePath);
        
        if (imageUrl) {
          editGift.imageurl = imageUrl;
        } else {
          throw new Error("Falha ao fazer upload da imagem");
        }
      }
      
      // Criando um novo objeto com os nomes corretos das propriedades
      const giftToUpdate = {
        id: editGift.id,
        name: editGift.name,
        description: editGift.description,
        imageurl: editGift.imageurl,
        category: editGift.category,
        reserved: editGift.reserved,
        reserved_by: editGift.reserved_by,
        reserved_contact: editGift.reserved_contact,
        reserved_at: editGift.reserved_at
      };
      
      console.log('Objeto para atualizar:', giftToUpdate);
      
      const updatedGift = await giftService.updateGift(giftToUpdate);
      
      if (updatedGift) {
        setGifts(gifts.map(gift => 
          gift.id === updatedGift.id ? updatedGift : gift
        ));
        
        alert('Presente atualizado com sucesso!');
        closeModal();
        setIsEditing(false);
        setEditGift(null);
      } else {
        throw new Error("Falha ao atualizar o presente");
      }
    } catch (err) {
      alert(`Erro ao atualizar presente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      console.error("Erro ao atualizar presente:", err);
    }
  };

  // Função para lidar com a mudança nos campos do formulário de edição
  const handleEditGiftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editGift) return;
    
    const { name, value } = e.target;
    setEditGift({
      ...editGift,
      [name]: value
    });
  };

  // Função para excluir um presente
  const deleteGift = async (id: number) => {
    console.log('Botão de excluir clicado para presente ID:', id);
    if (window.confirm('Tem certeza que deseja excluir este presente?')) {
      try {
        const success = await giftService.deleteGift(id);
        
        if (success) {
          setGifts(gifts.filter(gift => gift.id !== id));
          alert('Presente excluído com sucesso!');
        } else {
          throw new Error("Não foi possível excluir o presente");
        }
      } catch (err) {
        alert(`Erro ao excluir presente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        console.error("Erro ao excluir presente:", err);
      }
    }
  };

  // Função para reservar um presente
  const reserveGift = (id: number) => {
    const gift = gifts.find(g => g.id === id);
    if (gift) {
      setSelectedGift(gift);
    }
    setActiveModal(id);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setActiveModal(null);
    setFormSubmitted(false);
    setFormData({
      name: '',
      phone: '',
      message: ''
    });
    setSelectedGift(null);
    setIsEditing(false);
    setEditGift(null);
  };

  // Função para lidar com a mudança nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Função para lidar com a mudança nos campos do formulário de novo presente
  const handleNewGiftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log("Modificando campo:", name, "com valor:", value);  // Adicionando log para debug
    
    setNewGift(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Função para lidar com o upload de arquivo para novo presente
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await convertToBase64(file);
        setNewGift(prev => ({
          ...prev,
          imageurl: base64
        }));
      } catch (error) {
        alert('Erro ao processar a imagem. Tente novamente.');
        console.error('Erro ao converter para Base64:', error);
      }
    }
  };
  
  // Função para lidar com o upload de arquivo para edição de presente
  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editGift) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await convertToBase64(file);
        setEditGift({
          ...editGift,
          imageurl: base64
        });
      } catch (error) {
        alert('Erro ao processar a imagem. Tente novamente.');
        console.error('Erro ao converter para Base64:', error);
      }
    }
  };

  // Função para criar a URL do WhatsApp
  const createWhatsAppUrl = (giftName: string, userName: string, phone: string, message: string) => {
    const baseUrl = 'https://wa.me/5551994495406'; // Substitua pelo número de telefone correto
    
    const text = encodeURIComponent(
      `🤵👰 *CASAMENTO VITORIA & EDUARDO* 💍\n\n` +
      `Olá! Eu gostaria de reservar o presente: *${giftName}*\n\n` +
      `👤 Nome: ${userName}\n` +
      `📱 Telefone: ${phone}\n` +
      (message ? `💌 Mensagem: ${message}\n\n` : '\n') +
      `📅 Data do Casamento: 20/09/2025\n` +
      `📍 Local: Nossoaconchego Eventos - Av. Mendanha, 1495 - Centro - Viamão, RS\n\n` +
      `Enviado através da lista de presentes online.`
    );
    
    return `${baseUrl}?text=${text}`;
  };

  // Função para enviar o formulário de reserva
  const handleSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    
    try {
      // Chama a API para fazer a reserva no banco de dados
      const reservedGift = await giftService.reserveGift(id, {
        name: formData.name,
        contact: formData.phone,
        message: formData.message
      });
      
      if (reservedGift) {
        // Atualiza o estado local após a reserva
        setGifts(gifts.map(gift => 
          gift.id === id ? { ...gift, reserved: true } : gift
        ));
        
        setFormSubmitted(true);
        
        // Para iOS/Safari, redireciona imediatamente
        const gift = gifts.find(g => g.id === id);
        
        if (gift) {
          const whatsappUrl = createWhatsAppUrl(
            gift.name, 
            formData.name, 
            formData.phone, 
            formData.message
          );
          
          // Tenta abrir diretamente (funciona melhor no iOS)
          window.location.href = whatsappUrl;
          
          // Backup: reset do modal após 3 segundos
          setTimeout(() => {
            closeModal();
          }, 3000);
        }
      } else {
        throw new Error("Não foi possível reservar o presente");
      }
    } catch (err) {
      alert(`Erro ao reservar presente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      console.error("Erro ao reservar presente:", err);
    }
  };

  // Adicionar função para verificar a estrutura da tabela
  const checkTableStructure = async () => {
    try {
      const result = await giftService.testTableStructure();
      console.log('Resultado do teste da estrutura:', result);
      
      if (result && result.success) {
        if (result.columns && result.columns.length > 0) {
          const columnList = result.columns as string[];
          const hasCategory = columnList.indexOf('category') !== -1;
          alert(`Colunas na tabela: ${columnList.join(', ')}\n\nColuna 'category' existe: ${hasCategory ? 'SIM ✅' : 'NÃO ❌'}`);
        } else {
          alert('A tabela está vazia. Não foi possível verificar as colunas.');
        }
      } else {
        alert('Falha ao verificar a estrutura da tabela. Veja o console para detalhes.');
      }
    } catch (err) {
      console.error('Erro ao verificar estrutura:', err);
      alert('Erro ao verificar estrutura da tabela');
    }
  };

  // Função para adicionar a coluna category na tabela
  const addCategoryColumn = async () => {
    if (!window.confirm('Deseja adicionar a coluna "category" na tabela gifts? Isso é necessário para que os filtros de categoria funcionem.')) {
      return;
    }

    try {
      // Vamos usar uma abordagem simples: tentar fazer update nos presentes existentes
      console.log('🔧 Adicionando suporte para categoria...');
      
      // Primeiro vamos buscar um presente para ver se já tem a coluna
      const gifts = await giftService.getAllGifts();
      
      if (gifts.length > 0) {
        const firstGift = gifts[0];
        
        // Tentar atualizar o primeiro presente com categoria
        const updateResult = await giftService.updateGift({
          ...firstGift,
          category: firstGift.category || 'diversos'
        });
        
        if (updateResult) {
          alert('✅ Suporte para categoria configurado com sucesso!\n\nAgora você pode usar os filtros de categoria.');
          // Recarregar a lista de presentes
          window.location.reload();
        } else {
          alert('❌ Erro ao configurar categoria. A coluna pode não existir na tabela.\n\nVocê precisará criar a coluna "category" manualmente no Supabase.');
        }
      } else {
        alert('❌ Não há presentes na lista para testar. Adicione um presente primeiro.');
      }
      
    } catch (err) {
      console.error('Erro ao adicionar coluna category:', err);
      alert('❌ Erro ao configurar categoria. Veja o console para detalhes.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8f5f0]/20 to-[#f8f5f0]/40 py-8 px-4">
      {/* Indicador de carregamento */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#3c4d2c]/20 border-t-[#3c4d2c] rounded-full animate-spin mb-4"></div>
            <p className="text-[#3c4d2c] font-medium">Carregando presentes...</p>
          </div>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg max-w-2xl mx-auto my-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-12 relative">
          {/* Elementos decorativos */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#3c4d2c]/5 rounded-full blur-3xl opacity-70 hidden md:block"></div>
          <div className="absolute -top-5 -right-5 w-32 h-32 bg-[#3c4d2c]/5 rounded-full blur-3xl opacity-70 hidden md:block"></div>
          
          {/* Botão discreto para administração */}
          <button 
            onClick={openAdminModal}
            className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity z-10"
            aria-label="Administração"
            title="Painel Administrativo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          
          {adminMode && (
            <div className="fixed top-4 left-0 right-0 z-40 flex justify-center">
              <div className="bg-[#3c4d2c] text-white px-4 py-2 rounded-full text-sm flex items-center shadow-lg animate-pulse">
                <span className="mr-2">Modo de Edição Ativo</span>
                <button 
                  onClick={exitAdminMode}
                  className="bg-white text-[#3c4d2c] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                >
                  X
                </button>
              </div>
            </div>
          )}
          
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-40 h-40 rounded-full bg-[#3c4d2c]/5 blur-3xl"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#3c4d2c] font-bold mb-3 tracking-wide relative z-10" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
              Lista de Presentes
            </h1>
          </div>
          
          <div className="w-24 h-1 bg-[#3c4d2c]/20 mx-auto rounded-full my-6"></div>
          
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-8 relative z-10">
            Sua presença é o nosso maior presente! Mas se você deseja nos presentear, 
            escolha um item da nossa lista ou contribua via PIX.
          </p>
          
          {/* Decoração de linha */}
          <div className="flex items-center justify-center w-full max-w-xl mx-auto opacity-60 mb-8">
            <div className="h-[1px] flex-grow bg-[#3c4d2c]/20"></div>
            <div className="mx-4 text-2xl text-[#3c4d2c]/30">✨</div>
            <div className="h-[1px] flex-grow bg-[#3c4d2c]/20"></div>
          </div>
          
          {/* Cards PIX e botão voltar em formato móvel */}
          <div className="mt-5 flex flex-col md:flex-row gap-5">
            <div className="bg-gradient-to-br from-white to-[#f8f5f0]/60 p-5 rounded-xl shadow-md border border-[#3c4d2c]/10 w-full md:w-1/2 transform transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
              {/* Elemento decorativo */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#3c4d2c]/5 rounded-full blur-xl opacity-70 group-hover:bg-[#3c4d2c]/10 transition-all duration-500"></div>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#3c4d2c]/10 rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-serif text-xl text-[#3c4d2c] font-bold" style={{ textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.05)" }}>PIX</h3>
              </div>
              
              <div className="ml-16 mb-2">
                <p className="text-gray-700 text-sm mb-1">
                  Chave: <span className="font-medium select-all bg-[#3c4d2c]/5 px-2 py-1 rounded-md">601.306.700-73</span>
                </p>
                <p className="text-xs text-gray-600 italic">(CPF - Eduardo da Silva Souza)</p>
              </div>
              
              <div className="mt-3 ml-16">
                <button 
                  onClick={() => {navigator.clipboard.writeText('601.306.700-73')}}
                  className="text-xs text-[#3c4d2c] border border-[#3c4d2c]/30 px-3 py-1.5 rounded-full hover:bg-[#3c4d2c]/10 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copiar Chave
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-[#f8f5f0]/60 p-5 rounded-xl shadow-md border border-[#3c4d2c]/10 w-full md:w-1/2 transform transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
              {/* Elemento decorativo */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#3c4d2c]/5 rounded-full blur-xl opacity-70 group-hover:bg-[#3c4d2c]/10 transition-all duration-500"></div>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#3c4d2c]/10 rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">💌</span>
                </div>
                <h3 className="font-serif text-xl text-[#3c4d2c] font-bold" style={{ textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.05)" }}>Voltar ao Convite</h3>
              </div>
              
              <div className="ml-16 mb-3">
                <p className="text-gray-700 text-sm">
                  Retorne à página principal para ver todos os detalhes do nosso casamento
                </p>
              </div>
              
              <div className="ml-16">
                <Link 
                  to="/" 
                  className="inline-block px-5 py-2.5 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-all duration-300 font-medium text-center text-sm shadow-sm hover:shadow-md transform hover:scale-[1.02] flex items-center justify-center w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retornar ao Convite
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Adicionar seção de busca e filtros */}
        <div className="mb-8 mt-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Campo de busca */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar presente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-[#3c4d2c]/40 focus:border-transparent outline-none shadow-lg transition-all duration-300 hover:shadow-xl"
              />
            </div>
            
            {/* Botão para mostrar/esconder filtros e estatísticas */}
            <div className="w-full md:w-1/2 flex items-center justify-between gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 text-sm bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/95 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="group bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200/70 rounded-xl px-3 py-2 transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md">
                  <div className="flex items-center text-xs font-medium text-green-700">
                    <div className="relative mr-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full block animate-pulse"></span>
                      <span className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-30"></span>
                    </div>
                    <span className="text-green-800 font-bold text-sm">{giftCounts.available}</span>
                    <span className="ml-1 text-green-600">disponíveis</span>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-r from-gray-50/90 to-slate-50/90 backdrop-blur-sm border border-gray-200/70 rounded-xl px-3 py-2 transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md">
                  <div className="flex items-center text-xs font-medium text-gray-600">
                    <div className="relative mr-2">
                      <span className="w-3 h-3 bg-gray-400 rounded-full block"></span>
                    </div>
                    <span className="text-gray-800 font-bold text-sm">{giftCounts.reserved}</span>
                    <span className="ml-1 text-gray-600">reservados</span>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-r from-blue-50/90 to-indigo-50/90 backdrop-blur-sm border border-blue-200/70 rounded-xl px-3 py-2 transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md">
                  <div className="flex items-center text-xs font-medium text-blue-700">
                    <div className="relative mr-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full block"></span>
                    </div>
                    <span className="text-blue-800 font-bold text-sm">{giftCounts.total}</span>
                    <span className="ml-1 text-blue-600">total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtros adicionais (visíveis apenas quando showFilters é true) */}
          {showFilters && (
            <div className="mt-4 p-5 bg-white/80 backdrop-blur-md rounded-xl animate-fadeIn border border-white/50 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filtro de status */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'available' | 'reserved')}
                    className="w-full p-3 bg-white/90 backdrop-blur-sm border border-white/70 rounded-lg focus:ring-2 focus:ring-[#3c4d2c]/40 focus:border-transparent shadow-sm transition-all duration-300"
                  >
                    <option value="all">Todos</option>
                    <option value="available">Disponíveis</option>
                    <option value="reserved">Reservados</option>
                  </select>
                </div>

                {/* Filtro de categoria */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 bg-white/90 backdrop-blur-sm border border-white/70 rounded-lg focus:ring-2 focus:ring-[#3c4d2c]/40 focus:border-transparent shadow-sm transition-all duration-300"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Botão para limpar filtros */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-700"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Resultados da busca */}
          {searchTerm || filterType !== 'all' || selectedCategory !== 'todas' ? (
            <div className="mt-3 text-sm text-gray-600">
              Exibindo {filteredGifts.length} de {gifts.length} presentes
              {selectedCategory !== 'todas' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {categories.find(cat => cat.value === selectedCategory)?.icon} {categories.find(cat => cat.value === selectedCategory)?.label}
                </span>
              )}
              {filteredGifts.length === 0 && (
                <p className="mt-1 text-gray-500 italic">Nenhum presente encontrado com os filtros atuais.</p>
              )}
            </div>
          ) : null}
        </div>

        {/* Grid de presentes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredGifts.map(gift => (
            <div 
              key={gift.id}
              className={`gift-card card-hover ${gift.reserved ? 'bg-white/70' : 'bg-white/85'} backdrop-blur-md rounded-2xl overflow-hidden shadow-elegant transition-all duration-300 transform hover:-translate-y-3 border ${gift.reserved ? 'border-gray-200/50' : 'border-white/60 hover:shadow-2xl hover:border-[#3c4d2c]/30'} relative group`}
            >
              {/* Elemento decorativo aprimorado */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#3c4d2c]/5 rounded-full blur-2xl opacity-70 group-hover:opacity-100 group-hover:bg-[#3c4d2c]/8 transition-all duration-500 z-0"></div>
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/20 rounded-full blur-xl opacity-50 z-0"></div>
              
              {adminMode && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    onClick={() => startEditGift(gift)}
                    className="bg-blue-100/90 backdrop-blur-sm text-blue-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-200/90 transition-all duration-300 shadow-lg border border-blue-200/70 hover:border-blue-300 hover:scale-110"
                    title="Editar presente"
                    style={{ zIndex: 30 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteGift(gift.id)}
                    className="bg-red-100/90 backdrop-blur-sm text-red-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-200/90 transition-all duration-300 shadow-lg border border-red-200/70 hover:border-red-300 hover:scale-110"
                    title="Excluir presente"
                    style={{ zIndex: 30 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="p-6 flex flex-col h-full relative z-10">
                {/* Imagem em destaque na parte superior aprimorada */}
                <div className="mb-5 w-full h-44 rounded-xl overflow-hidden shadow-lg bg-white/90 backdrop-blur-sm flex items-center justify-center p-2 border border-white/50">
                  {isEmoji(gift.imageurl) ? (
                    <div 
                      className="w-full h-full flex items-center justify-center rounded-lg" 
                      style={{ backgroundColor: getEmojiBackground(gift.imageurl) }}
                    >
                      <span className="text-7xl filter drop-shadow-sm">{gift.imageurl}</span>
                    </div>
                  ) : isBase64Image(gift.imageurl) ? (
                    <img 
                      src={gift.imageurl} 
                      alt={gift.name} 
                      className="object-contain h-full w-full transition-transform duration-500 transform group-hover:scale-110 filter drop-shadow-sm" 
                    />
                  ) : (
                    <img 
                      src={gift.imageurl} 
                      alt={gift.name}
                      className="object-contain h-full w-full transition-transform duration-500 transform group-hover:scale-110 filter drop-shadow-sm" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=Imagem+não+encontrada';
                      }}
                    />
                  )}
                </div>
                
                <div className="flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-serif text-[#3c4d2c] font-bold leading-tight flex-1" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.05)" }}>
                      {gift.name}
                    </h3>
                    {gift.category && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full border flex items-center gap-1" 
                            style={{ 
                              backgroundColor: `${categories.find(cat => cat.value === gift.category)?.color === 'orange' ? 'rgb(255 237 213)' :
                                                 categories.find(cat => cat.value === gift.category)?.color === 'blue' ? 'rgb(219 234 254)' :
                                                 categories.find(cat => cat.value === gift.category)?.color === 'purple' ? 'rgb(233 213 255)' :
                                                 categories.find(cat => cat.value === gift.category)?.color === 'cyan' ? 'rgb(207 250 254)' :
                                                 categories.find(cat => cat.value === gift.category)?.color === 'green' ? 'rgb(220 252 231)' :
                                                 'rgb(252 231 243)'}`,
                              color: `${categories.find(cat => cat.value === gift.category)?.color === 'orange' ? 'rgb(154 52 18)' :
                                        categories.find(cat => cat.value === gift.category)?.color === 'blue' ? 'rgb(29 78 216)' :
                                        categories.find(cat => cat.value === gift.category)?.color === 'purple' ? 'rgb(107 33 168)' :
                                        categories.find(cat => cat.value === gift.category)?.color === 'cyan' ? 'rgb(8 145 178)' :
                                        categories.find(cat => cat.value === gift.category)?.color === 'green' ? 'rgb(21 128 61)' :
                                        'rgb(157 23 77)'}`,
                              borderColor: `${categories.find(cat => cat.value === gift.category)?.color === 'orange' ? 'rgb(255 192 120)' :
                                              categories.find(cat => cat.value === gift.category)?.color === 'blue' ? 'rgb(147 197 253)' :
                                              categories.find(cat => cat.value === gift.category)?.color === 'purple' ? 'rgb(196 181 253)' :
                                              categories.find(cat => cat.value === gift.category)?.color === 'cyan' ? 'rgb(165 243 252)' :
                                              categories.find(cat => cat.value === gift.category)?.color === 'green' ? 'rgb(187 247 208)' :
                                              'rgb(244 114 182)'}`
                            }}>
                        <span>{categories.find(cat => cat.value === gift.category)?.icon}</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-5 flex-grow leading-relaxed">{gift.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/30">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-medium shadow-sm ${gift.reserved ? 'bg-gray-100/80 backdrop-blur-sm text-gray-600 border border-gray-200/50' : 'bg-[#3c4d2c]/10 backdrop-blur-sm text-[#3c4d2c] border border-[#3c4d2c]/20'}`}>
                      {gift.reserved ? (
                        <>
                          <svg className="w-3 h-3 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Reservado
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1.5 text-[#3c4d2c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12v-4" />
                          </svg>
                          Disponível
                        </>
                      )}
                    </span>
                    
                    {!gift.reserved && (
                      <button 
                        onClick={() => reserveGift(gift.id)}
                        className="inline-block px-5 py-2.5 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-all duration-300 text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-110 backdrop-blur-sm border border-[#3c4d2c]/20"
                        disabled={adminMode}
                      >
                        Reservar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Card para adicionar novo presente (visível apenas no modo admin) */}
          {adminMode && (
            <div className="gift-card bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-elegant border-2 border-dashed border-[#3c4d2c]/30 hover:border-[#3c4d2c]/50 transition-all duration-300 hover:shadow-xl card-hover">
              <div className="flex flex-col h-full justify-center items-center text-center p-8">
                <div className="w-28 h-28 bg-[#3c4d2c]/5 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 shadow-inner border border-[#3c4d2c]/10">
                  <span className="text-6xl text-[#3c4d2c]/40">+</span>
                </div>
                <h3 className="text-xl font-serif text-[#3c4d2c] font-bold mb-3">Adicionar Presente</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">Clique para adicionar um novo item à lista</p>
                <button 
                  onClick={() => setActiveModal(-1)} // Usamos -1 para identificar o modal de novo presente
                  className="inline-block px-7 py-3 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nota de rodapé */}
        <div className="mt-16 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-32 h-32 rounded-full bg-[#3c4d2c]/5 blur-3xl"></div>
          </div>
          <p className="text-gray-600 italic text-sm relative z-10">
            Agradecemos imensamente por seu carinho e generosidade! ❤️
          </p>
          <div className="w-16 h-0.5 bg-[#3c4d2c]/10 mx-auto rounded-full mt-4"></div>
        </div>
      </div>

      {/* Modal de reserva otimizado para mobile */}
      {activeModal !== null && activeModal >= 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl w-full max-w-md p-7 relative shadow-elegant overflow-hidden animate-scaleIn border border-white/50">
            {/* Elementos decorativos melhorados */}
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#3c4d2c]/5 rounded-full blur-3xl z-0"></div>
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#3c4d2c]/5 rounded-full blur-3xl z-0"></div>
            
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50 backdrop-blur-sm transition-all duration-300 border border-white/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="relative z-10">
              {formSubmitted ? (
                <div className="text-center py-10 px-4">
                  <div className="w-20 h-20 bg-green-100/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg animate-bounce border border-green-200/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-serif text-[#3c4d2c] mb-4 font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.05)" }}>Obrigado!</h2>
                  <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                    Sua reserva foi realizada com sucesso! Se o WhatsApp não abrir automaticamente, clique no botão abaixo:
                  </p>
                  
                  {/* Botão manual para WhatsApp */}
                  {selectedGift && (
                    <a 
                      href={createWhatsAppUrl(
                        selectedGift.name, 
                        formData.name, 
                        formData.phone, 
                        formData.message
                      )} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors text-sm font-medium shadow-lg transform hover:scale-105 mb-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      Abrir WhatsApp
                    </a>
                  )}
                  
                  <div className="mt-4">
                    <button 
                      onClick={closeModal}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-7">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#3c4d2c]/40 to-transparent"></div>
                    <div className="mx-4 w-14 h-14 rounded-full bg-[#3c4d2c]/10 backdrop-blur-sm flex items-center justify-center border border-[#3c4d2c]/20 shadow-sm">
                      <span className="text-3xl filter drop-shadow-sm">🎁</span>
                    </div>
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#3c4d2c]/40 to-transparent"></div>
                  </div>
                  
                  <h2 className="text-2xl font-serif text-[#3c4d2c] mb-6 text-center tracking-wide font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.05)" }}>
                    Reservar Presente
                  </h2>
                  
                  <form onSubmit={(e) => handleSubmit(e, activeModal)} className="space-y-5">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/40 focus:border-transparent text-sm shadow-lg transition-all duration-300"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(DDD) 00000-0000"
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/40 focus:border-transparent text-sm shadow-lg transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">
                        Mensagem (opcional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/40 focus:border-transparent text-sm shadow-lg transition-all duration-300 resize-none"
                        placeholder="Alguma observação especial..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl text-gray-700 hover:bg-white/90 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#3c4d2c] text-white rounded-xl hover:bg-[#2f3c22] transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm border border-[#3c4d2c]/20"
                      >
                        Confirmar Reserva
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para adicionar novo presente */}
      {activeModal === -1 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-5 relative shadow-md overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
            
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="h-[1px] w-10 bg-[#3c4d2c]/30"></div>
                <h2 className="text-xl font-serif text-[#3c4d2c] mx-3 text-center tracking-wide font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                  Adicionar Presente
                </h2>
                <div className="h-[1px] w-10 bg-[#3c4d2c]/30"></div>
              </div>
              
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                
                console.log('Submissão do formulário iniciada');
                
                // Validação manual para garantir que todos os campos sejam enviados corretamente
                const nameInput = document.getElementById('gift-name') as HTMLInputElement;
                const descInput = document.getElementById('gift-description') as HTMLTextAreaElement;
                
                if (!nameInput.value || !descInput.value || !newGift.imageurl) {
                  alert('Por favor, preencha todos os campos obrigatórios.');
                  return;
                }
                
                // Construindo o objeto manualmente para evitar conversões automáticas de nomes
                const giftData = {
                  name: nameInput.value,
                  description: descInput.value,
                  category: newGift.category, // Incluindo a categoria
                  imageurl: newGift.imageurl, // Usando o estado para a imagem
                  imageUrl: newGift.imageurl, // Adicionando todas as variações possíveis
                  image_url: newGift.imageurl, 
                  reserved: false
                };
                
                console.log('Dados coletados do formulário:', giftData);
                
                // Chamando o método inteligente para adicionar presente
                giftService.addGift(giftData)
                  .then(addedGift => {
                    console.log('Resposta da função addGift:', addedGift);
                    
                    if (addedGift) {
                      setGifts(prevGifts => [...prevGifts, addedGift]);
                      
                      // Limpa o formulário
                      setNewGift({
                        name: '',
                        description: '',
                        imageurl: '',
                        category: 'diversos'
                      });
                      
                      // Resetando manualmente os campos do formulário
                      nameInput.value = '';
                      descInput.value = '';
                      
                      alert('Presente adicionado com sucesso!');
                      closeModal();
                    } else {
                      alert('Falha ao adicionar o presente. Verifique o console para mais detalhes.');
                    }
                  })
                  .catch(err => {
                    console.error('Erro ao processar a adição do presente:', err);
                    alert(`Erro ao adicionar presente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
                  });
              }}>
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="gift-name">
                    Nome do Presente*
                  </label>
                  <input
                    type="text"
                    id="gift-name"
                    name="name"
                    value={newGift.name}
                    onChange={handleNewGiftChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="gift-description">
                    Descrição*
                  </label>
                  <textarea
                    id="gift-description"
                    name="description"
                    value={newGift.description}
                    onChange={handleNewGiftChange}
                    rows={2}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="gift-category">
                    Categoria*
                  </label>
                  <select
                    id="gift-category"
                    name="category"
                    value={newGift.category}
                    onChange={handleNewGiftChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  >
                    {categories.filter(cat => cat.value !== 'todas').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Imagem do Presente*
                  </label>
                  <div className="flex flex-col space-y-2">
                    {newGift.imageurl && (
                      <div className="relative w-full h-20 overflow-hidden rounded-md border border-gray-200 mb-2">
                        {isEmoji(newGift.imageurl) ? (
                          <div 
                            className="w-full h-full flex items-center justify-center" 
                            style={{ backgroundColor: getEmojiBackground(newGift.imageurl) }}
                          >
                            <span className="text-3xl">{newGift.imageurl}</span>
                          </div>
                        ) : (
                          <img 
                            src={newGift.imageurl} 
                            alt="Prévia" 
                            className="object-contain w-full h-full" 
                          />
                        )}
                        <button 
                          type="button"
                          onClick={() => setNewGift({...newGift, imageurl: ''})}
                          className="absolute top-1 right-1 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          title="Remover imagem"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span className="text-sm">Carregar imagem</span>
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <input
                      type="text"
                      id="gift-image"
                      name="imageurl"
                      value={isBase64Image(newGift.imageurl) ? '' : newGift.imageurl}
                      onChange={handleNewGiftChange}
                      placeholder="Ou insira um emoji (ex: 🎁)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                    />
                    
                    <p className="text-xs text-gray-500 italic">
                      Você pode fazer upload de uma imagem ou inserir um emoji
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                  >
                    Cancelar
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={checkTableStructure}
                      className="px-4 py-2 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 transition-colors text-xs"
                    >
                      Verificar Tabela
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#3c4d2c] text-white rounded-md hover:bg-[#2f3c22] transition-colors text-xs"
                    >
                      Adicionar Presente
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para editar presente */}
      {activeModal === -2 && editGift && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-5 relative shadow-md overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
            
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="h-[1px] w-10 bg-[#3c4d2c]/30"></div>
                <h2 className="text-xl font-serif text-[#3c4d2c] mx-3 text-center tracking-wide font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                  Editar Presente
                </h2>
                <div className="h-[1px] w-10 bg-[#3c4d2c]/30"></div>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); saveEditGift(); }}>
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="edit-name">
                    Nome do Presente*
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editGift.name}
                    onChange={handleEditGiftChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="edit-description">
                    Descrição*
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editGift.description}
                    onChange={handleEditGiftChange}
                    rows={2}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="edit-category">
                    Categoria*
                  </label>
                  <select
                    id="edit-category"
                    name="category"
                    value={editGift.category || 'diversos'}
                    onChange={handleEditGiftChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  >
                    {categories.filter(cat => cat.value !== 'todas').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Imagem do Presente*
                  </label>
                  <div className="flex flex-col space-y-2">
                    {editGift.imageurl && (
                      <div className="relative w-full h-20 overflow-hidden rounded-md border border-gray-200 mb-2">
                        {isEmoji(editGift.imageurl) ? (
                          <div 
                            className="w-full h-full flex items-center justify-center" 
                            style={{ backgroundColor: getEmojiBackground(editGift.imageurl) }}
                          >
                            <span className="text-3xl">{editGift.imageurl}</span>
                          </div>
                        ) : (
                          <img 
                            src={editGift.imageurl} 
                            alt="Prévia" 
                            className="object-contain w-full h-full" 
                          />
                        )}
                        <button 
                          type="button"
                          onClick={() => setEditGift({...editGift, imageurl: ''})}
                          className="absolute top-1 right-1 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          title="Remover imagem"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span className="text-sm">Carregar imagem</span>
                    </button>
                    
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileUpload}
                      className="hidden"
                    />
                    
                    <input
                      type="text"
                      id="edit-image"
                      name="imageurl"
                      value={isBase64Image(editGift.imageurl) ? '' : editGift.imageurl}
                      onChange={handleEditGiftChange}
                      placeholder="Ou insira um emoji (ex: 🎁)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                    />
                    
                    <p className="text-xs text-gray-500 italic">
                      Você pode fazer upload de uma imagem ou inserir um emoji
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-reserved"
                      name="reserved"
                      checked={editGift.reserved}
                      onChange={(e) => setEditGift({...editGift, reserved: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-gray-700 text-xs font-medium" htmlFor="edit-reserved">
                      Presente já reservado
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3c4d2c] text-white rounded-md hover:bg-[#2f3c22] transition-colors text-xs"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de administração */}
      {adminModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden relative">
            {/* Cabeçalho do modal */}
            <div className="bg-[#3c4d2c] p-4 flex items-center justify-between">
              <h2 className="text-white font-serif text-xl font-bold">
                {adminSection === 'login' ? 'Acesso Restrito' : 
                 adminSection === 'menu' ? 'Painel Administrativo' : 
                 'Gerenciar Presentes'}
              </h2>
              <button
                onClick={closeAdminModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Tela de login */}
              {adminSection === 'login' && (
                <form onSubmit={(e) => { e.preventDefault(); authenticateAdmin(); }} className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#3c4d2c]/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                  
                  {adminError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4 animate-shake">
                      {adminError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="admin-username">
                      Usuário
                    </label>
                    <input
                      type="text"
                      id="admin-username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="admin-password">
                      Senha
                    </label>
                    <input
                      type="password"
                      id="admin-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2.5 mt-3 bg-[#3c4d2c] text-white rounded-md hover:bg-[#2f3c22] transition-colors font-medium"
                  >
                    Entrar
                  </button>
                </form>
              )}
              
              {/* Menu de opções do administrador */}
              {adminSection === 'menu' && (
                <div>
                  {/* Sumário de estatísticas */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#3c4d2c]/5 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-[#3c4d2c]">{adminStats.totalGifts}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="bg-[#3c4d2c]/5 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{adminStats.availableGifts}</div>
                      <div className="text-xs text-gray-600">Disponíveis</div>
                    </div>
                    <div className="bg-[#3c4d2c]/5 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-500">{adminStats.reservedGifts}</div>
                      <div className="text-xs text-gray-600">Reservados</div>
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex flex-col space-y-3">
                                          <button
                        onClick={enterGiftEditMode}
                        className={`w-full py-3 ${adminMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3c4d2c] hover:bg-[#2f3c22]'} text-white rounded-md transition-colors flex items-center justify-center`}
                        disabled={adminMode}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M20 14H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z"></path>
                          <path d="M12 14v7"></path>
                          <path d="M8 21h8"></path>
                        </svg>
                        {adminMode ? 'Modo de Edição Ativo' : 'Gerenciar Lista de Presentes'}
                    </button>
                    
                    <button
                      onClick={resetAllReservations}
                      className="w-full py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 12a9 9 0 0 1-9 9"></path>
                        <path d="M3 12a9 9 0 0 1 9-9"></path>
                        <path d="M21 12a9 9 0 0 0-9-9"></path>
                        <path d="M3 12a9 9 0 0 0 9 9"></path>
                        <path d="M12 12h.01"></path>
                      </svg>
                      Resetar Todas as Reservas
                    </button>
                    
                    {/* Botões de Importação/Exportação */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={exportTemplateJSON}
                          className="py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Baixar Template
                        </button>
                        <button
                          onClick={() => setShowTemplateModal(true)}
                          className="py-2 bg-green-400 text-white rounded-md hover:bg-green-500 transition-colors flex items-center justify-center text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                          </svg>
                          Ver Template
                        </button>
                      </div>
                      
                      <label className="py-2.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center text-xs cursor-pointer">
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleJSONFileUpload}
                          className="hidden"
                          disabled={isImporting}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {isImporting ? 'Importando...' : 'Importar JSON'}
                      </label>
                    </div>
                    
                    <button
                      onClick={exportGiftData}
                      className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Exportar Dados (JSON)
                    </button>

                    {/* Botões de configuração */}
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs text-gray-600 mb-2 text-center">⚙️ Configurações</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={checkTableStructure}
                          className="py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M9 12l2 2 4-4"></path>
                            <circle cx="12" cy="12" r="9"></circle>
                          </svg>
                          Ver Colunas
                        </button>
                        
                        <button
                          onClick={addCategoryColumn}
                          className="py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M12 5v14"></path>
                            <path d="M5 12h14"></path>
                          </svg>
                          Config. Categoria
                        </button>
                      </div>
                    </div>
                    
                    {adminMode && (
                      <button
                        onClick={exitAdminMode}
                        className="w-full py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sair do Modo de Edição
                      </button>
                    )}
                  </div>
                  
                  {/* Data e hora do último login */}
                  {lastAdminLogin && (
                    <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                      Último acesso: {lastAdminLogin.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Resultados da Importação */}
      {importResults && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
            {/* Cabeçalho */}
            <div className={`p-4 ${importResults.success > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              <h2 className="text-white font-serif text-xl font-bold flex items-center">
                {importResults.success > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                )}
                Resultado da Importação
              </h2>
            </div>
            
            {/* Conteúdo */}
            <div className="p-6">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-xs text-gray-600">Sucesso</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResults.errors.length}</div>
                  <div className="text-xs text-gray-600">Erros</div>
                </div>
              </div>
              
              {/* Lista de erros */}
              {importResults.errors.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 mb-2">Erros encontrados:</h3>
                  <div className="max-h-40 overflow-y-auto bg-red-50 rounded-lg p-3">
                    {importResults.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Mensagem de sucesso */}
              {importResults.success > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-700 text-sm">
                    ✅ {importResults.success} presente(s) adicionado(s) com sucesso!
                  </p>
                </div>
              )}
              
              {/* Botão de fechar */}
              <div className="flex justify-end">
                <button
                  onClick={() => setImportResults(null)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Template JSON */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="bg-green-500 p-4 flex items-center justify-between">
              <h2 className="text-white font-serif text-xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Template para Importação JSON
              </h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Conteúdo */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Como usar:</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Copie o código JSON abaixo</li>
                  <li>Salve em um arquivo com extensão <code className="bg-gray-100 px-1 rounded">.json</code> (ex: presentes.json)</li>
                  <li>Edite o arquivo adicionando seus próprios presentes</li>
                  <li>Use o botão "Importar JSON" para enviar o arquivo</li>
                </ol>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Template JSON:</h3>
                  <button
                    onClick={() => {
                      const template = [
                        {
                          "name": "Jogo de Panelas",
                          "description": "Conjunto completo com 5 panelas antiaderentes",
                          "imageurl": "🍳",
                          "category": "cozinha"
                        },
                        {
                          "name": "Micro-ondas",
                          "description": "Micro-ondas 30 litros com grill",
                          "imageurl": "📡",
                          "category": "cozinha"
                        },
                        {
                          "name": "Sofá",
                          "description": "Sofá 3 lugares cor bege",
                          "imageurl": "🛋️",
                          "category": "sala"
                        },
                        {
                          "name": "Jogo de Cama",
                          "description": "Jogo de cama casal 100% algodão",
                          "imageurl": "🛏️",
                          "category": "quarto"
                        },
                        {
                          "name": "Toalhas de Banho",
                          "description": "Kit com 4 toalhas felpudas",
                          "imageurl": "🚿",
                          "category": "banheiro"
                        },
                        {
                          "name": "Cesto de Roupa",
                          "description": "Cesto organizador para lavanderia",
                          "imageurl": "🧺",
                          "category": "lavanderia"
                        }
                      ];
                      
                      const templateText = JSON.stringify(template, null, 2);
                      navigator.clipboard.writeText(templateText).then(() => {
                        alert('Template JSON copiado para a área de transferência!');
                      }).catch(() => {
                        alert('Erro ao copiar. Selecione manualmente o texto abaixo.');
                      });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    📋 Copiar JSON
                  </button>
                </div>
                
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm border max-h-96">
{JSON.stringify([
  {
    "name": "Jogo de Panelas",
    "description": "Conjunto completo com 5 panelas antiaderentes",
    "imageurl": "🍳",
    "category": "cozinha"
  },
  {
    "name": "Micro-ondas",
    "description": "Micro-ondas 30 litros com grill",
    "imageurl": "📡",
    "category": "cozinha"
  },
  {
    "name": "Sofá",
    "description": "Sofá 3 lugares cor bege",
    "imageurl": "🛋️",
    "category": "sala"
  },
  {
    "name": "Jogo de Cama",
    "description": "Jogo de cama casal 100% algodão",
    "imageurl": "🛏️",
    "category": "quarto"
  },
  {
    "name": "Toalhas de Banho",
    "description": "Kit com 4 toalhas felpudas",
    "imageurl": "🚿",
    "category": "banheiro"
  },
  {
    "name": "Cesto de Roupa",
    "description": "Cesto organizador para lavanderia",
    "imageurl": "🧺",
    "category": "lavanderia"
  }
], null, 2)}
                </pre>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">💡 Dicas importantes:</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>name:</strong> Nome do presente (obrigatório)</li>
                  <li><strong>description:</strong> Descrição detalhada (obrigatório)</li>
                  <li><strong>imageurl:</strong> URL da imagem ou emoji (opcional - padrão: 🎁)</li>
                  <li><strong>category:</strong> Categoria do ambiente (opcional - padrão: diversos)</li>
                  <li>Categorias: cozinha, sala, quarto, banheiro, lavanderia, diversos</li>
                  <li>Use emojis como: 🍳 🛋️ 🛏️ 🚿 🧺 🎁</li>
                  <li>Adicione quantos presentes quiser no array</li>
                </ul>
              </div>
              
              {/* Botão de fechar */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftList; 