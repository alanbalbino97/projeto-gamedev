
function Particulas(context, jogo, x, y, cores) {
   this.context = context;
   this.jogo = jogo;
   this.tipo = 'efeito';
   this.particulas = [];
   for (var i=0; i<15; i++) {
      var angulo = Math.random()*Math.PI*2;
      var velocidade = 65+Math.random()*145;
      this.particulas.push({x:x,y:y,vx:Math.cos(angulo)*velocidade,
                           vy:Math.sin(angulo)*velocidade,
                           cor:cores[i%cores.length],lado:2+Math.random()*5});
   }
   this.duracao = 0.42;
   this.tempoRestante = this.duracao;
}
Particulas.prototype = {
   atualizar: function(dt) {
      this.tempoRestante -= dt;
      if (this.tempoRestante <= 0) { this.jogo.removerSprite(this); return; }
      for (var i=0; i<this.particulas.length; i++) {
         this.particulas[i].x += this.particulas[i].vx * dt;
         this.particulas[i].y += this.particulas[i].vy * dt;
      }
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();
      ctx.globalAlpha = Math.max(0,this.tempoRestante / this.duracao);
      for (var i=0; i<this.particulas.length; i++) {
         var p=this.particulas[i];
         ctx.fillStyle=p.cor;
         ctx.fillRect(p.x,p.y,p.lado,p.lado);
      }
      ctx.restore();
   }
};
