import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Heart, Gift, X, ChevronDown, Book } from "lucide-react";
import { Link } from 'react-router-dom';
import './components/GiftList.css'; // Importando CSS para as animações

function App() {
  const [activeModal, setActiveModal] = useState<'location' | 'rsvp' | 'gifts' | null>(null);
  const manualSectionRef = useRef<HTMLDivElement>(null);
  
  // Estados para o formulário de confirmação de presença
  const [rsvpFormData, setRsvpFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [rsvpFormSubmitted, setRsvpFormSubmitted] = useState(false);
  
  // Estado para controlar a cópia do PIX
  const [pixCopied, setPixCopied] = useState(false);
  
  const [countdown, setCountdown] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0
  });

  // Data do evento - 20 de Setembro de 2025 às 16h
  // No JavaScript, os meses começam do 0 (janeiro = 0, setembro = 8)
  const eventDate = new Date(2025, 8, 20, 16, 0, 0).getTime();

  // useEffect para bloquear/desbloquear scroll quando modal está ativo
  useEffect(() => {
    if (activeModal) {
      // Bloqueia o scroll da página de fundo
      document.body.style.overflow = 'hidden';
    } else {
      // Restaura o scroll normal
      document.body.style.overflow = 'unset';
    }

    // Cleanup: sempre restaura o scroll quando o componente é desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  // Atualiza o contador a cada segundo
  useEffect(() => {
    // Calcula o tempo restante imediatamente ao montar o componente
    const calcularTempoRestante = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;
      
      if (distance < 0) {
        setCountdown({
          dias: 0,
          horas: 0,
          minutos: 0,
          segundos: 0
        });
        return false; // Retorna false se o evento já passou
      } else {
        setCountdown({
          dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
          horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          segundos: Math.floor((distance % (1000 * 60)) / 1000)
        });
        return true; // Retorna true se o evento ainda está no futuro
      }
    };

    // Calcula imediatamente ao montar
    calcularTempoRestante();
    
    // Configura o intervalo
    const timer = setInterval(() => {
      const continuarContagem = calcularTempoRestante();
      // Se o evento já passou, limpa o intervalo
      if (!continuarContagem) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]); // Adiciona eventDate como dependência

  // Função para lidar com mudanças no formulário de RSVP
  const handleRsvpInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRsvpFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para criar a URL do WhatsApp com os dados do formulário RSVP
  const createRsvpWhatsAppUrl = () => {
    const baseUrl = 'https://wa.me/5551994495406';
    
    const text = encodeURIComponent(
      `*CONFIRMAÇÃO DE PRESENÇA - CASAMENTO VITÓRIA & EDUARDO*\n\n` +
      `👤 *Nome:* ${rsvpFormData.name}\n` +
      `📱 *Telefone:* ${rsvpFormData.phone}\n` +
      (rsvpFormData.message ? `💬 *Mensagem:* ${rsvpFormData.message}\n\n` : '\n') +
      `📅 *Data:* 20 de Setembro de 2025\n` +
      `🕐 *Horário:* 16:00h\n` +
      `📍 *Local:* Nossoaconchego Eventos\n` +
      `💰 *Valor:* R$ 80,00 por pessoa\n\n` +
      `Enviado através do convite online.`
    );
    
    return `${baseUrl}?text=${text}`;
  };

  // Função para submeter o formulário de RSVP
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rsvpFormData.name || !rsvpFormData.phone) {
      alert('Por favor, preencha pelo menos o nome e telefone.');
      return;
    }
    
    setRsvpFormSubmitted(true);
    
    // Para iOS/Safari, redireciona imediatamente
    const whatsappUrl = createRsvpWhatsAppUrl();
    
    // Tenta abrir diretamente (funciona melhor no iOS)
    window.location.href = whatsappUrl;
    
    // Backup: se não funcionar, mostra botão manual
    setTimeout(() => {
      // Este timeout é apenas para resetar o modal, não para redirecionamento
      handleCloseModal();
    }, 3000);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    // Reset do formulário de RSVP
    setRsvpFormData({
      name: '',
      phone: '',
      message: ''
    });
    setRsvpFormSubmitted(false);
    // Reset do estado de PIX copiado
    setPixCopied(false);
  };

  const scrollToManual = () => {
    manualSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Função para copiar a chave PIX
  const copyPixKey = async () => {
    const pixKey = '601.306.700-73';
    try {
      await navigator.clipboard.writeText(pixKey);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000); // Remove o feedback após 3 segundos
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = pixKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;

    const modalContent = {
      location: {
        title: 'Local da Celebração',
        content: (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-3xl font-serif text-[#3c4d2c] tracking-wide mb-1 font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                Nossoaconchego eventos
              </p>
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#3c4d2c]/40 to-transparent mx-auto mt-2"></div>
            </div>
            <div className="text-center">
              <p className="font-sans text-sm mb-1">Av. Mendanha, 1495</p>
              <p className="font-sans text-sm">Centro - Viamão, RS</p>
            </div>
            <div className="flex justify-center">
              <a 
                href="https://maps.google.com/?q=Av.+Mendanha,+1495,+Centro,+Viamão,+RS,+Brasil" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-all duration-300 font-sans text-sm transform hover:scale-105 shadow-md font-medium"
              >
                Ver no Mapa
              </a>
            </div>
          </div>
        )
      },
      rsvp: {
        title: 'Confirmar Presença',
        content: (
          <div className="space-y-4 font-sans text-sm">
            {rsvpFormSubmitted ? (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-serif text-[#3c4d2c] mb-3 font-bold">Obrigado!</h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Se o WhatsApp não abrir automaticamente, clique no botão abaixo:
                </p>
                
                <a 
                  href={createRsvpWhatsAppUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors text-sm font-medium shadow-lg transform hover:scale-105 mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Abrir WhatsApp
                </a>
                
                <div className="mt-4">
                  <button 
                    onClick={handleCloseModal}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-4 text-center">Para confirmar sua presença, preencha os dados abaixo:</p>
                
                <form onSubmit={handleRsvpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1.5" htmlFor="rsvp-name">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="rsvp-name"
                      name="name"
                      value={rsvpFormData.name}
                      onChange={handleRsvpInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 focus:border-transparent text-sm shadow-sm"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1.5" htmlFor="rsvp-phone">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="rsvp-phone"
                      name="phone"
                      value={rsvpFormData.phone}
                      onChange={handleRsvpInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 focus:border-transparent text-sm shadow-sm"
                      placeholder="(DDD) 00000-0000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1.5" htmlFor="rsvp-message">
                      Mensagem (opcional)
                    </label>
                    <textarea
                      id="rsvp-message"
                      name="message"
                      value={rsvpFormData.message}
                      onChange={handleRsvpInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c4d2c]/50 focus:border-transparent text-sm shadow-sm"
                      placeholder="Alguma observação ou mensagem especial..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors text-sm font-medium shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      Confirmar via WhatsApp
                    </button>
                  </div>
                </form>
                
                {/* Seção PIX - Nova seção adicionada */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50/90 to-emerald-50/90 border border-green-200/70 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <span className="text-xl">💰</span>
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-green-800">PIX - Pagamento para Confirmação</h3>
                        <p className="text-xs text-green-600">Eduardo da Silva Souza</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-3 bg-white/60 rounded-lg border border-green-200/40">
                    <p className="text-sm text-gray-700 text-center font-medium">
                      ⚠️ <span className="font-bold text-green-800">Faça o pagamento via PIX para confirmar sua presença</span>
                    </p>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      Valor: <span className="font-bold text-green-700">R$ 80,00 por pessoa</span> • Prazo: até 15/08
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-200/50">
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Chave PIX:</p>
                      <p className="text-sm font-mono font-medium text-gray-800 select-all">601.306.700-73</p>
                    </div>
                    <button
                      onClick={copyPixKey}
                      className={`ml-3 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                        pixCopied 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                      }`}
                    >
                      {pixCopied ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                          Copiado!
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-3 p-2 bg-yellow-50/80 border border-yellow-200/60 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center font-medium">
                      📝 Após o pagamento, envie o comprovante pelo WhatsApp
                    </p>
                  </div>
                  
                  
                </div>
                
                <div className="mt-6 p-4 bg-[#f8f5f0] rounded-lg">
                  <p className="font-serif text-base font-bold text-[#3c4d2c]">Informações importantes:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Valor: <span className="font-medium">R$ 80,00</span> por pessoa</li>
                    <li>Prazo: até <span className="font-medium">15/08</span></li>
                    <li>Inclui: Rodízio completo de pizzas</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )
      },
      gifts: {
        title: 'Lista de Presentes',
        content: (
          <div className="space-y-4 font-sans text-sm">
            <p className="mb-4">Escolhemos duas opções para presentear:</p>
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg mb-2 font-bold text-[#3c4d2c]">Lista Virtual</h3>
                <a 
                  href="https://www.querodecasamento.com.br/lista-de-casamento/eduardoevitoria2025"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCloseModal}
                  className="inline-block px-6 py-2 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-colors font-medium"
                >
                  Ver Lista Online  
                </a>
              </div>
              <div>
                <h3 className="font-serif text-lg mb-2 font-bold text-[#3c4d2c]">PIX</h3>
                <p>Chave: <span className="font-medium">601.306.700-73</span></p>
                <p className="text-sm text-gray-600 mt-1">(CPF - Eduardo da Silva Souza)</p>
              </div>
            </div>
          </div>
        )
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
        onClick={handleCloseModal}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-elegant overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Elemento decorativo superior */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
          {/* Elemento decorativo inferior */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f8f5f0]/50 rounded-full blur-2xl z-0"></div>
          
          <button
            onClick={handleCloseModal}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <X size={24} />
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="h-[1px] w-12 bg-[#3c4d2c]/30"></div>
              <h2 className="text-4xl font-serif text-[#3c4d2c] mx-4 text-center drop-shadow-sm tracking-wider font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                {modalContent[activeModal].title}
              </h2>
              <div className="h-[1px] w-12 bg-[#3c4d2c]/30"></div>
            </div>
            {modalContent[activeModal].content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen md:bg-[url('/background.jpg')] bg-[url('/background.jpg')] bg-cover bg-center bg-fixed">
      <div className="flex justify-center items-center min-h-screen p-0 md:py-8 md:px-4">
        <div className="relative w-full md:w-auto md:max-w-md overflow-hidden md:rounded-lg bg-[url('/background.jpg')] bg-cover bg-center shadow-elegant">
          
          {/* Camada de textura de fundo */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-white/8"></div>
            
            {/* Textura principal - manchas grandes orgânicas */}
            <div className="absolute inset-0 texture-olive-stains-large opacity-75 animate-texture"></div>
            
            {/* Textura secundária - manchas médias */}
            <div className="absolute inset-0 texture-olive-stains-medium opacity-50"></div>
            
            {/* Camada adicional de manchas rústicas grandes */}
            <div className="absolute inset-0 opacity-35" style={{
              backgroundImage: `
                radial-gradient(ellipse 200px 120px at 40% 70%, rgba(85,107,47,0.1) 35%, transparent 70%),
                radial-gradient(ellipse 160px 240px at 80% 20%, rgba(107,142,35,0.08) 40%, transparent 75%)
              `,
              backgroundSize: '600px 500px, 550px 600px'
            }}></div>
            
            {/* Gradiente suave para não interferir na legibilidade */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/2 to-transparent"></div>
            
            {/* Efeito de brilho sutil */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent"></div>
          </div>

          {/* Flores decorativas no canto superior esquerdo */}
          <div className="absolute -top-32 -left-72 w-96 h-96 md:w-80 md:h-80 z-30 pointer-events-none overflow-visible">
            <picture>
              {/* Versão para dispositivos móveis - um pouco menor */}
              <source media="(max-width: 768px)" srcSet="/images/flores.png" />
              {/* Versão para desktop - um pouco maior */}
              <source media="(min-width: 769px)" srcSet="/images/flores.png" />
              <img 
                src="/images/flores.png" 
                alt="Flores decorativas" 
                className="w-full h-full object-contain origin-top-left transform -rotate--6 scale-125 select-none opacity-95"
                style={{ filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.2))" }}
              />
            </picture>
          </div>
          
          <div className="absolute top-6 right-6 md:right-8 max-w-[200px] z-30">
            <div className="text-right text-sm italic text-[#3c4d2c] font-serif">
              "Para que todos vejam, e saibam, e<br />
              considerem, e juntamente entendam
              <br />
              que a mão do Senhor fez isso."
              <br />
              <span className="mt-1 block">Isaías 41:20</span>
            </div>
          </div>

          <div className="relative z-20 flex min-h-screen md:min-h-[700px] flex-col items-center justify-between px-8 py-10 text-center">
            <div className="mb-8 mt-20">
              <h1
                className="font-script text-7xl font-normal tracking-wide text-[#3c4d2c]"
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Vitória
              </h1>
              <p className="my-2 text-2xl text-[#3c4d2c] font-script">&</p>
              <h1
                className="font-script text-7xl font-normal tracking-wide text-[#3c4d2c]"
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Eduardo
              </h1>
            </div>

            <div className="mb-8 flex flex-col items-center">
              {/* Container principal com efeito de cartão */}
              <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-white/70 transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
                {/* Efeitos decorativos de fundo */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/90 rounded-full blur-md z-0"></div>
                <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-[#3c4d2c]/10 rounded-full blur-xl z-0"></div>
                
                {/* Borda interna decorativa */}
                <div className="absolute inset-2 border border-[#3c4d2c]/10 rounded-xl z-0"></div>
                
                {/* Linha decorativa superior */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#3c4d2c]/40 to-transparent mb-4 relative z-10"></div>
                
                {/* SÁBADO com detalhe */}
                <div className="relative mb-2 z-10">
                  <div className="absolute inset-0 bg-[#3c4d2c]/5 rounded-lg blur-sm"></div>
                  <p className="text-sm font-sans font-medium tracking-[0.25em] text-[#3c4d2c] bg-white/80 rounded-lg py-1.5 px-5 shadow-inner relative">
                    <span className="relative inline-block">
                      <span className="absolute -left-3 top-1/2 w-2 h-2 rounded-full bg-[#3c4d2c]/30 transform -translate-y-1/2"></span>
                      SÁBADO
                      <span className="absolute -right-3 top-1/2 w-2 h-2 rounded-full bg-[#3c4d2c]/30 transform -translate-y-1/2"></span>
                    </span>
                  </p>
                </div>
                
                {/* Número do dia com destaque */}
                <div className="my-3 relative z-10">
                  <div className="absolute inset-0 bg-[#3c4d2c]/5 rounded-full blur-lg"></div>
                  <p className="text-7xl font-script text-[#3c4d2c] font-bold relative" 
                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.1), 0 0 20px rgba(255,255,255,0.8)" }}>
                    20
                  </p>
                  {/* Detalhe ornamental ao redor do número */}
                  <div className="absolute -inset-4 border-2 border-[#3c4d2c]/10 rounded-full opacity-70 -z-10"></div>
                </div>
                
                {/* Horário com detalhe */}
                <div className="mt-2 mb-3 relative z-10">
                  <div className="absolute inset-0 bg-[#3c4d2c]/5 rounded-lg blur-sm"></div>
                  <p className="text-sm font-sans font-medium tracking-[0.25em] text-[#3c4d2c] bg-white/80 rounded-lg py-1.5 px-5 shadow-inner relative">
                    <span className="relative inline-block">
                      <span className="absolute -left-3 top-1/2 w-2 h-2 rounded-full bg-[#3c4d2c]/30 transform -translate-y-1/2"></span>
                      16H
                      <span className="absolute -right-3 top-1/2 w-2 h-2 rounded-full bg-[#3c4d2c]/30 transform -translate-y-1/2"></span>
                    </span>
                  </p>
                </div>
                
                {/* Linha decorativa inferior */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#3c4d2c]/40 to-transparent mt-4 mb-4 relative z-10"></div>
                
                {/* Mês e ano em layout diferenciado */}
                <div className="flex justify-center items-center gap-3 bg-white/80 rounded-full px-5 py-2 shadow-inner relative z-10 mx-auto max-w-fit">
                  <span className="font-sans font-medium tracking-[0.2em] text-sm text-[#3c4d2c] relative">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-[#3c4d2c]/20 to-transparent"></span>
                    SETEMBRO
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3c4d2c]/40"></div>
                  <span className="font-sans font-medium tracking-[0.2em] text-sm text-[#3c4d2c] relative">
                    2025
                    <span className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-[#3c4d2c]/20 to-transparent"></span>
                  </span>
                </div>
                
                {/* Imagem da planta decorativa posicionada corretamente */}
                <div className="absolute -right-10 -bottom-5 w-32 h-32 pointer-events-none">
                  <img 
                    src="/images/planta-removebg-preview.png" 
                    alt="Decoração botânica" 
                    className="w-full h-full object-contain select-none transform rotate-12"
                    style={{ filter: "drop-shadow(0 2px 6px rgba(60,77,44,0.2))", animation: "float 6s ease-in-out infinite" }}
                  />
                </div>
                
                {/* Decoração floral adicional no lado oposto */}
                <div className="absolute -left-8 -top-6 w-28 h-28 pointer-events-none opacity-75">
                  <img 
                    src="/images/flores.png" 
                    alt="Decoração floral" 
                    className="w-full h-full object-contain select-none transform rotate-[330deg] scale-90"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(60,77,44,0.15))", animation: "float 7s ease-in-out infinite reverse" }}
                  />
                </div>
                
                {/* Detalhe decorativo sutil */}
                <div className="absolute top-1/2 left-1/2 w-32 h-32 transform -translate-x-1/2 -translate-y-1/2 border border-[#3c4d2c]/5 rounded-full opacity-50 -z-5"></div>
                <div className="absolute top-1/2 left-1/2 w-40 h-40 transform -translate-x-1/2 -translate-y-1/2 border border-[#3c4d2c]/5 rounded-full opacity-30 -z-5"></div>
              </div>
            </div>

            {/* Contador regressivo */}
            <div className="mb-6 bg-gradient-to-r from-white/70 to-white/60 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/30">
              <p className="text-xs font-sans uppercase tracking-widest text-[#3c4d2c] mb-3 font-medium">Contagem Regressiva</p>
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center">
                  <div className="bg-white/80 rounded-lg w-16 h-16 flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3c4d2c]/20 to-[#3c4d2c]/40"></div>
                    <span className="text-3xl font-script text-[#3c4d2c] drop-shadow-sm">{countdown.dias}</span>
                  </div>
                  <span className="text-xs mt-2 text-gray-700 font-sans tracking-wider uppercase">dias</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/80 rounded-lg w-16 h-16 flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3c4d2c]/20 to-[#3c4d2c]/40"></div>
                    <span className="text-3xl font-script text-[#3c4d2c] drop-shadow-sm">{countdown.horas}</span>
                  </div>
                  <span className="text-xs mt-2 text-gray-700 font-sans tracking-wider uppercase">horas</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/80 rounded-lg w-16 h-16 flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3c4d2c]/20 to-[#3c4d2c]/40"></div>
                    <span className="text-3xl font-script text-[#3c4d2c] drop-shadow-sm">{countdown.minutos}</span>
                  </div>
                  <span className="text-xs mt-2 text-gray-700 font-sans tracking-wider uppercase">min</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white/80 rounded-lg w-16 h-16 flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3c4d2c]/20 to-[#3c4d2c]/40"></div>
                    <span className="text-3xl font-script text-[#3c4d2c] drop-shadow-sm">{countdown.segundos}</span>
                  </div>
                  <span className="text-xs mt-2 text-gray-700 font-sans tracking-wider uppercase">seg</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6 w-full max-w-xs mx-auto relative">
              <button 
                onClick={() => setActiveModal('location')}
                className="flex flex-col items-center group relative"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#3c4d2c] bg-[#3c4d2c] shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group-hover:bg-white">
                  <MapPin className="h-8 w-8 text-white group-hover:text-[#3c4d2c] transition-colors duration-300" />
                </div>
                <p className="mt-3 text-xs font-sans font-light tracking-wider text-gray-700 relative z-30">LOCAL</p>
              </button>
              
              {/* Flores abaixo do botão LOCAL - posicionada no grid */}
              <div className="absolute top-0 -left-60 w-60 h-60 z-20 pointer-events-none overflow-visible">
                <img 
                  src="/images/flores.png" 
                  alt="Flores decorativas" 
                  className="w-full h-full object-contain origin-top-left transform rotate-82 scale-150 select-none opacity-90"
                  style={{ filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.2))" }}
                />
              </div>

              <button 
                onClick={() => setActiveModal('rsvp')}
                className="flex flex-col items-center group"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#3c4d2c] bg-[#3c4d2c] shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group-hover:bg-white">
                  <Heart className="h-8 w-8 text-white group-hover:text-[#3c4d2c] transition-colors duration-300" />
                </div>
                <p className="mt-3 text-xs font-sans font-light tracking-wider text-gray-700">
                  CONFIRMAÇÃO
                  <br />
                  DE PRESENÇA
                </p>
              </button>

              <button 
                onClick={() => setActiveModal('gifts')}
                className="flex flex-col items-center group"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#3c4d2c] bg-[#3c4d2c] shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group-hover:bg-white">
                  <Gift className="h-8 w-8 text-white group-hover:text-[#3c4d2c] transition-colors duration-300" />
                </div>
                <p className="mt-3 text-xs font-sans font-light tracking-wider text-gray-700">
                  SUGESTÕES DE
                  <br />
                  PRESENTES
                </p>
              </button>
            </div>

            {/* Segunda imagem de flores - posicionada após os botões */}
            <div className="absolute bottom-20 right-0 w-60 h-60 md:w-72 md:h-72 z-30 pointer-events-none overflow-visible">
              <picture>
                <source media="(max-width: 768px)" srcSet="/images/flores.png" />
                <source media="(min-width: 769px)" srcSet="/images/flores.png" />
                <img 
                  src="/images/flores.png" 
                  alt="Flores decorativas" 
                  className="w-full h-full object-contain origin-bottom-right transform rotate-180 scale-125 select-none opacity-90"
                  style={{ filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.2))" }}
                />
              </picture>
            </div>

            <div className="mt-10 animate-bounce">
              <button 
                onClick={scrollToManual}
                className="flex flex-col items-center group transition-all duration-300 hover:scale-110"
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#3c4d2c] bg-white shadow-md hover:shadow-lg transition-all duration-300 group-hover:bg-[#3c4d2c]">
                  <div className="absolute inset-0 bg-[#3c4d2c]/10 rounded-full blur-sm -z-10"></div>
                  <ChevronDown className="h-6 w-6 text-[#3c4d2c] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="mt-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-[#3c4d2c]/10">
                  <p className="text-xs font-sans font-medium tracking-wider text-[#3c4d2c]">
                    MANUAL DO CONVIDADO
                  </p>
                </div>
              </button>
            </div>
          </div>

          {renderModal()}
        </div>
      </div>

      {/* Divisória decorativa entre seções */}
      <div className="relative overflow-hidden">
        {/* Curva superior */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-full" preserveAspectRatio="none">
            <path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,90 C360,40 720,20 1080,60 L1440,90 L1440,0 L0,0 Z"
            ></path>
          </svg>
        </div>

        {/* Conteúdo da divisória */}
        <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#f8f5f0] to-white relative z-10">
          {/* Elementos decorativos de fundo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-32 h-32 md:w-40 md:h-40 bg-[#3c4d2c]/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-1/4 right-1/3 w-32 h-32 md:w-40 md:h-40 bg-[#3c4d2c]/5 rounded-full blur-xl"></div>
          </div>

          {/* Linha divisória com coração */}
          <div className="max-w-sm sm:max-w-md mx-auto relative px-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#3c4d2c]/30 to-transparent"></div>
            
            {/* Círculo com coração */}
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Brilho de fundo */}
                <div className="absolute -inset-3 bg-[#3c4d2c]/5 rounded-full blur-xl"></div>
                
                {/* Círculo principal */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-md border border-[#3c4d2c]/10 relative z-20">
                  {/* Elemento decorativo interno */}
                  <div className="absolute inset-1.5 bg-[#f8f5f0]/70 rounded-full"></div>
                  
                  {/* Ícone */}
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-[#3c4d2c] drop-shadow-sm relative z-30" />
                </div>
              </div>
            </div>
            
            {/* Texto decorativo */}
            <div className="text-center mt-10 sm:mt-12">
              <span className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-xs sm:text-sm text-[#3c4d2c] font-medium tracking-wider shadow-sm border border-[#3c4d2c]/10 inline-block">
                INFORMAÇÕES IMPORTANTES
              </span>
            </div>
          </div>

          {/* Setas indicativas */}
          <div className="flex justify-center mt-6">
            <div className="flex flex-col items-center animate-bounce">
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-[#3c4d2c]/70" />
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-[#3c4d2c]/40 -mt-3" />
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={manualSectionRef} 
        className="min-h-screen bg-gradient-to-b from-white to-[#f8f5f0]/30 py-8 px-4 overflow-x-hidden transition-all duration-500 ease-in-out"
      >
        <div className="max-w-4xl mx-auto">
          {/* Título com decoração - Versão mais decorada */}
          <div className="relative mb-10 text-center">
            {/* Elementos decorativos de fundo */}
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-[#3c4d2c]/10 rounded-full blur-3xl z-0 animate-pulse-slow"></div>
            <div className="absolute top-10 -left-10 w-40 h-40 bg-[#3c4d2c]/5 rounded-full blur-2xl z-0"></div>
            <div className="absolute top-10 -right-10 w-40 h-40 bg-[#3c4d2c]/5 rounded-full blur-2xl z-0"></div>
            
            {/* Imagens decorativas */}
            <div className="absolute -top-8 left-0 w-28 h-28 opacity-30 transform -rotate-15">
              <img src="/images/flores.png" alt="Decoração floral" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -top-8 right-0 w-28 h-28 opacity-30 transform rotate-15">
              <img src="/images/flores.png" alt="Decoração floral" className="w-full h-full object-contain" />
            </div>
            
            {/* Título principal com efeitos */}
            <div className="relative z-10 mx-auto">
              <div className="w-full h-24 mx-auto relative">
                {/* Fundo do título com gradiente */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c4d2c]/10 via-[#3c4d2c]/20 to-[#3c4d2c]/10 rounded-full blur-md"></div>
                
                {/* Círculo central com ícone */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/80 rounded-full blur-md"></div>
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg border border-[#3c4d2c]/20 flex items-center justify-center relative z-10">
                      <Book className="h-8 w-8 text-[#3c4d2c]" />
                    </div>
                  </div>
                </div>
                
                {/* Texto do título */}
                <div className="absolute bottom-0 left-0 right-0 transform translate-y-12">
                  <div className="bg-white/80 backdrop-blur-sm mx-auto w-fit px-8 py-3 rounded-full shadow-lg border border-[#3c4d2c]/20">
                    <h2 className="text-2xl font-serif text-[#3c4d2c] tracking-wide text-center font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                      Manual do Convidado
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Linhas decorativas */}
            <div className="flex items-center justify-center mt-16 relative z-10">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#3c4d2c]/70 to-transparent"></div>
              <div className="mx-2 flex items-center justify-center">
                <span className="text-[#3c4d2c] text-xl">❦</span>
              </div>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#3c4d2c]/70 to-transparent"></div>
            </div>
          </div>

          {/* Introdução - Card elegante com mais decoração */}
          <div className="text-center mb-12 bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-[#3c4d2c]/30 relative overflow-hidden">
            {/* Elementos decorativos de fundo */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#3c4d2c]/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#3c4d2c]/10 rounded-full blur-2xl"></div>
            
            {/* Decorações botânicas */}
            <img 
              src="/images/planta-removebg-preview.png" 
              alt="Decoração" 
              className="absolute -top-6 -right-6 w-32 h-32 object-contain opacity-30 rotate-15"
            />
            <img 
              src="/images/plantinha-removebg-preview.png" 
              alt="Decoração" 
              className="absolute -bottom-6 -left-6 w-32 h-32 object-contain opacity-30 -rotate-15"
            />
            
            {/* Conteúdo com borda interna */}
            <div className="relative z-10 p-4 border-2 border-[#3c4d2c]/10 rounded-2xl bg-gradient-to-b from-white/50 to-transparent">
              <h2 className="text-3xl font-serif text-[#3c4d2c] mb-3 font-bold relative z-10" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                Nosso Grande Dia
              </h2>
              
              {/* Decoração separadora estilizada */}
              <div className="relative h-6 my-3">
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-[#3c4d2c]/70 to-transparent"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full p-1 shadow-sm">
                    <div className="w-full h-full rounded-full border-2 border-[#3c4d2c]/30 flex items-center justify-center">
                      <span className="text-[#3c4d2c] text-xs">❦</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-gray-700 text-sm relative z-10 italic">
                Sejam muito bem-vindos ao nosso casamento!<br/>Estamos felizes por compartilhar esse momento especial com vocês.
              </p>
            </div>
            
            {/* Decoração inferior */}
            <div className="flex items-center justify-center mt-6 relative z-10">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#3c4d2c]/40 to-transparent"></div>
              <div className="mx-2 w-2 h-2 rounded-full bg-[#3c4d2c]/40"></div>
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#3c4d2c]/40 to-transparent"></div>
            </div>
          </div>

          <div className="prose max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#3c4d2c] prose-p:font-sans prose-p:text-gray-700">
            {/* Seção principal - Cards com sombras e efeitos */}
            <div className="space-y-6">
              {/* Cerimônia */}
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-md border border-[#3c4d2c]/10 transform transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.2 8.4c.5.38.8.97.8 1.6 0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2 0-.63.3-1.22.8-1.6l8-6c.75-.57 1.82-.57 2.57 0l7.83 6z" />
                      <path d="M2 12v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8" />
                      <path d="M9 22v-4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Cerimônia</h3>
                </div>
                <div className="pl-13 space-y-4 mt-4">
                  <div className="flex items-center bg-[#f8f5f0]/60 p-3 rounded-2xl">
                    <span className="text-xl text-[#3c4d2c] mr-3">⏰</span>
                    <div>
                      <span className="font-medium text-[#3c4d2c] block text-sm">Horário:</span>
                      <p className="text-gray-700 font-medium text-lg">16:00</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-[#f8f5f0]/60 p-3 rounded-2xl">
                    <span className="text-xl text-[#3c4d2c] mr-3">📍</span>
                    <div>
                      <span className="font-medium text-[#3c4d2c] block text-sm">Local:</span>
                      <p className="text-gray-700 font-medium">Nossoaconchego Eventos</p>
                      <p className="text-gray-600 text-xs">Av. Mendanha, 1495 - Centro - Viamão, RS</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 italic text-gray-600 text-xs border-t border-[#3c4d2c]/10 pt-3 px-2">
                  Pedimos que cheguem com antecedência para que possamos aproveitar juntos cada detalhe desse dia inesquecível.
                </p>
              </div>

              {/* Código de Vestimenta */}
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-md border border-[#3c4d2c]/10 transform transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.5 2h11l4 6h-19z"></path>
                      <path d="M6 8l-3 7h18l-3-7"></path>
                      <path d="M5.5 15h13v7h-13z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Código de Vestimenta</h3>
                </div>
                <div className="flex justify-center mt-4 mb-3">
                  <div className="px-6 py-2 bg-[#f8f5f0]/60 rounded-full">
                    <p className="text-xl font-serif font-semibold text-[#3c4d2c]">Traje Social</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-[#f8f5f0]/60 p-3 rounded-2xl">
                    <p className="text-center font-medium text-[#3c4d2c] text-sm mb-1">Homens</p>
                  </div>
                  <div className="bg-[#f8f5f0]/60 p-3 rounded-2xl">
                    <p className="text-center font-medium text-[#3c4d2c] text-sm mb-1">Mulheres</p>
                  </div>
                </div>
              </div>

              {/* Recepção - Card grande */}
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-md border border-[#3c4d2c]/10 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3c4d2c]/5 rounded-full blur-xl"></div>
                
                <div className="flex items-start gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Recepção – Rodízio de Pizza</h3>
                </div>
                
                <div className="relative z-10 mt-2">
                  <p className="mb-4 text-sm text-gray-700 bg-[#f8f5f0]/60 p-3 rounded-2xl">
                    Após a cerimônia, teremos a alegria de compartilhar um momento de comunhão e celebração com um delicioso rodízio de pizza.
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-[#f8f5f0]/80 p-4 rounded-2xl">
                      <h4 className="font-serif text-lg text-[#3c4d2c] mb-1 font-bold text-center" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Valor por pessoa</h4>
                      <div className="flex items-center justify-center">
                        <span className="text-3xl font-serif text-[#3c4d2c] mr-2 font-bold">R$80</span>
                        <span className="text-gray-600 text-xs">(pagamento até 15/08)</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#f8f5f0]/80 p-4 rounded-2xl">
                      <h4 className="font-serif text-lg text-[#3c4d2c] mb-2 font-bold text-center" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Crianças</h4>
                      <ul className="space-y-2 text-gray-700 text-xs">
                        <li className="flex items-center bg-white/70 p-2 rounded-xl">
                          <span className="w-2 h-2 rounded-full bg-[#3c4d2c] mr-2 flex-shrink-0"></span>
                          <div>
                            <span className="font-medium text-[#3c4d2c]">Até 4 anos:</span>
                            <span className="font-medium ml-1">Isentas</span>
                          </div>
                        </li>
                        <li className="flex items-center bg-white/70 p-2 rounded-xl">
                          <span className="w-2 h-2 rounded-full bg-[#3c4d2c] mr-2 flex-shrink-0"></span>
                          <div>
                            <span className="font-medium text-[#3c4d2c]">De 5 a 8 anos:</span>
                            <span className="font-medium ml-1">R$40</span>
                          </div>
                        </li>
                        <li className="flex items-center bg-white/70 p-2 rounded-xl">
                          <span className="w-2 h-2 rounded-full bg-[#3c4d2c] mr-2 flex-shrink-0"></span>
                          <div>
                            <span className="font-medium text-[#3c4d2c]">Acima de 8 anos:</span>
                            <span className="font-medium ml-1">R$80</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-[#3c4d2c]/10 pt-3 mt-3 italic text-gray-600 text-xs text-center relative z-10">
                  Agradecemos desde já pela compreensão e por fazerem parte desse momento tão especial e abençoado!
                </div>
              </div>

              {/* Confirmação de Presença */}
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-md border border-[#3c4d2c]/10 transform transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Confirmação de Presença</h3>
                </div>
                <div className="px-2 mt-3">
                  <div className="bg-[#f8f5f0]/60 p-3 rounded-2xl mb-4">
                    <p className="text-gray-700 text-center">
                      Para melhor organização, pedimos que confirmem sua presença até <span className="font-medium text-[#3c4d2c]">15/08</span>.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setActiveModal('rsvp')}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors text-sm font-medium shadow-md transform hover:scale-105 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      Confirmar Presença
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de Presentes */}
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-md border border-[#3c4d2c]/10 transform transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12v10H4V12"></path>
                      <path d="M2 7h20v5H2z"></path>
                      <path d="M12 22V7"></path>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Lista de Presentes</h3>
                </div>
                <div className="px-2 mt-3">
                  <div className="bg-[#f8f5f0]/60 p-3 rounded-2xl mb-4">
                    <p className="text-gray-700 text-center">
                      Caso desejem nos presentear, preparamos uma lista especial que pode ser acessada pelo botão abaixo.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <a 
                      href="https://www.querodecasamento.com.br/lista-de-casamento/eduardoevitoria2025"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-colors text-sm font-medium shadow-md transform hover:scale-105 transition-all"
                    >
                      <Gift size={18} />
                      Ver Lista de Presentes
                    </a>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-md border border-[#3c4d2c]/10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Contato para Dúvidas</h3>
                </div>
                
                <div className="flex flex-col gap-3 mt-4">
                  <a 
                    href="https://wa.me/5551994495406" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-[#f8f5f0]/80 rounded-2xl hover:bg-[#f8f5f0] transition-colors shadow-sm transform hover:scale-105 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366" className="mr-3 flex-shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.627-5.372-12-12-12zm.029 18.88a7.947 7.947 0 0 1-3.77-.954l-4.259 1.114 1.137-4.155a7.923 7.923 0 0 1-1.05-3.975c0-4.374 3.557-7.93 7.931-7.93 4.374 0 7.93 3.556 7.93 7.93 0 4.374-3.556 7.93-7.93 7.93l.011.04z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-[#3c4d2c] text-sm">WhatsApp</p>
                      <p className="text-gray-600 text-xs">(51) 98246-5709</p>
                    </div>
                  </a>
                  
                  <div className="flex items-center p-3 bg-[#f8f5f0]/80 rounded-2xl shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <div>
                      <p className="font-medium text-[#3c4d2c] text-sm">Email</p>
                      <p className="text-gray-600 text-xs">vitoriaeeduardo@email.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Citação final - Versão mais decorada */}
            <div className="text-center bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-[#3c4d2c]/30 mt-12 relative overflow-hidden">
              {/* Elementos decorativos de fundo */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#3c4d2c]/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#3c4d2c]/10 rounded-full blur-2xl"></div>
              
              {/* Imagens decorativas */}
              <img 
                src="/images/flores.png" 
                alt="Decoração floral" 
                className="absolute -bottom-6 -right-6 w-32 h-32 object-contain opacity-20 rotate-180"
              />
              <img 
                src="/images/plantinha-removebg-preview.png" 
                alt="Decoração" 
                className="absolute -top-6 -left-6 w-28 h-28 object-contain opacity-30 rotate-15"
              />
              
              {/* Moldura ornamental */}
              <div className="relative z-10 p-5 border-2 border-[#3c4d2c]/15 rounded-2xl bg-gradient-to-b from-white/60 to-white/30">
                {/* Ornamentos nos cantos da citação */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#3c4d2c]/30 rounded-tl-lg -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#3c4d2c]/30 rounded-tr-lg translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#3c4d2c]/30 rounded-bl-lg -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#3c4d2c]/30 rounded-br-lg translate-x-1 translate-y-1"></div>
                
                {/* Símbolo decorativo superior */}
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-white rounded-full p-1 shadow-sm">
                    <div className="w-full h-full rounded-full border-2 border-[#3c4d2c]/30 flex items-center justify-center">
                      <span className="text-[#3c4d2c] text-xs">❦</span>
                    </div>
                  </div>
                </div>

                <p className="italic text-lg font-serif text-[#3c4d2c] mb-3 relative z-10 font-semibold px-4" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                  "E tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens."
                </p>
                
                {/* Separador decorativo */}
                <div className="flex items-center justify-center my-3">
                  <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#3c4d2c]/70 to-transparent"></div>
                  <div className="mx-2 w-2 h-2 rounded-full bg-[#3c4d2c]/40"></div>
                  <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#3c4d2c]/70 to-transparent"></div>
                </div>
                
                <p className="text-gray-600 mb-3 relative z-10 text-xs">Colossenses 3:23</p>
                
                {/* Mensagem final com destaque */}
                <div className="mt-5 bg-[#3c4d2c]/10 px-4 py-3 rounded-full inline-block">
                  <p className="font-serif text-xl text-[#3c4d2c] relative z-10 font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                    Mal podemos esperar para celebrar com vocês! ❤️
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
