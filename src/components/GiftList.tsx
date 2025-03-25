import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface GiftItem {
  id: number;
  name: string;
  price: number;
  description: string;
  reserved: boolean;
  icon?: string; // Ícone para representar o presente em vez de imagem
}

const GiftList: React.FC = () => {
  // Lista de presentes
  const [gifts, setGifts] = useState<GiftItem[]>([
    {
      id: 1,
      name: "Liquidificador",
      price: 199.90,
      description: "Liquidificador 5 velocidades com função pulsar",
      reserved: false,
      icon: "🔪"
    },
    {
      id: 2,
      name: "Jogo de Panelas",
      price: 349.90,
      description: "Conjunto com 5 panelas antiaderentes",
      reserved: false,
      icon: "🍳"
    },
    {
      id: 3,
      name: "Jogo de Toalhas",
      price: 129.90,
      description: "Kit com 4 toalhas de banho e 4 de rosto",
      reserved: false,
      icon: "🧖‍♀️"
    },
    {
      id: 4,
      name: "Cafeteira Elétrica",
      price: 189.90,
      description: "Cafeteira com capacidade para 15 xícaras",
      reserved: false,
      icon: "☕"
    },
    {
      id: 5,
      name: "Microondas",
      price: 599.90,
      description: "Microondas 32L com 10 níveis de potência",
      reserved: false,
      icon: "🔥"
    },
    {
      id: 6,
      name: "Ferro de Passar",
      price: 149.90,
      description: "Ferro a vapor com spray e base antiaderente",
      reserved: false,
      icon: "👕"
    },
    {
      id: 7,
      name: "Jogo de Lençóis",
      price: 179.90,
      description: "Jogo de lençóis casal 300 fios 100% algodão",
      reserved: false,
      icon: "🛏️"
    },
    {
      id: 8,
      name: "Louças",
      price: 299.90,
      description: "Conjunto de jantar com 20 peças",
      reserved: false,
      icon: "🍽️"
    },
    {
      id: 9,
      name: "Sanduicheira",
      price: 99.90,
      description: "Sanduicheira com chapas antiaderentes",
      reserved: false,
      icon: "🥪"
    },
    {
      id: 10,
      name: "Ar Condicionado",
      price: 1899.90,
      description: "Ar condicionado Split Inverter 12000 BTUs",
      reserved: false,
      icon: "❄️"
    },
    {
      id: 11,
      name: "Faqueiro",
      price: 249.90,
      description: "Faqueiro em inox com 24 peças",
      reserved: false,
      icon: "🍴"
    },
    {
      id: 12,
      name: "Batedeira",
      price: 279.90,
      description: "Batedeira planetária com 5 velocidades",
      reserved: false,
      icon: "🍰"
    }
  ]);

  // Estado para armazenar localmente os presentes no localStorage
  useEffect(() => {
    // Ao carregar o componente, verifica se há dados no localStorage
    const savedGifts = localStorage.getItem('giftList');
    if (savedGifts) {
      setGifts(JSON.parse(savedGifts));
    }
  }, []);

  // Salva os presentes no localStorage sempre que a lista for atualizada
  useEffect(() => {
    localStorage.setItem('giftList', JSON.stringify(gifts));
  }, [gifts]);

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
  const [newGift, setNewGift] = useState<Omit<GiftItem, 'id' | 'reserved'>>({
    name: '',
    price: 0,
    description: '',
    icon: ''
  });
  // Estado para armazenar o presente que está sendo editado
  const [editGift, setEditGift] = useState<GiftItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Credenciais do administrador (em uma aplicação real, isso seria verificado no servidor)
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "casamento2023";

  // Função para verificar as credenciais do administrador
  const authenticateAdmin = () => {
    if (adminUsername === ADMIN_USERNAME && adminPassword === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setAdminPassword('');
      setAdminUsername('');
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  // Função para abrir o modal de administrador
  const openAdminModal = () => {
    setAdminModalOpen(true);
  };

  // Função para fechar o modal de administrador
  const closeAdminModal = () => {
    setAdminModalOpen(false);
    if (!adminMode) {
      setAdminAuthenticated(false);
    }
    setAdminPassword('');
    setAdminUsername('');
    setNewGift({
      name: '',
      price: 0,
      description: '',
      icon: ''
    });
  };

  // Função para adicionar um novo presente
  const addNewGift = () => {
    if (!newGift.name || !newGift.price || !newGift.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newId = Math.max(...gifts.map(gift => gift.id), 0) + 1;
    
    setGifts([
      ...gifts,
      {
        id: newId,
        ...newGift,
        reserved: false
      }
    ]);
    
    // Limpa o formulário para um novo item
    setNewGift({
      name: '',
      price: 0,
      description: '',
      icon: ''
    });
    
    alert('Presente adicionado com sucesso!');
    closeModal();
  };

  // Função para iniciar a edição de um presente
  const startEditGift = (gift: GiftItem) => {
    setEditGift(gift);
    setIsEditing(true);
    setActiveModal(-2); // Usamos -2 para o modal de edição
  };

  // Função para salvar as alterações de um presente
  const saveEditGift = () => {
    if (!editGift) return;
    
    if (!editGift.name || !editGift.price || !editGift.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setGifts(gifts.map(gift => 
      gift.id === editGift.id ? editGift : gift
    ));
    
    alert('Presente atualizado com sucesso!');
    closeModal();
    setIsEditing(false);
    setEditGift(null);
  };

  // Função para lidar com a mudança nos campos do formulário de edição
  const handleEditGiftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editGift) return;
    
    const { name, value } = e.target;
    setEditGift({
      ...editGift,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    });
  };

  // Função para excluir um presente
  const deleteGift = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este presente?')) {
      setGifts(gifts.filter(gift => gift.id !== id));
      alert('Presente excluído com sucesso!');
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

  // Função para sair do modo de administração
  const exitAdminMode = () => {
    setAdminMode(false);
    setAdminAuthenticated(false);
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
  const handleNewGiftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGift(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  // Função para criar a URL do WhatsApp
  const createWhatsAppUrl = (giftName: string, userName: string, phone: string, message: string) => {
    const baseUrl = 'https://wa.me/5551982465709'; // Substitua pelo número de telefone correto
    
    const text = encodeURIComponent(
      `Olá! Eu gostaria de reservar o presente: *${giftName}*\n\n` +
      `Nome: ${userName}\n` +
      `Telefone: ${phone}\n` +
      (message ? `Mensagem: ${message}\n\n` : '\n') +
      `Enviado através da lista de presentes online.`
    );
    
    return `${baseUrl}?text=${text}`;
  };

  // Função para enviar o formulário de reserva
  const handleSubmit = (e: React.FormEvent, id: number) => {
    e.preventDefault();
    
    // Atualizamos o estado local para marcar como reservado
    setGifts(gifts.map(gift => 
      gift.id === id ? { ...gift, reserved: true } : gift
    ));
    
    setFormSubmitted(true);
    
    // Buscamos as informações do presente
    const gift = gifts.find(g => g.id === id);
    
    if (gift) {
      // Após 1,5 segundos, redireciona para o WhatsApp
      setTimeout(() => {
        const whatsappUrl = createWhatsAppUrl(
          gift.name, 
          formData.name, 
          formData.phone, 
          formData.message
        );
        window.open(whatsappUrl, '_blank');
        closeModal();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8f5f0]/30 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8 relative">
          {/* Botão discreto para administração */}
          <button 
            onClick={openAdminModal}
            className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Administração"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          
          {adminMode && (
            <div className="fixed top-4 left-0 right-0 z-40 flex justify-center">
              <div className="bg-[#3c4d2c] text-white px-4 py-2 rounded-full text-sm flex items-center">
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
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#3c4d2c] font-bold mb-3" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
            Lista de Presentes
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            Sua presença é o nosso maior presente! Mas se você deseja nos presentear, 
            escolha um item da nossa lista ou contribua via PIX.
          </p>
          
          {/* Cards PIX e botão voltar em formato móvel */}
          <div className="mt-5 flex flex-col gap-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#3c4d2c]/10 w-full">
              <h3 className="font-serif text-lg text-[#3c4d2c] font-bold mb-1">PIX</h3>
              <p className="text-gray-700 text-sm mb-1">
                Chave: <span className="font-medium">601.306.700-73</span>
              </p>
              <p className="text-xs text-gray-600">(CPF - Eduardo da Silva Souza)</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#3c4d2c]/10 w-full">
              <h3 className="font-serif text-lg text-[#3c4d2c] font-bold mb-1">Voltar ao Convite</h3>
              <Link 
                to="/" 
                className="inline-block w-full py-2 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-colors font-medium mt-1 text-center text-sm"
              >
                Retornar ao Convite
              </Link>
            </div>
          </div>
        </div>

        {/* Grid de presentes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {gifts.map(gift => (
            <div 
              key={gift.id}
              className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all transform hover:-translate-y-1 border ${gift.reserved ? 'border-gray-200 opacity-60' : 'border-[#3c4d2c]/10 hover:shadow-md'} relative`}
            >
              {adminMode && (
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <button
                    onClick={() => startEditGift(gift)}
                    className="bg-blue-100 text-blue-500 w-6 h-6 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                    title="Editar presente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteGift(gift.id)}
                    className="bg-red-100 text-red-500 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    title="Excluir presente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <span className="text-4xl mr-3">{gift.icon}</span>
                  <h3 className="text-lg font-serif text-[#3c4d2c] font-bold">{gift.name}</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">{gift.description}</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-base sm:text-lg text-[#3c4d2c]">R$ {gift.price.toFixed(2)}</p>
                  {gift.reserved ? (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                      Reservado ✓
                    </span>
                  ) : (
                    <button 
                      onClick={() => reserveGift(gift.id)}
                      className="inline-block px-3 py-1 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-colors text-xs font-medium"
                      disabled={adminMode}
                    >
                      Reservar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Card para adicionar novo presente (visível apenas no modo admin) */}
          {adminMode && (
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-dashed border-gray-300 hover:border-[#3c4d2c]/30 p-4">
              <div className="flex flex-col h-full justify-center items-center text-center">
                <span className="text-4xl mb-2">➕</span>
                <h3 className="text-lg font-serif text-[#3c4d2c] font-bold mb-1">Adicionar Presente</h3>
                <p className="text-gray-500 text-sm mb-3">Clique para adicionar um novo item à lista</p>
                <button 
                  onClick={() => setActiveModal(-1)} // Usamos -1 para identificar o modal de novo presente
                  className="inline-block px-3 py-1 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-colors text-xs font-medium"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nota de rodapé */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 italic text-sm">
            Agradecemos imensamente por seu carinho e generosidade! ❤️
          </p>
        </div>
      </div>

      {/* Modal de reserva otimizado para mobile */}
      {activeModal !== null && activeModal >= 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-5 relative shadow-md overflow-hidden">
            {/* Elemento decorativo superior */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
            {/* Elemento decorativo inferior */}
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
              {formSubmitted ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  <h2 className="text-xl font-serif text-[#3c4d2c] mb-3 font-bold">Obrigado!</h2>
                  <p className="text-gray-700 mb-4 text-sm">
                    Sua reserva foi realizada com sucesso. Você será redirecionado para o WhatsApp em instantes...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-[1px] w-10 bg-[#3c4d2c]/30"></div>
                    <h2 className="text-xl font-serif text-[#3c4d2c] mx-3 text-center tracking-wide font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                      Reservar Presente
                    </h2>
                    <div className="h-[1px] w-10 bg-[#3c4d2c]/30"></div>
                  </div>
                  
                  <form onSubmit={(e) => handleSubmit(e, activeModal)}>
                    <div className="mb-3">
                      <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="name">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="phone">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="message">
                        Mensagem (opcional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                      ></textarea>
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
              
              <form onSubmit={(e) => { e.preventDefault(); addNewGift(); }}>
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
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="gift-price">
                    Preço (R$)*
                  </label>
                  <input
                    type="number"
                    id="gift-price"
                    name="price"
                    value={newGift.price || ''}
                    onChange={handleNewGiftChange}
                    step="0.01"
                    min="0"
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
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="gift-icon">
                    Emoji (opcional)
                  </label>
                  <input
                    type="text"
                    id="gift-icon"
                    name="icon"
                    value={newGift.icon}
                    onChange={handleNewGiftChange}
                    placeholder="Ex: 🎁 🍽️ 🛋️"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  />
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
                    Adicionar Presente
                  </button>
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
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="edit-price">
                    Preço (R$)*
                  </label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    value={editGift.price || ''}
                    onChange={handleEditGiftChange}
                    step="0.01"
                    min="0"
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
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="edit-icon">
                    Emoji (opcional)
                  </label>
                  <input
                    type="text"
                    id="edit-icon"
                    name="icon"
                    value={editGift.icon || ''}
                    onChange={handleEditGiftChange}
                    placeholder="Ex: 🎁 🍽️ 🛋️"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                  />
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-5 relative shadow-md overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
            
            <button
              onClick={closeAdminModal}
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
                  Área do Administrador
                </h2>
                <div className="h-[1px] w-10 bg-[#3c4d2c]/30"></div>
              </div>
              
              {!adminAuthenticated ? (
                <form onSubmit={(e) => { e.preventDefault(); authenticateAdmin(); }}>
                  <div className="mb-3">
                    <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="admin-username">
                      Usuário
                    </label>
                    <input
                      type="text"
                      id="admin-username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="admin-password">
                      Senha
                    </label>
                    <input
                      type="password"
                      id="admin-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={closeAdminModal}
                      className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#3c4d2c] text-white rounded-md hover:bg-[#2f3c22] transition-colors text-xs"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-gray-700 mb-4 text-sm">
                    Selecione a ação que deseja realizar:
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { setAdminMode(true); closeAdminModal(); }}
                      className={`w-full py-2 ${adminMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3c4d2c] hover:bg-[#2f3c22]'} text-white rounded-md transition-colors text-sm`}
                      disabled={adminMode}
                    >
                      {adminMode ? 'Modo de Edição Ativo' : 'Gerenciar Lista de Presentes'}
                    </button>
                    
                    {adminMode && (
                      <button
                        onClick={exitAdminMode}
                        className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                      >
                        Sair do Modo de Edição
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftList; 