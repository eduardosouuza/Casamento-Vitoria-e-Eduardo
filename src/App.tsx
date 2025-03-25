import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Heart, Gift, X, ChevronDown, Book } from "lucide-react";
import { Link } from 'react-router-dom';

function App() {
  const [activeModal, setActiveModal] = useState<'location' | 'rsvp' | 'gifts' | null>(null);
  const manualSectionRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0
  });

  // Data do evento - 20 de Setembro de 2025 às 17h
  // No JavaScript, os meses começam do 0 (janeiro = 0, setembro = 8)
  const eventDate = new Date(2025, 8, 20, 17, 0, 0).getTime();

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

  const handleCloseModal = () => setActiveModal(null);

  const scrollToManual = () => {
    manualSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
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
            <p className="mb-4">Para confirmar sua presença, entre em contato:</p>
            <div className="space-y-4">
              <a 
                href="https://wa.me/5551982465709" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-white hover:text-[#25D366] hover:border-[#25D366] border-2 border-[#25D366] transition-all duration-300 shadow-md font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="lucide lucide-whatsapp">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.627-5.372-12-12-12zm.029 18.88a7.947 7.947 0 0 1-3.77-.954l-4.259 1.114 1.137-4.155a7.923 7.923 0 0 1-1.05-3.975c0-4.374 3.557-7.93 7.931-7.93 4.374 0 7.93 3.556 7.93 7.93 0 4.374-3.556 7.93-7.93 7.93l.011.04z"/>
                </svg>
                Confirmar pelo WhatsApp
              </a>
              <p>Email: vitoriaeeduardo@email.com</p>
            </div>
            <div className="mt-6 p-4 bg-[#f8f5f0] rounded-lg">
              <p className="font-serif text-base font-bold text-[#3c4d2c]">Informações importantes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Valor: <span className="font-medium">R$ 80,00</span> por pessoa</li>
                <li>Prazo: até <span className="font-medium">15/08</span></li>
                <li>Inclui: Rodízio completo de pizzas</li>
              </ul>
            </div>
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
                <Link 
                  to="/lista-presentes" 
                  className="inline-block px-6 py-2 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-colors font-medium"
                >
                  Ver Lista Online
                </Link>
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
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-elegant overflow-hidden">
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
              <div className="flex items-center gap-4 relative">
                <div className="h-[1px] w-16 bg-[#3c4d2c]/30"></div>
                <div className="text-center">
                  <p className="text-sm font-sans font-light tracking-widest text-gray-700">SÁBADO</p>
                  <p className="text-4xl font-script text-[#3c4d2c]">20</p>
                  <p className="text-sm font-sans font-light tracking-widest text-gray-700">17H</p>
                </div>
                <div className="h-[1px] w-16 bg-[#3c4d2c]/30"></div>
                
                {/* Imagem da planta em aquarela */}
                <div className="absolute -right-36 -top-10 w-48 h-48 pointer-events-none z-10 transform rotate-3 opacity-95 animate-slow-fade-in">
                  <img 
                    src="/images/planta-removebg-preview.png" 
                    alt="Decoração botânica" 
                    className="w-full h-full object-contain select-none"
                    style={{ filter: "drop-shadow(0 3px 8px rgba(60,77,44,0.2))" }}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4 font-sans font-light tracking-widest text-sm text-gray-700">
                <p>SETEMBRO</p>
                <p>2025</p>
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
        className="min-h-screen bg-gradient-to-b from-white to-[#f8f5f0]/30 py-8 sm:py-12 px-4 sm:px-6 md:py-16 md:px-8 overflow-x-hidden transition-all duration-500 ease-in-out"
      >
        <div className="max-w-4xl mx-auto">
          {/* Título com decoração */}
          <div className="relative mb-12 sm:mb-16 text-center">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-12 bg-[#3c4d2c]/5 blur-xl rounded-full z-0"></div>
            <div className="flex items-center justify-center relative z-10">
              <div className="h-[1px] w-8 sm:w-12 md:w-16 bg-[#3c4d2c]/40"></div>
              <div className="mx-2 sm:mx-4 flex items-center justify-center bg-white/70 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-full shadow-sm">
                <Book className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#3c4d2c] mr-2 sm:mr-3" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#3c4d2c] tracking-wide text-center font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>Manual do Convidado</h2>
              </div>
              <div className="h-[1px] w-8 sm:w-12 md:w-16 bg-[#3c4d2c]/40"></div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#3c4d2c] prose-p:font-sans prose-p:text-gray-700">
            {/* Introdução */}
            <div className="text-center mb-8 sm:mb-12 bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-[#3c4d2c]/10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#3c4d2c] mb-4 sm:mb-6 font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                Nosso Grande Dia
              </h2>
              <div className="w-24 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-[#3c4d2c]/30 to-transparent mx-auto mb-4 sm:mb-6"></div>
              <p className="mt-4 text-gray-700 text-sm sm:text-base md:text-lg">
                Sejam muito bem-vindos ao nosso casamento! Estamos felizes por compartilhar esse momento especial com vocês. 
                Para que tudo ocorra da melhor forma, reunimos algumas informações importantes.
              </p>
            </div>

            {/* Grid de informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Cerimônia */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#3c4d2c]/10 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.2 8.4c.5.38.8.97.8 1.6 0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2 0-.63.3-1.22.8-1.6l8-6c.75-.57 1.82-.57 2.57 0l7.83 6z" />
                      <path d="M2 12v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8" />
                      <path d="M9 22v-4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v4" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.1)" }}>Cerimônia</h3>
                </div>
                <div className="space-y-3 ml-14">
                  <div className="flex items-start">
                    <span className="font-medium text-[#3c4d2c] mr-2">⏰</span>
                    <div>
                      <span className="font-medium text-[#3c4d2c]">Horário:</span>
                      <p className="text-gray-700">17:00</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-[#3c4d2c] mr-2">📍</span>
                    <div>
                      <span className="font-medium text-[#3c4d2c]">Local:</span>
                      <p className="text-gray-700">Nossoaconchego Eventos,<br />Av. Mendanha, 1495 - Centro - Viamão, RS</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 italic text-gray-600 text-xs sm:text-sm border-t border-[#3c4d2c]/10 pt-3">
                  Pedimos que cheguem com antecedência para que possamos aproveitar juntos cada detalhe desse dia inesquecível.
                </p>
              </div>

              {/* Código de Vestimenta */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#3c4d2c]/10 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.5 2h11l4 6h-19z"></path>
                      <path d="M6 8l-3 7h18l-3-7"></path>
                      <path d="M5.5 15h13v7h-13z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.1)" }}>Código de Vestimenta</h3>
                </div>
                <div className="py-6 text-center">
                  <p className="text-lg sm:text-xl font-semibold text-[#3c4d2c]">Traje Esporte Fino</p>
                </div>
                <div className="mt-4 italic text-gray-600 text-xs sm:text-sm border-t border-[#3c4d2c]/10 pt-3">
                  <p>Para os homens: Calça social, camisa e sapato.</p>
                  <p>Para as mulheres: Vestido ou conjunto elegante.</p>
                </div>
              </div>
            </div>

            {/* Recepção - Card grande */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#3c4d2c]/10 mb-8 sm:mb-12 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3c4d2c]/5 rounded-full blur-xl"></div>
              
              <div className="flex items-center mb-5 sm:mb-6 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.1)" }}>Recepção – Rodízio de Pizza</h3>
              </div>
              
              <div className="sm:ml-16 relative z-10">
                <p className="mb-5 sm:mb-6 text-sm sm:text-base md:text-lg text-gray-700">
                  Após a cerimônia, teremos a alegria de compartilhar um momento de comunhão e celebração com um delicioso rodízio de pizza.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="bg-[#f8f5f0]/50 p-4 rounded-xl">
                    <h4 className="font-serif text-lg sm:text-xl text-[#3c4d2c] mb-2 sm:mb-3 font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Valor por pessoa</h4>
                    <div className="flex items-center">
                      <span className="text-2xl sm:text-3xl font-serif text-[#3c4d2c] mr-2 font-bold">R$80</span>
                      <span className="text-gray-600 text-xs sm:text-sm">(pagamento até 15/08)</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#f8f5f0]/50 p-4 rounded-xl">
                    <h4 className="font-serif text-lg sm:text-xl text-[#3c4d2c] mb-2 sm:mb-3 font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}>Crianças</h4>
                    <ul className="space-y-1 text-gray-700 text-xs sm:text-sm">
                      <li className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#3c4d2c] mr-2 flex-shrink-0"></span>
                        Até 4 anos: <span className="font-medium ml-1">Isentas</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#3c4d2c] mr-2 flex-shrink-0"></span>
                        De 5 a 8 anos: <span className="font-medium ml-1">Valor reduzido (R$40)</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#3c4d2c] mr-2 flex-shrink-0"></span>
                        Acima de 8 anos: <span className="font-medium ml-1">Valor integral (R$80)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-[#3c4d2c]/10 pt-4 mt-4 sm:mt-6 italic text-gray-600 text-xs sm:text-sm text-center">
                Agradecemos desde já pela compreensão e por fazerem parte desse momento tão especial e abençoado!
              </div>
            </div>

            {/* Informações adicionais em grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Confirmação de Presença */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#3c4d2c]/10 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.1)" }}>Confirmação de Presença</h3>
                </div>
                <div className="ml-14">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700">
                    Para melhor organização, pedimos que confirmem sua presença até <span className="font-medium text-[#3c4d2c]">15/08</span>.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <a 
                      href="https://wa.me/5551982465709" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors text-xs sm:text-sm font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      Confirmar pelo WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Lista de Presentes */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#3c4d2c]/10 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12v10H4V12"></path>
                      <path d="M2 7h20v5H2z"></path>
                      <path d="M12 22V7"></path>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.1)" }}>Lista de Presentes</h3>
                </div>
                <div className="ml-14">
                  <p className="text-sm sm:text-base md:text-lg text-gray-700">
                    Caso desejem nos presentear, preparamos uma lista especial que pode ser acessada pelo botão abaixo.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Link 
                      to="/lista-presentes"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#3c4d2c] text-white rounded-full hover:bg-[#2f3c22] transition-colors text-xs sm:text-sm font-medium"
                    >
                      <Gift size={16} />
                      Ver Lista de Presentes
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#3c4d2c]/10 mb-8 sm:mb-12">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#3c4d2c]/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#3c4d2c] font-bold" style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.1)" }}>Contato para Dúvidas</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 ml-0 sm:ml-14 mt-4">
                <a 
                  href="https://wa.me/5551982465709" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-[#f8f5f0]/50 rounded-lg hover:bg-[#f8f5f0] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#25D366" className="mr-3 flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.627-5.372-12-12-12zm.029 18.88a7.947 7.947 0 0 1-3.77-.954l-4.259 1.114 1.137-4.155a7.923 7.923 0 0 1-1.05-3.975c0-4.374 3.557-7.93 7.931-7.93 4.374 0 7.93 3.556 7.93 7.93 0 4.374-3.556 7.93-7.93 7.93l.011.04z"/>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">WhatsApp</p>
                    <p className="text-gray-600 text-xs sm:text-sm">(51) 98246-5709</p>
                  </div>
                </a>
                
                <div className="flex items-center p-3 bg-[#f8f5f0]/50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3c4d2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">Email</p>
                    <p className="text-gray-600 text-xs sm:text-sm">vitoriaeeduardo@email.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Citação final */}
            <div className="text-center bg-white/70 backdrop-blur-sm p-5 sm:p-8 rounded-2xl shadow-sm border border-[#3c4d2c]/10 mt-8 sm:mt-12 relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#3c4d2c]/5 rounded-full blur-xl"></div>
              <p className="italic text-lg sm:text-xl md:text-2xl font-serif text-[#3c4d2c] mb-4 sm:mb-6 relative z-10 font-semibold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                "E tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens."
              </p>
              <p className="text-gray-600 mb-6 sm:mb-8 relative z-10 text-sm">Colossenses 3:23</p>
              <div className="w-24 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-[#3c4d2c]/30 to-transparent mx-auto mb-6 sm:mb-8"></div>
              <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#3c4d2c] relative z-10 font-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                Mal podemos esperar para celebrar com vocês! ❤️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;