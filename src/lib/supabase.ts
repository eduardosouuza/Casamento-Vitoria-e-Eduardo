import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase com a URL e chave corretas
const supabaseUrl = 'https://naodgavykypfagfujdfy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hb2RnYXZ5a3lwZmFnZnVqZGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDMxNTcsImV4cCI6MjA2MzUxOTE1N30.uS8hPPkikaERNMwaehIW6ZNM6bsVpIrU3TheY-SADQw';

// Criando e exportando o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Definindo a interface para o presente (gift)
export interface GiftItem {
  id: number;
  name: string;
  description: string;
  reserved: boolean;
  imageurl: string; // Nome correto da coluna no banco
  reserved_by?: string;
  reserved_contact?: string;
  reserved_at?: string;
}

// Serviço para gerenciar presentes
export const giftService = {
  // Recuperar todos os presentes
  getAllGifts: async function() {
    const { data, error } = await supabase
      .from('gifts')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar presentes:', error);
      return [];
    }
    return data || [];
  },
  
  // Adicionar um novo presente com detecção automática de estrutura
  addGift: async function(gift: Omit<GiftItem, 'id'>) {
    try {
      console.log('Verificando estrutura da tabela gifts...');
      
      // Primeiro, vamos verificar se existem dados para ver a estrutura
      const { data: existingData, error: checkError } = await supabase
        .from('gifts')
        .select('*')
        .limit(1);
      
      let tableColumns: string[] = [];
      
      if (!checkError && existingData && existingData.length > 0) {
        tableColumns = Object.keys(existingData[0]);
        console.log('Colunas encontradas na tabela:', tableColumns);
      } else {
        console.log('Tabela vazia ou erro ao verificar:', checkError?.message);
        // Se não conseguirmos detectar, vamos usar os nomes mais comuns
        tableColumns = ['id', 'name', 'description', 'imageurl', 'reserved'];
      }
      
      // Criamos o objeto apenas com os campos que existem na tabela
      const giftData: any = {};
      
      // Campos obrigatórios
      if (tableColumns.includes('reserved')) {
        giftData.reserved = gift.reserved || false;
      }
      
      if (tableColumns.includes('imageurl') && gift.imageurl) {
        giftData.imageurl = gift.imageurl;
      }
      
      // Campo de nome - testamos variações
      if (gift.name) {
        if (tableColumns.includes('name')) {
          giftData.name = gift.name;
        } else if (tableColumns.includes('nome')) {
          giftData.nome = gift.name;
        } else if (tableColumns.includes('title')) {
          giftData.title = gift.name;
        } else if (tableColumns.includes('titulo')) {
          giftData.titulo = gift.name;
        }
      }
      
      // Campo de descrição - testamos variações
      if (gift.description) {
        if (tableColumns.includes('description')) {
          giftData.description = gift.description;
        } else if (tableColumns.includes('descricao')) {
          giftData.descricao = gift.description;
        } else if (tableColumns.includes('desc')) {
          giftData.desc = gift.description;
        } else if (tableColumns.includes('details')) {
          giftData.details = gift.description;
        }
      }
      
      console.log('Dados que serão inseridos:', giftData);
      
      const { data, error } = await supabase
        .from('gifts')
        .insert([giftData])
        .select();
      
      if (error) {
        console.error('Erro ao adicionar presente:', error);
        return null;
      }
      
      console.log('Presente adicionado com sucesso:', data?.[0]);
      return data?.[0] || null;
    } catch (e) {
      console.error('Exceção ao adicionar presente:', e);
      return null;
    }
  },
  
  // Função para testar a estrutura da tabela gifts
  testTableStructure: async function() {
    try {
      // Primeiro vamos tentar buscar um item para ver a estrutura
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Erro ao testar estrutura da tabela:', error);
        return { 
          success: false, 
          error: error.message,
          code: error.code 
        };
      }
      
      // Se tiver dados, vamos analisar os nomes das colunas
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        return {
          success: true,
          columns: columns,
          sample: data[0]
        };
      }
      
      return {
        success: true,
        columns: [],
        message: 'Tabela existe mas está vazia'
      };
      
    } catch (e) {
      console.error('Exceção ao verificar estrutura:', e);
      return { 
        success: false, 
        error: e instanceof Error ? e.message : 'Erro desconhecido',
        type: 'exception'
      };
    }
  },
  
  // Atualizar um presente existente com detecção automática de estrutura
  updateGift: async function(gift: GiftItem) {
    try {
      console.log('Atualizando presente com ID:', gift.id);
      
      // Verificar estrutura da tabela como na função addGift
      const { data: existingData, error: checkError } = await supabase
        .from('gifts')
        .select('*')
        .limit(1);
      
      let tableColumns: string[] = [];
      
      if (!checkError && existingData && existingData.length > 0) {
        tableColumns = Object.keys(existingData[0]);
        console.log('Colunas encontradas na tabela para update:', tableColumns);
      } else {
        // Se não conseguirmos detectar, vamos usar os nomes mais comuns
        tableColumns = ['id', 'name', 'description', 'imageurl', 'reserved', 'reserved_by', 'reserved_contact', 'reserved_at'];
      }
      
      // Criamos o objeto apenas com os campos que existem na tabela
      const giftData: any = {
        id: gift.id
      };
      
      // Campos obrigatórios
      if (tableColumns.includes('reserved')) {
        giftData.reserved = gift.reserved;
      }
      
      if (tableColumns.includes('imageurl') && gift.imageurl) {
        giftData.imageurl = gift.imageurl;
      }
      
      // Campo de nome - testamos variações
      if (gift.name) {
        if (tableColumns.includes('name')) {
          giftData.name = gift.name;
        } else if (tableColumns.includes('nome')) {
          giftData.nome = gift.name;
        } else if (tableColumns.includes('title')) {
          giftData.title = gift.name;
        } else if (tableColumns.includes('titulo')) {
          giftData.titulo = gift.name;
        }
      }
      
      // Campo de descrição - testamos variações
      if (gift.description) {
        if (tableColumns.includes('description')) {
          giftData.description = gift.description;
        } else if (tableColumns.includes('descricao')) {
          giftData.descricao = gift.description;
        } else if (tableColumns.includes('desc')) {
          giftData.desc = gift.description;
        } else if (tableColumns.includes('details')) {
          giftData.details = gift.description;
        }
      }
      
      // Campos de reserva
      if (gift.reserved_by && tableColumns.includes('reserved_by')) {
        giftData.reserved_by = gift.reserved_by;
      }
      if (gift.reserved_contact && tableColumns.includes('reserved_contact')) {
        giftData.reserved_contact = gift.reserved_contact;
      }
      if (gift.reserved_at && tableColumns.includes('reserved_at')) {
        giftData.reserved_at = gift.reserved_at;
      }
      
      console.log('Dados que serão atualizados:', giftData);
      
      const { data, error } = await supabase
        .from('gifts')
        .update(giftData)
        .eq('id', gift.id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar presente:', error);
        return null;
      }
      
      console.log('Presente atualizado com sucesso:', data?.[0]);
      return data?.[0] || null;
    } catch (e) {
      console.error('Exceção ao atualizar presente:', e);
      return null;
    }
  },
  
  // Reservar um presente
  reserveGift: async function(id: number, reservationInfo: { name: string, contact: string, message?: string }) {
    try {
      console.log('Reservando presente ID:', id, 'para:', reservationInfo.name);
      
      const updateData: any = {
        reserved: true,
        reserved_by: reservationInfo.name,
        reserved_contact: reservationInfo.contact,
        reserved_at: new Date().toISOString()
      };
      
      // Adicionar mensagem se fornecida
      if (reservationInfo.message) {
        updateData.reserved_message = reservationInfo.message;
      }
      
      const { data, error } = await supabase
        .from('gifts')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro ao reservar presente:', error);
        return null;
      }
      
      console.log('Presente reservado com sucesso:', data?.[0]);
      return data?.[0] || null;
    } catch (e) {
      console.error('Exceção ao reservar presente:', e);
      return null;
    }
  },
  
  // Remover a reserva de um presente
  unreserveGift: async function(id: number) {
    try {
      console.log('Removendo reserva do presente ID:', id);
      
      const { data, error } = await supabase
        .from('gifts')
        .update({
          reserved: false,
          reserved_by: null,
          reserved_contact: null,
          reserved_message: null,
          reserved_at: null
        })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro ao remover reserva:', error);
        return null;
      }
      
      console.log('Reserva removida com sucesso:', data?.[0]);
      return data?.[0] || null;
    } catch (e) {
      console.error('Exceção ao remover reserva:', e);
      return null;
    }
  },
  
  // Remover a reserva de todos os presentes
  unreserveAllGifts: async function() {
    try {
      console.log('Removendo todas as reservas...');
      
      const { data, error } = await supabase
        .from('gifts')
        .update({
          reserved: false,
          reserved_by: null,
          reserved_contact: null,
          reserved_message: null,
          reserved_at: null
        })
        .eq('reserved', true)
        .select();
      
      if (error) {
        console.error('Erro ao remover todas as reservas:', error);
        return [];
      }
      
      console.log('Todas as reservas removidas:', data?.length || 0, 'presentes');
      return data || [];
    } catch (e) {
      console.error('Exceção ao remover todas as reservas:', e);
      return [];
    }
  },
  
  // Excluir um presente
  deleteGift: async function(id: number) {
    try {
      console.log('Excluindo presente ID:', id);
      
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir presente:', error);
        return false;
      }
      
      console.log('Presente excluído com sucesso, ID:', id);
      return true;
    } catch (e) {
      console.error('Exceção ao excluir presente:', e);
      return false;
    }
  },
  
  // Upload de imagem para o Storage do Supabase
  uploadImage: async function(file: File, filePath: string) {
    const { data, error } = await supabase.storage
      .from('gift-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
    
    // Retorna a URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('gift-images')
      .getPublicUrl(filePath);
    
    console.log('URL da imagem gerada:', urlData.publicUrl);
    return urlData.publicUrl;
  },
  
  // Verificar credenciais de admin
  verifyAdmin: async function(username: string, password: string) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    // Comparação simples de senha (em produção usar hash)
    return data.password === password;
  }
}; 