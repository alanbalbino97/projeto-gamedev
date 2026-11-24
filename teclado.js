
var SETA_ESQUERDA = 37;
var SETA_ACIMA = 38;
var SETA_DIREITA = 39;
var SETA_ABAIXO = 40;
var ESPACO = 32;

function Teclado(elemento) {
   this.pressionadas = [];
   this.funcoesDisparo = [];
   var teclado = this;
   elemento.addEventListener('keydown', function(evento) {
      var tecla = evento.keyCode;
      if ([37, 38, 39, 40, 32].indexOf(tecla) >= 0) evento.preventDefault();
      if (!teclado.pressionadas[tecla] && teclado.funcoesDisparo[tecla])
         teclado.funcoesDisparo[tecla]();
      teclado.pressionadas[tecla] = true;
   });
   elemento.addEventListener('keyup', function(evento) {
      teclado.pressionadas[evento.keyCode] = false;
   });
   window.addEventListener('blur', function() { teclado.limpar(); });
}
Teclado.prototype = {
   pressionada: function(tecla) { return !!this.pressionadas[tecla]; },
   disparou: function(tecla, callback) { this.funcoesDisparo[tecla] = callback; },
   limpar: function() { this.pressionadas = []; },
   
   definir: function(tecla, pressionada) { this.pressionadas[tecla] = pressionada; }
};
