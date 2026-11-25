
function Fundo(context, imagem) {
   this.context = context;
   this.imagem = imagem;
   this.tipo = 'fundo';
   this.velocidade = 65;
   this.posicaoEmenda = 0;
}
Fundo.prototype = {
   atualizar: function(dt) {
      var altura = this.imagem.height * this.context.canvas.width / this.imagem.width;
      this.posicaoEmenda = (this.posicaoEmenda + this.velocidade * dt) % altura;
   },
   desenhar: function() {
      var ctx = this.context;
      var largura = ctx.canvas.width;
      var altura = this.imagem.height * largura / this.imagem.width;
      for (var y = this.posicaoEmenda - altura; y < ctx.canvas.height; y += altura)
         ctx.drawImage(this.imagem, 0, Math.floor(y), largura, Math.ceil(altura) + 1);
   }
};
