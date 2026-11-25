
(function() {
   'use strict';
   var canvas = document.getElementById('canvas_nave');
   var context = canvas.getContext('2d');
   var teclado = new Teclado(document);
   var estado = document.getElementById('estado');
   var botaoPausa = document.getElementById('pausar');
   var sobreposicao = document.getElementById('fim-overlay');
   var formulario = document.getElementById('form-ranking');
   var nomeJogador = document.getElementById('nome-jogador');
   var erroRanking = document.getElementById('erro-ranking');
   var resultadoRanking = document.getElementById('resultado-ranking');
   var mensagemRanking = document.getElementById('mensagem-ranking');
   var ranking = new Ranking();
   var jogoAtual = null;
   var imagens = {};

   function atualizarRanking() {
      var lista = document.getElementById('lista-ranking');
      var recorde = document.getElementById('melhor-placar');
      var melhores = ranking.listar();
      lista.textContent = '';
      if (!melhores.length) {
         var vazio = document.createElement('li');
         vazio.className = 'vazio';
         vazio.textContent = 'Ainda não há pontuações. Seja o primeiro!';
         lista.appendChild(vazio);
         recorde.textContent = 'Nenhum recorde ainda.';
      } else {
         recorde.textContent = melhores[0].nome + ' — ' + melhores[0].pontos + ' ponto(s)';
         melhores.forEach(function(item, indice) {
            var li = document.createElement('li');
            var posicao = document.createElement('span');
            var nome = document.createElement('span');
            var pontos = document.createElement('span');
            posicao.className = 'pos';
            nome.className = 'nome';
            pontos.className = 'score';
            posicao.textContent = String(indice + 1) + 'º';
            nome.textContent = item.nome;
            pontos.textContent = String(item.pontos) + ' pts';
            li.appendChild(posicao);
            li.appendChild(nome);
            li.appendChild(pontos);
            lista.appendChild(li);
         });
      }
      if (!ranking.persistente) {
         document.getElementById('nota-ranking').textContent =
            'Este navegador não permitiu salvar o ranking. As pontuações desta sessão podem desaparecer ao fechar a página.';
      } else {
         document.getElementById('nota-ranking').textContent =
            'O ranking guarda os 10 melhores resultados neste navegador. Ele não é compartilhado com outros aparelhos.';
      }
   }

   function mostrarFim(pontos) {
      teclado.limpar();
      botaoPausa.disabled = true;
      document.getElementById('pontos-finais').textContent = pontos;
      nomeJogador.value = '';
      erroRanking.textContent = '';
      formulario.hidden = false;
      resultadoRanking.hidden = true;
      sobreposicao.hidden = false;
      estado.textContent = 'Fim de jogo! Digite seu nome e salve sua pontuação.';
      nomeJogador.focus({preventScroll:true});
   }

   function carregarImagem(nome, caminho) {
      return new Promise(function(resolve, reject) {
         var img = new Image();
         img.onload = function() { imagens[nome] = img; resolve(); };
         img.onerror = function() { reject(new Error('Não foi possível carregar ' + caminho)); };
         img.src = caminho;
      });
   }

   function novoJogo() {
      if (jogoAtual) jogoAtual.animacao.desligar();
      if (document.activeElement === nomeJogador) nomeJogador.blur();
      teclado.limpar();
      sobreposicao.hidden = true;
      formulario.hidden = false;
      resultadoRanking.hidden = true;
      erroRanking.textContent = '';
      jogoAtual = new Jogo(context, teclado, imagens, mostrarFim, ranking);
      jogoAtual.iniciar();
      botaoPausa.disabled = false;
      botaoPausa.textContent = 'Ⅱ Pausar (P)';
      estado.textContent = 'Jogo iniciado! Colete a estrela ou a chave de boca.';
   }

   formulario.addEventListener('submit', function(evento) {
      evento.preventDefault();
      if (!jogoAtual || !jogoAtual.terminou || formulario.hidden) return;
      try {
         var resultado = ranking.registrar(nomeJogador.value, jogoAtual.pontos);
         atualizarRanking();
         formulario.hidden = true; 
         resultadoRanking.hidden = false;
         if (!resultado.entrou) {
            mensagemRanking.textContent = 'Resultado registrado, mas não ficou entre os 10 melhores.';
         } else if (resultado.recorde) {
            mensagemRanking.textContent = '🏆 Novo recorde! ' + resultado.nome + ' está em 1º lugar!';
         } else {
            mensagemRanking.textContent = 'Salvo! ' + resultado.nome + ' ficou em ' + resultado.posicao + 'º lugar.';
         }
         if (!ranking.persistente) mensagemRanking.textContent += ' (Apenas nesta sessão.)';
         estado.textContent = 'Pontuação registrada! Veja o ranking e jogue novamente.';
      } catch (erro) {
         erroRanking.textContent = erro.message;
      }
   });

   document.getElementById('jogar-de-novo').addEventListener('click', novoJogo);
   document.getElementById('reiniciar').addEventListener('click', function() {
      if (imagens.nave) novoJogo();
   });
   function pausar() {
      if (!jogoAtual || jogoAtual.terminou) return;
      jogoAtual.alternarPausa();
      botaoPausa.textContent = jogoAtual.pausado ? '▶ Continuar (P)' : 'Ⅱ Pausar (P)';
      estado.textContent = jogoAtual.pausado ? 'Jogo pausado.' : 'Jogo em andamento.';
   }
   botaoPausa.addEventListener('click', pausar);
   teclado.disparou(80, pausar); 
   document.addEventListener('visibilitychange', function() {
      if (document.hidden && jogoAtual && !jogoAtual.pausado && !jogoAtual.terminou) pausar();
   });

   
   document.querySelectorAll('[data-tecla]').forEach(function(botao) {
      var codigo = Number(botao.getAttribute('data-tecla'));
      botao.addEventListener('pointerdown', function(evento) {
         evento.preventDefault();
         botao.setPointerCapture(evento.pointerId);
         teclado.definir(codigo, true);
      });
      function soltar() { teclado.definir(codigo, false); }
      botao.addEventListener('pointerup', soltar);
      botao.addEventListener('pointercancel', soltar);
      botao.addEventListener('lostpointercapture', soltar);
   });

   atualizarRanking();
   Promise.all([
      carregarImagem('fundo', 'img/fundo-infinito.jpg'),
      carregarImagem('nave', 'img/nave.png'),
      carregarImagem('ovni', 'img/ovni.png'),
      carregarImagem('estrela', 'img/estrela.png'),
      carregarImagem('chave', 'img/chave.png'),
      carregarImagem('escudo', 'img/escudo.png')
   ]).then(novoJogo).catch(function(erro) {
      estado.textContent = erro.message + '. Extraia o ZIP mantendo a pasta img.';
      estado.style.color = '#ffa4a4';
   });
})();
